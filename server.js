require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Cloudflare 등 리버스 프록시 뒤에서도 실제 클라이언트 IP로 rate limit 적용
app.set("trust proxy", 1);

// Enable helmet with default security headers (including CSP)
app.use(helmet());
app.use(express.json({ limit: "32kb" }));

// 서버 내부 파일 노출 차단 (경로 정규화 후 비교)
app.use((req, res, next) => {
  const normalized = path.posix.normalize(req.path).toLowerCase();
  const blocked = ["/server.js", "/package.json", "/package-lock.json", "/.env.example", "/.env"];
  if (blocked.includes(normalized)) return res.status(403).end();
  next();
});
app.use(express.static(path.join(__dirname)));

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10분
  max: 5,                    // 최대 5회
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
});

const RECIPIENT = "contact@saegyeol.ai.kr";
const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

// SMTP 헤더 인젝션 방지: 개행문자 제거
const sanitizeHeader = (s) => String(s).replace(/[\r\n]/g, "");

// 이메일 HTML 본문용 이스케이프
const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4", "video/quicktime", "video/x-msvideo",
  "image/png", "image/jpeg",
]);

const mimeFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return cb(Object.assign(new Error("허용되지 않는 파일 형식입니다."), { status: 400 }));
  }
  cb(null, true);
};

// POST /api/contact — 일반 문의 (파일 첨부 선택)
const uploadContact = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
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
      filename: Buffer.from(file.originalname, "latin1").toString("utf8"),
      content: file.buffer,
      contentType: file.mimetype,
    }];
  }

  try {
    await createTransporter().sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error("문의 전송 오류:", err);
    res.status(500).json({ error: "메일 전송 중 오류가 발생했습니다." });
  }
});

// POST /api/recruit — 채용 지원 (파일 첨부)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
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
      filename: Buffer.from(file.originalname, "latin1").toString("utf8"),
      content: file.buffer,
      contentType: file.mimetype,
    }];
  }

  try {
    await createTransporter().sendMail(mailOptions);
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
