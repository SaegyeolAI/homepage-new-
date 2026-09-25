const { formidable } = require("formidable");
const fs = require("fs").promises;
const {
  RECIPIENT, MAX_NAME, FILE_LIMIT, MESSAGES,
  sanitizeHeader, sanitizeFilename, escapeHtml,
  validateUpload, checkOrigin, checkConfigured, cleanupUpload,
  detectBot, logBot, describeParseError,
  EXTERNAL_BANNER_TEXT, EXTERNAL_BANNER_HTML, transporter,
} = require("./_utils");
const { checkRateLimit } = require("./_ratelimit");

const SCOPE = "recruit";

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

  try {
    const botReason = detectBot(fields);
    if (botReason) {
      logBot(SCOPE, botReason);
      return res.status(200).json({ ok: true });
    }

    const name  = (fields.name?.[0]  ?? "").trim();
    const email = (fields.email?.[0] ?? "").trim();

    if (!name || !email) {
      return res.status(400).json({ error: MESSAGES.missingFields });
    }
    if (name.length > MAX_NAME) {
      return res.status(400).json({ error: MESSAGES.nameTooLong });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ error: MESSAGES.badEmail });
    }

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
    const attachmentName = uploadedFile
      ? sanitizeFilename(uploadedFile.originalFilename || "attachment")
      : null;

    const mailOptions = {
      from:    `"새결 채용" <${process.env.SMTP_USER}>`,
      to:      RECIPIENT,
      replyTo: safeEmail,
      subject: `[Saegyeol 지원] ${safeName}`,
      text: `${EXTERNAL_BANNER_TEXT}지원자: ${name}\n이메일: ${email}${attachmentName ? `\n첨부파일: ${attachmentName}` : ""}`,
      html: `${EXTERNAL_BANNER_HTML}<p><strong>지원자:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p>`,
    };

    if (uploadedFile && buffer) {
      mailOptions.attachments = [{
        filename:    attachmentName,
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
