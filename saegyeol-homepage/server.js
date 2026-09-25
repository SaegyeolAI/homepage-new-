require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// 정책 값과 검증 로직은 서버리스 쪽(api/)과 같은 모듈을 쓴다.
// 예전에는 두 구현이 따로 놀아서, 로컬에서 통과한 요청이 운영에서 403으로 막혔다.
const {
  RATE_LIMIT, FILE_LIMIT, MAX_NAME, MAX_MESSAGE, ALLOWED_UPLOADS, MESSAGES,
} = require("./api/_config");
const {
  RECIPIENT,
  sanitizeHeader, sanitizeFilename, escapeHtml,
  validateUpload, checkOrigin, checkConfigured,
  detectBot, logBot,
  EXTERNAL_BANNER_TEXT, EXTERNAL_BANNER_HTML, transporter,
} = require("./api/_utils");

const app = express();

// Cloudflare 등 리버스 프록시 뒤에서도 실제 클라이언트 IP로 rate limit 적용
app.set("trust proxy", 1);

// [FIX-1] CORS 설정: 허용 오리진 목록은 환경변수 ALLOWED_ORIGIN(쉼표 구분)으로 관리
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "")
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
      scriptSrc: ["'self'", "https://unpkg.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));
// Permissions-Policy: 카메라·마이크·위치 등 민감 API 차단
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});
app.use(express.json({ limit: "32kb" }));

const PUBLIC_DIR = path.join(__dirname, "public");

// rate limiter는 엔드포인트마다 따로 둔다.
// 하나를 공유하면 지원서를 낸 사람이 곧바로 문의를 보낼 때 한도를 나눠 쓰게 된다.
//
// 키는 IP만 쓴다. 예전에는 `ip:email`을 썼는데, 이 미들웨어가 multer보다 먼저 돌아
// req.body가 아직 비어 있어서 email이 항상 빈 문자열이었다(= 죽은 코드).
// 게다가 키가 잘게 쪼개지면 한 사람이 이메일만 바꿔 한도를 늘릴 수 있어,
// IP 단위로 묶는 쪽이 제한으로서 더 강하다.
const makeLimiter = () => rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    const retryAfter = Math.max(1, Math.ceil(RATE_LIMIT.windowMs / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ error: MESSAGES.rateLimited, retryAfter });
  },
});

const contactLimiter = makeLimiter();
const recruitLimiter = makeLimiter();

// 운영과 같은 순서로 검사한다: 환경변수 → Origin → rate limit.
const guard = (req, res, next) => {
  const configError = checkConfigured();
  if (configError) return res.status(503).json({ error: configError });
  const originError = checkOrigin(req);
  if (originError) return res.status(403).json({ error: originError });
  next();
};

// multer는 스트리밍 중이라 파일 내용을 볼 수 없다.
// 여기서는 MIME·확장자만 거르고, 실제 바이트 검사는 핸들러에서 한다.
const declaredTypeFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const ok = ALLOWED_UPLOADS.some((u) => u.mime.includes(file.mimetype) && u.ext.includes(ext));
  if (!ok) return cb(Object.assign(new Error(MESSAGES.uploadBadType), { status: 400 }));
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FILE_LIMIT },
  fileFilter: declaredTypeFilter,
});

// multer의 originalname은 latin1로 들어온다. 한글 파일명을 살리려면
// utf8로 다시 읽어야 한다. (api/ 쪽 formidable은 이미 utf8로 준다.)
const decodeUploadName = (file) =>
  sanitizeFilename(Buffer.from(file.originalname, "latin1").toString("utf8"));

// multer의 req.body는 값이 문자열이지만, api/ 쪽 formidable은 배열로 준다.
// 공용 검증 함수(detectBot, validateUpload)가 같은 모양을 보도록 맞춰 준다.
const asFields = (body) => {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) out[k] = [v];
  return out;
};

// POST /api/contact — 일반 문의 (파일 첨부 선택)
app.post("/api/contact", guard, contactLimiter, upload.single("file"), async (req, res) => {
  const file = req.file;

  const botReason = detectBot(asFields(req.body));
  if (botReason) {
    logBot("contact", botReason);
    return res.json({ ok: true });
  }

  const name = (req.body?.name ?? "").trim();
  const email = (req.body?.email ?? "").trim();
  const message = (req.body?.message ?? "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: MESSAGES.missingFields });
  }
  if (name.length > MAX_NAME) {
    return res.status(400).json({ error: MESSAGES.nameTooLong });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: MESSAGES.badEmail });
  }
  if (message.length < 4) {
    return res.status(400).json({ error: MESSAGES.messageTooShort });
  }
  if (message.length > MAX_MESSAGE) {
    return res.status(400).json({ error: MESSAGES.messageTooLong });
  }
  if (file) {
    const fileError = validateUpload(
      { originalFilename: Buffer.from(file.originalname, "latin1").toString("utf8"), mimetype: file.mimetype },
      file.buffer
    );
    if (fileError) return res.status(400).json({ error: fileError });
  }

  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  const mailOptions = {
    from: `"새결 문의" <${process.env.SMTP_USER}>`,
    to: RECIPIENT,
    replyTo: safeEmail,
    subject: `[새결 문의] ${safeName}`,
    text: `${EXTERNAL_BANNER_TEXT}이름: ${name}\n이메일: ${email}\n\n${message}`,
    html: `${EXTERNAL_BANNER_HTML}<p><strong>이름:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
  };

  if (file) {
    mailOptions.attachments = [{
      filename: decodeUploadName(file),
      content: file.buffer,
      contentType: file.mimetype,
    }];
  }

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error("[contact] 메일 전송 오류:", err.message);
    res.status(500).json({ error: MESSAGES.sendFailed });
  }
});

// POST /api/recruit — 채용 지원 (파일 첨부)
app.post("/api/recruit", guard, recruitLimiter, upload.single("file"), async (req, res) => {
  const file = req.file;

  const botReason = detectBot(asFields(req.body));
  if (botReason) {
    logBot("recruit", botReason);
    return res.json({ ok: true });
  }

  const name = (req.body?.name ?? "").trim();
  const email = (req.body?.email ?? "").trim();

  if (!name || !email) {
    return res.status(400).json({ error: MESSAGES.missingFields });
  }
  if (name.length > MAX_NAME) {
    return res.status(400).json({ error: MESSAGES.nameTooLong });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: MESSAGES.badEmail });
  }
  if (file) {
    const fileError = validateUpload(
      { originalFilename: Buffer.from(file.originalname, "latin1").toString("utf8"), mimetype: file.mimetype },
      file.buffer
    );
    if (fileError) return res.status(400).json({ error: fileError });
  }

  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);
  const attachmentName = file ? decodeUploadName(file) : null;

  const mailOptions = {
    from: `"새결 채용" <${process.env.SMTP_USER}>`,
    to: RECIPIENT,
    replyTo: safeEmail,
    subject: `[Saegyeol 지원] ${safeName}`,
    text: `${EXTERNAL_BANNER_TEXT}지원자: ${name}\n이메일: ${email}${attachmentName ? `\n첨부파일: ${attachmentName}` : ""}`,
    html: `${EXTERNAL_BANNER_HTML}<p><strong>지원자:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p>`,
  };

  if (file) {
    mailOptions.attachments = [{
      filename: attachmentName,
      content: file.buffer,
      contentType: file.mimetype,
    }];
  }

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error("[recruit] 메일 전송 오류:", err.message);
    res.status(500).json({ error: MESSAGES.sendFailed });
  }
});

// 정적 홈페이지 파일만 외부에 제공합니다.
app.use(express.static(PUBLIC_DIR, {
  index: false,
  etag: true,
  maxAge: "1h",
  setHeaders: (res, filePath) => {
    if (/\.(?:js|css|png|jpg|jpeg|svg|webp|woff2)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  },
}));

// 사용자에게는 고정 한글 문구만 내보낸다. 내부 메시지는 로그에만 남긴다.
app.use((err, _req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: MESSAGES.uploadTooLarge });
  }
  if (err.status === 400) return res.status(400).json({ error: err.message });
  console.error("요청 처리 오류:", err.message);
  return res.status(500).json({ error: MESSAGES.parseFailed });
});

// SPA fallback
app.get("*", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Saegyeol server listening on port ${PORT}`));
