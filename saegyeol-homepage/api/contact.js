const { formidable } = require("formidable");
const fs = require("fs").promises;
const {
  RECIPIENT, MAX_NAME, MAX_MESSAGE, FILE_LIMIT, MESSAGES,
  sanitizeHeader, sanitizeFilename, escapeHtml,
  validateUpload, checkOrigin, checkConfigured, cleanupUpload,
  detectBot, logBot, describeParseError,
  EXTERNAL_BANNER_TEXT, EXTERNAL_BANNER_HTML, transporter,
} = require("./_utils");
const { checkRateLimit } = require("./_ratelimit");

const SCOPE = "contact";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: MESSAGES.methodNotAllowed });

  const configError = checkConfigured();
  if (configError) return res.status(503).json({ error: configError });

  const originError = checkOrigin(req);
  if (originError) return res.status(403).json({ error: originError });

  const limited = await checkRateLimit(req, SCOPE);
  if (limited) {
    res.setHeader("Retry-After", String(limited.retryAfter));
    return res.status(429).json({ error: limited.message, retryAfter: limited.retryAfter });
  }

  const form = formidable({ maxFileSize: FILE_LIMIT, maxFiles: 1 });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    const { status, error } = describeParseError(err, SCOPE);
    return res.status(status).json({ error });
  }

  const uploadedFile = files.file?.[0] ?? null;

  // 어느 경로로 빠져나가든 업로드 임시 파일을 지운다.
  try {
    // 봇으로 판단되면 메일을 보내지 않는다.
    // 실패를 알려주면 우회를 시도하므로 응답은 성공과 똑같이 돌려준다.
    const botReason = detectBot(fields);
    if (botReason) {
      logBot(SCOPE, botReason);
      return res.status(200).json({ ok: true });
    }

    const name    = (fields.name?.[0]    ?? "").trim();
    const email   = (fields.email?.[0]   ?? "").trim();
    const message = (fields.message?.[0] ?? "").trim();

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

    // 첨부가 있으면 내용을 먼저 읽는다 — MIME·확장자만이 아니라
    // 파일 안의 실제 바이트까지 보고 판단하기 위해서다.
    let buffer = null;
    if (uploadedFile) {
      try {
        buffer = await fs.readFile(uploadedFile.filepath);
      } catch (err) {
        console.error(`[${SCOPE}] 업로드 파일 읽기 실패:`, err.code);
        return res.status(400).json({ error: MESSAGES.uploadUnreadable });
      }
      const fileError = validateUpload(uploadedFile, buffer);
      if (fileError) return res.status(400).json({ error: fileError });
    }

    const safeName  = sanitizeHeader(name);
    const safeEmail = sanitizeHeader(email);

    const mailOptions = {
      from:    `"새결 문의" <${process.env.SMTP_USER}>`,
      to:      RECIPIENT,
      replyTo: safeEmail,
      subject: `[새결 문의] ${safeName}`,
      text: `${EXTERNAL_BANNER_TEXT}이름: ${name}\n이메일: ${email}\n\n${message}`,
      html: `${EXTERNAL_BANNER_HTML}<p><strong>이름:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    };

    if (uploadedFile && buffer) {
      mailOptions.attachments = [{
        filename:    sanitizeFilename(uploadedFile.originalFilename || "attachment"),
        content:     buffer,
        contentType: uploadedFile.mimetype,
      }];
    }

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(`[${SCOPE}] 메일 전송 오류:`, err.message);
      return res.status(500).json({ error: MESSAGES.sendFailed });
    }
  } finally {
    await cleanupUpload(uploadedFile);
  }
}

module.exports = handler;
