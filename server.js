require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const app = express();

// Cloudflare 등 리버스 프록시 뒤에서도 실제 클라이언트 IP로 rate limit 적용
app.set("trust proxy", 1);

// [FIX-1] CORS 설정: 허용 오리진 목록은 환경변수 CORS_ORIGINS(쉼표 구분)로 관리
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Enable helmet with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      // TEMP: allow inline scripts for in-browser Babel/React development.
      scriptSrc: ["'self'", "https://unpkg.com", "'unsafe-eval'", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
}));
// Permissions-Policy: 카메라·마이크·위치 등 민감 API 차단
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});
app.use(express.json({ limit: "32kb" }));

// 서버 내부 파일 노출 차단 (경로 정규화 후 비교)
app.use((req, res, next) => {
  const normalized = path.posix.normalize(req.path).toLowerCase();
  const blocked = ["/server.js", "/package.json", "/package-lock.json", "/.env.example", "/.env"];
  if (blocked.includes(normalized) || normalized.startsWith("/node_modules/") || normalized.startsWith("/api/")) {
    return res.status(403).end();
  }
  next();
});
app.use(express.static(path.join(__dirname)));

// [FIX-4] rate limit keyGenerator: IPv6 정규화 + IP·이메일 조합으로 우회 방지
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10분
  max: 5,                    // 최대 5회
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = (req.body?.email || "").trim().toLowerCase().slice(0, 254);
    return `${ip}:${email}`;
  },
});

const RECIPIENT = "contact@saegyeol.ai.kr";
const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

// SMTP 헤더 인젝션 방지: 개행문자 제거
const sanitizeHeader = (s) => String(s).replace(/[\r\n]/g, "");

// [FIX-2] 파일명 sanitize: 경로 순회 문자 및 비허용 문자 제거
const sanitizeFilename = (name) =>
  path.basename(String(name)).replace(/[^\w\s.\-]/g, "_").trim() || "attachment";

// 이메일 HTML 본문용 이스케이프
const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

// [FIX-3] SMTP transporter 싱글턴: 매 요청마다 새 연결을 맺지 않음
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

const MIME_EXT_MAP = {
  "application/pdf": [".pdf"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/x-msvideo": [".avi"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};
const ALLOWED_MIMES = new Set(Object.keys(MIME_EXT_MAP));

const mimeFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return cb(Object.assign(new Error("허용되지 않는 파일 형식입니다."), { status: 400 }));
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!(MIME_EXT_MAP[file.mimetype] || []).includes(ext)) {
    return cb(Object.assign(new Error("파일 확장자와 형식이 일치하지 않습니다."), { status: 400 }));
  }
  cb(null, true);
};

// POST /api/contact — 일반 문의 (파일 첨부 선택)
const uploadContact = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 },
  fileFilter: mimeFilter,
});

app.post("/api/contact", apiLimiter, uploadContact.single("file"), async (req, res) => {
  const { name, email, message } = req.body || {};
  const file = req.file;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
  }
  if (name.trim().length > MAX_NAME) {
    return res.status(400).json({ error: "이름이 너무 깁니다." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
  }
  if (message.trim().length < 4) {
    return res.status(400).json({ error: "문의 내용이 너무 짧습니다." });
  }
  if (message.trim().length > MAX_MESSAGE) {
    return res.status(400).json({ error: "문의 내용이 너무 깁니다. (5,000자 이내로 작성하세요.)" });
  }

  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  const mailOptions = {
    from: `"새결 문의" <${process.env.SMTP_USER}>`,
    to: RECIPIENT,
    replyTo: safeEmail,
    subject: `[새결 문의] ${safeName}`,
    text: `이름: ${name}\n이메일: ${email}\n\n${message}`,
    html: `<p><strong>이름:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
  };

  if (file) {
    mailOptions.attachments = [{
      filename: sanitizeFilename(Buffer.from(file.originalname, "latin1").toString("utf8")),
      content: file.buffer,
      contentType: file.mimetype,
    }];
  }

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error("문의 전송 오류:", err);
    res.status(500).json({ error: "메일 전송 중 오류가 발생했습니다." });
  }
});

// POST /api/recruit — 채용 지원 (파일 첨부)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 },
  fileFilter: mimeFilter,
});

app.post("/api/recruit", apiLimiter, upload.single("file"), async (req, res) => {
  const { name, email } = req.body || {};
  const file = req.file;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "이름과 이메일은 필수입니다." });
  }
  if (name.trim().length > MAX_NAME) {
    return res.status(400).json({ error: "이름이 너무 깁니다." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
  }

  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  const mailOptions = {
    from: `"새결 채용" <${process.env.SMTP_USER}>`,
    to: RECIPIENT,
    replyTo: safeEmail,
    subject: `[Saegyeol 지원] ${safeName}`,
    text: `지원자: ${name}\n이메일: ${email}${file ? `\n첨부파일: ${file.originalname}` : ""}`,
    html: `<p><strong>지원자:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p>`,
  };

  if (file) {
    mailOptions.attachments = [{
      filename: sanitizeFilename(Buffer.from(file.originalname, "latin1").toString("utf8")),
      content: file.buffer,
      contentType: file.mimetype,
    }];
  }

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error("채용 지원 전송 오류:", err);
    res.status(500).json({ error: "메일 전송 중 오류가 발생했습니다." });
  }
});

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
