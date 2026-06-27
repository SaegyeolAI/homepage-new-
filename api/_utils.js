require("dotenv").config();
const path = require("path");
const nodemailer = require("nodemailer");

const RECIPIENT = "contact@saegyeol.ai.kr";
const MAX_NAME = 100;
const MAX_MESSAGE = 5000;
// 파일 업로드 크기 제한: Vercel 서버리스 함수의 request body 한도(4.5MB)와 일치시킨다.
// 이보다 큰 값을 설정해도 플랫폼 단에서 거부되므로 프론트엔드와 동일하게 유지할 것.
const FILE_LIMIT = 4.5 * 1024 * 1024;

const sanitizeHeader = (s) => String(s).replace(/[\r\n]/g, "");

// CSRF 완화: 상태변경(POST) 요청의 Origin을 허용 목록과 대조한다.
// 브라우저는 cross-site로 폼/fetch를 보낼 때 항상 Origin 헤더를 붙이므로,
// 허용 도메인과 다른 Origin이면 차단한다(=타 사이트發 위조 요청 차단).
// ALLOWED_ORIGIN(쉼표 구분) 미설정 시 통과 — server.js와 동일한 환경변수 사용.
// 통과 시 null, 차단 시 에러 메시지 문자열을 반환한다.
function checkOrigin(req) {
  const allowed = (process.env.ALLOWED_ORIGIN || "")
    .split(",").map((o) => o.trim()).filter(Boolean);
  if (allowed.length === 0) return null; // 미설정 시 통과
  const origin = req.headers.origin;
  if (origin) {
    return allowed.includes(origin) ? null : "허용되지 않은 출처의 요청입니다.";
  }
  // Origin이 없으면 Referer로 폴백. 브라우저發 CSRF 공격은 항상 Origin이 붙으므로
  // Origin·Referer가 모두 없는 경우(비브라우저 클라이언트)는 통과시킨다.
  const referer = req.headers.referer;
  if (referer) {
    return allowed.some((a) => referer === a || referer.startsWith(a + "/"))
      ? null : "허용되지 않은 출처의 요청입니다.";
  }
  return null;
}

const sanitizeFilename = (name) =>
  path.basename(String(name)).replace(/[^\w\s.\-]/g, "_").trim() || "attachment";

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const MIME_EXT_MAP = {
  "application/pdf": [".pdf"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};
const ALLOWED_MIMES = new Set(Object.keys(MIME_EXT_MAP));

// Returns an error string if the file is invalid, null if valid.
function validateFile(file) {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return "허용되지 않는 파일 형식입니다.";
  }
  const ext = path.extname(file.originalFilename || "").toLowerCase();
  if (!(MIME_EXT_MAP[file.mimetype] ?? []).includes(ext)) {
    return "파일 확장자와 형식이 일치하지 않습니다.";
  }
  return null;
}

// Singleton: created once per cold start, reused across warm invocations.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = {
  RECIPIENT,
  MAX_NAME,
  MAX_MESSAGE,
  FILE_LIMIT,
  sanitizeHeader,
  sanitizeFilename,
  escapeHtml,
  validateFile,
  checkOrigin,
  transporter,
};
