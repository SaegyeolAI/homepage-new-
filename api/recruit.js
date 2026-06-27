const { formidable } = require("formidable");
const fs = require("fs").promises;
const {
  RECIPIENT, MAX_NAME, FILE_LIMIT,
  sanitizeHeader, sanitizeFilename, escapeHtml,
  validateFile, transporter,
} = require("./_utils");
const { checkRateLimit } = require("./_ratelimit");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const rlError = await checkRateLimit(req);
  if (rlError) return res.status(429).json({ error: rlError });

  const form = formidable({ maxFileSize: FILE_LIMIT, maxFiles: 1 });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: err.message || "파일 파싱 오류가 발생했습니다." });
  }

  const name  = (fields.name?.[0]  ?? "").trim();
  const email = (fields.email?.[0] ?? "").trim();
  const uploadedFile = files.file?.[0] ?? null;

  if (!name || !email) {
    return res.status(400).json({ error: "이름과 이메일은 필수입니다." });
  }
  if (name.length > MAX_NAME) {
    return res.status(400).json({ error: "이름이 너무 깁니다." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
  }
  if (uploadedFile) {
    const fileError = validateFile(uploadedFile);
    if (fileError) return res.status(400).json({ error: fileError });
  }

  const safeName  = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  const mailOptions = {
    from:    `"새결 채용" <${process.env.SMTP_USER}>`,
    to:      RECIPIENT,
    replyTo: safeEmail,
    subject: `[Saegyeol 지원] ${safeName}`,
    text: `지원자: ${name}\n이메일: ${email}${uploadedFile ? `\n첨부파일: ${uploadedFile.originalFilename}` : ""}`,
    html: `<p><strong>지원자:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p>`,
  };

  if (uploadedFile) {
    const buffer = await fs.readFile(uploadedFile.filepath);
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
    console.error("채용 지원 전송 오류:", err);
    return res.status(500).json({ error: "메일 전송 중 오류가 발생했습니다." });
  }
}

module.exports = handler;
