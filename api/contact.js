const { formidable } = require("formidable");
const fs = require("fs").promises;
const {
  RECIPIENT, MAX_NAME, MAX_MESSAGE, FILE_LIMIT,
  sanitizeHeader, sanitizeFilename, escapeHtml,
  validateFile, transporter,
} = require("./_utils");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const form = formidable({ maxFileSize: FILE_LIMIT, maxFiles: 1 });
  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: err.message || "파일 파싱 오류가 발생했습니다." });
  }

  const name    = (fields.name?.[0]    ?? "").trim();
  const email   = (fields.email?.[0]   ?? "").trim();
  const message = (fields.message?.[0] ?? "").trim();
  const uploadedFile = files.file?.[0] ?? null;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
  }
  if (name.length > MAX_NAME) {
    return res.status(400).json({ error: "이름이 너무 깁니다." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
  }
  if (message.length < 4) {
    return res.status(400).json({ error: "문의 내용이 너무 짧습니다." });
  }
  if (message.length > MAX_MESSAGE) {
    return res.status(400).json({ error: "문의 내용이 너무 깁니다. (5,000자 이내로 작성하세요.)" });
  }
  if (uploadedFile) {
    const fileError = validateFile(uploadedFile);
    if (fileError) return res.status(400).json({ error: fileError });
  }

  const safeName  = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  const mailOptions = {
    from:    `"새결 문의" <${process.env.SMTP_USER}>`,
    to:      RECIPIENT,
    replyTo: safeEmail,
    subject: `[새결 문의] ${safeName}`,
    text: `이름: ${name}\n이메일: ${email}\n\n${message}`,
    html: `<p><strong>이름:</strong> ${escapeHtml(name)}</p><p><strong>이메일:</strong> ${escapeHtml(email)}</p><hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
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
    console.error("문의 전송 오류:", err);
    return res.status(500).json({ error: "메일 전송 중 오류가 발생했습니다." });
  }
}

module.exports = handler;
