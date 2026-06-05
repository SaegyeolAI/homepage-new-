require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // meta 태그로 이미 설정
}));
app.use(express.json({ limit: "32kb" }));
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

// POST /api/contact — 일반 문의 (파일 첨부 선택)
const uploadContact = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
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
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
  }
  if (message.trim().length < 4) {
    return res.status(400).json({ error: "문의 내용이 너무 짧습니다." });
  }
  if (message.trim().length > MAX_MESSAGE) {
    return res.status(400).json({ error: "문의 내용이 너무 깁니다. (5,000자 이내)" });
  }

  const mailOptions = {
    from: `"새결 문의" <${process.env.SMTP_USER}>`,
    to: RECIPIENT,
    replyTo: email,
    subject: `[새결 문의] ${name}`,
    text: `이름: ${name}\n이메일: ${email}\n\n${message}`,
    html: `<p><strong>이름:</strong> ${name}</p><p><strong>이메일:</strong> ${email}</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
  }

  const mailOptions = {
    from: `"새결 채용" <${process.env.SMTP_USER}>`,
    to: RECIPIENT,
    replyTo: email,
    subject: `[Saegyeol 지원] ${name}`,
    text: `지원자: ${name}\n이메일: ${email}${file ? `\n첨부파일: ${file.originalname}` : ""}`,
    html: `<p><strong>지원자:</strong> ${name}</p><p><strong>이메일:</strong> ${email}</p>`,
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
