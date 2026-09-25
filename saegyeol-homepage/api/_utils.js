require("dotenv").config();
const path = require("path");
const fsp = require("fs").promises;
const nodemailer = require("nodemailer");
const {
  RATE_LIMIT, FILE_LIMIT, MAX_NAME, MAX_MESSAGE,
  CONTACT_EMAIL, ALLOWED_UPLOADS, MESSAGES,
} = require("./_config");
const { rateLimitConfigured } = require("./_ratelimit");

const RECIPIENT = CONTACT_EMAIL;
const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

const sanitizeHeader = (s) => String(s).replace(/[\r\n]/g, "");

/* ---------------- 환경변수 fail-closed ---------------- */

// 운영(VERCEL_ENV=production)에서 Origin 허용목록이나 Upstash 설정이 비어 있으면
// 폼을 아예 막는다. 예전에는 둘 다 "없으면 통과"라서, 환경변수 오타 하나로
// CSRF 방어와 rate limit이 동시에 조용히 사라졌다.
// 프리뷰·로컬은 그대로 통과시켜 개발을 막지 않는다.
function allowedOrigins() {
  return (process.env.ALLOWED_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
}

function checkConfigured() {
  if (!IS_PRODUCTION) return null;
  const missing = [];
  if (allowedOrigins().length === 0) missing.push("ALLOWED_ORIGIN");
  if (!rateLimitConfigured()) missing.push("UPSTASH_REDIS_REST_URL/TOKEN");
  if (missing.length === 0) return null;
  console.error(`[config] 운영 환경에 필수 환경변수가 없어 폼을 차단합니다: ${missing.join(", ")}`);
  return MESSAGES.notConfigured;
}

/* ---------------- Origin 검사 (CSRF 완화) ---------------- */

// 브라우저는 cross-site로 폼·fetch를 보낼 때 항상 Origin을 붙이므로,
// 허용 도메인과 다르면 차단한다(= 타 사이트發 위조 요청 차단).
// Origin·Referer가 모두 없는 비브라우저 클라이언트는 통과한다 —
// CSRF의 대상이 아니기 때문이다. 스크립트 스팸은 rate limit과 허니팟이 맡는다.
function checkOrigin(req) {
  const allowed = allowedOrigins();
  if (allowed.length === 0) return null; // 운영에서는 checkConfigured가 먼저 막는다
  const origin = req.headers.origin;
  if (origin) return allowed.includes(origin) ? null : MESSAGES.badOrigin;
  const referer = req.headers.referer;
  if (referer) {
    return allowed.some((a) => referer === a || referer.startsWith(a + "/"))
      ? null : MESSAGES.badOrigin;
  }
  return null;
}

/* ---------------- 파일명 ---------------- */

// \w 는 ASCII 전용이라 예전에는 "이력서.pdf"가 "_____.pdf"로 망가졌다.
// \p{L}/\p{N} 으로 바꿔 한글 파일명을 살린다. 경로 순회와 개행은 계속 막는다.
const sanitizeFilename = (name) =>
  path.basename(String(name))
    .replace(/[\r\n\0]/g, "")
    .replace(/[^\p{L}\p{N}\s._-]/gu, "_")
    .trim() || "attachment";

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

/* ---------------- 파일 내용 판별 ---------------- */

// ZIP 중앙 디렉터리를 직접 훑어 들어 있는 항목 이름만 읽는다.
// 항목 이름은 압축되지 않은 채 저장되므로 압축 해제가 필요 없고,
// 그래서 외부 의존성 없이 처리할 수 있다.
// ZIP64나 형식이 깨진 파일은 null을 반환해 거부 쪽으로 보낸다.
const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const MAX_ZIP_ENTRIES = 5000;

function readZipEntryNames(buf) {
  if (buf.length < 22) return null;
  let eocd = -1;
  const floor = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= floor; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) return null;

  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  // 0xFFFF/0xFFFFFFFF 는 ZIP64 표식이다. 4.5MB 한도의 오피스 파일에는 나오지 않는다.
  if (count === 0xffff || offset === 0xffffffff || count > MAX_ZIP_ENTRIES) return null;

  const names = [];
  for (let i = 0; i < count; i++) {
    if (offset + 46 > buf.length) return null;
    if (buf.readUInt32LE(offset) !== CENTRAL_SIG) return null;
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    if (offset + 46 + nameLen > buf.length) return null;
    names.push(buf.toString("utf8", offset + 46, offset + 46 + nameLen));
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}

// docx/pptx는 시그니처가 일반 zip과 같은 PK\x03\x04라, 시그니처만 보면
// 이름만 .docx로 바꾼 zip이 그대로 통과한다. OPC 규격이 요구하는
// [Content_Types].xml 과 파트 디렉터리(word/ · ppt/)까지 확인한다.
function classifyZip(buf) {
  const names = readZipEntryNames(buf);
  if (!names) return null;
  if (!names.includes("[Content_Types].xml")) return null;
  if (names.some((n) => n.startsWith("word/"))) return "docx";
  if (names.some((n) => n.startsWith("ppt/"))) return "pptx";
  return null; // xlsx나 맨 zip은 축소안에서 허용하지 않는다
}

// 파일 내용만 보고 실제 종류를 판별한다. MIME과 확장자는 클라이언트가
// 마음대로 적어 보내는 값이라 판별 근거로 쓰지 않는다.
function detectFileKind(buf) {
  if (buf.length < 4) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  // PDF 헤더는 앞쪽 1024바이트 안에 있으면 된다(규격 허용 범위).
  if (buf.slice(0, 1024).includes("%PDF-")) return "pdf";
  if (buf[0] === 0x50 && buf[1] === 0x4b) return classifyZip(buf);
  return null;
}

// 내용·MIME·확장자 세 가지가 모두 같은 종류를 가리킬 때만 통과시킨다.
// 통과 시 null, 거부 시 사용자에게 보여줄 한글 문구를 반환한다.
function validateUpload(file, buf) {
  const ext = path.extname(file.originalFilename || "").toLowerCase();
  const declared = ALLOWED_UPLOADS.find(
    (u) => u.mime.includes(file.mimetype) && u.ext.includes(ext)
  );
  if (!declared) return MESSAGES.uploadBadType;

  const actual = detectFileKind(buf);
  if (!actual || actual !== declared.kind) return MESSAGES.uploadBadContent;
  return null;
}

/* ---------------- 업로드 임시 파일 ---------------- */

// formidable은 파싱에 실패했을 때만 임시 파일을 지운다. 성공 경로에는
// 삭제가 없어 Vercel /tmp(512MB)에 첨부파일이 평문으로 쌓였다.
// 어느 경로로 빠져나가든 지우도록 핸들러의 finally에서 부른다.
async function cleanupUpload(file) {
  if (!file || !file.filepath) return;
  try {
    await fsp.unlink(file.filepath);
  } catch (err) {
    if (err.code !== "ENOENT") console.error("[cleanup] 임시 파일 삭제 실패:", err.code);
  }
}

/* ---------------- 봇 걸러내기 (허니팟) ---------------- */

// 사람 눈에 보이지 않는 입력 칸과, 폼이 그려진 시각.
// 채워져 있거나 너무 빨리 제출되면 메일을 보내지 않는다.
// 봇에게 실패를 알리지 않으려고 응답은 성공(200)과 똑같이 돌려준다.
const HONEYPOT_FIELD = "company_site";
const MIN_FILL_MS = 3000;

function detectBot(fields) {
  const trap = (fields[HONEYPOT_FIELD]?.[0] ?? "").trim();
  if (trap) return "honeypot-filled";
  const startedAt = Number(fields.form_ts?.[0]);
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt;
    // 음수는 기기 시계가 어긋난 경우다. 봇으로 보지 않는다.
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return "too-fast";
  }
  return null;
}

// 입력값은 로그에 남기지 않는다. 사유와 건수만 남긴다.
function logBot(scope, reason) {
  console.warn(`[honeypot] ${scope} 차단 1건 (사유: ${reason})`);
}

/* ---------------- 메일 본문 머리말 ---------------- */

// 폼으로 들어온 값은 누구든 아무렇게나 적어 보낼 수 있다.
// 우리 도메인에서 우리 메일함으로 도착해 내부 메일처럼 보이기 쉬우니,
// 본문 맨 위에 외부 입력임을 못박는다.
const EXTERNAL_BANNER_TEXT =
  "[주의] 웹사이트 문의 폼으로 들어온 외부 입력입니다.\n" +
  "       발신자 정보는 검증되지 않았습니다. 회신 주소를 확인하세요.\n" +
  "----------------------------------------\n\n";

const EXTERNAL_BANNER_HTML =
  '<div style="border-left:3px solid #d97706;background:#fffbeb;color:#78350f;' +
  'padding:10px 14px;margin:0 0 16px;font-size:13px;line-height:1.6">' +
  "<strong>웹사이트 문의 폼으로 들어온 외부 입력입니다.</strong><br/>" +
  "발신자 정보는 검증되지 않았습니다. 회신 주소를 확인하세요." +
  "</div>";

/* ---------------- SMTP ---------------- */

// 콜드 스타트마다 한 번 만들고 웜 인보케이션에서 재사용한다.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  requireTLS: String(process.env.SMTP_SECURE).toLowerCase() !== "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ---------------- 파싱 오류 ---------------- */

// formidable의 내부 메시지(영문, 파서 상태·한도 바이트 포함)는 내보내지 않는다.
// 사용자에게는 고정 한글 문구만, 원인은 서버 로그에만 남긴다.
function describeParseError(err, scope) {
  const tooBig = err.httpCode === 413 || /maxFileSize|maxTotalFileSize/i.test(err.message || "");
  console.error(`[${scope}] 업로드 파싱 실패:`, err.code || err.httpCode || "", err.message);
  return tooBig
    ? { status: 413, error: MESSAGES.uploadTooLarge }
    : { status: 400, error: MESSAGES.parseFailed };
}

module.exports = {
  RECIPIENT, MAX_NAME, MAX_MESSAGE, FILE_LIMIT, RATE_LIMIT, MESSAGES, CONTACT_EMAIL,
  IS_PRODUCTION,
  sanitizeHeader, sanitizeFilename, escapeHtml,
  detectFileKind, validateUpload, readZipEntryNames,
  checkOrigin, checkConfigured, cleanupUpload,
  detectBot, logBot, HONEYPOT_FIELD,
  EXTERNAL_BANNER_TEXT, EXTERNAL_BANNER_HTML,
  describeParseError, transporter,
};
