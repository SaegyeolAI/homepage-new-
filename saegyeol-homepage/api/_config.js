// 문의 폼·채용 지원 폼의 정책 값은 전부 여기서 정한다.
//
// 사용자에게 보여줄 한글 안내 문구도 여기서 만들어 내려보낸다.
// 한도(예: 10분 5회)를 바꿔도 안내 문구가 따라 바뀌게 하려는 것이다.
// 프론트엔드는 숫자를 직접 적지 않고 서버가 준 문구를 그대로 띄운다.

const RATE_LIMIT = {
  max: 5,
  windowMinutes: 10,
};
RATE_LIMIT.windowMs = RATE_LIMIT.windowMinutes * 60 * 1000;
RATE_LIMIT.upstashWindow = `${RATE_LIMIT.windowMinutes} m`;

// Vercel 서버리스 함수의 request body 한도(4.5MB)와 맞춘다.
// 이보다 크게 잡아도 플랫폼이 먼저 거부하므로 프론트엔드와 동일하게 유지할 것.
const FILE_LIMIT = 4.5 * 1024 * 1024;
const FILE_LIMIT_LABEL = "4.5MB";

const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

const CONTACT_EMAIL = process.env.CONTACT_RECIPIENT || "contact@saegyeol.ai.kr";

// 허용 업로드 형식(축소안).
// 매크로가 들어가는 구형 OLE(.doc/.ppt)과, 내용을 들여다볼 수 없는 .zip은 뺐다.
// kind는 파일 내용에서 실제로 판별해 낸 종류와 대조하는 값이다.
const ALLOWED_UPLOADS = [
  { kind: "pdf",  ext: [".pdf"],           mime: ["application/pdf"] },
  { kind: "docx", ext: [".docx"],          mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
  { kind: "pptx", ext: [".pptx"],          mime: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"] },
  { kind: "png",  ext: [".png"],           mime: ["image/png"] },
  { kind: "jpeg", ext: [".jpg", ".jpeg"],  mime: ["image/jpeg"] },
];

const ALLOWED_EXT_LABEL = "PDF · DOCX · PPTX · PNG · JPG";
const ALLOWED_ACCEPT = ".pdf,.docx,.pptx,.png,.jpg,.jpeg";

// 사용자에게 나가는 문구는 전부 여기 있는 것만 쓴다.
// 라이브러리 내부 오류 메시지(영문)는 절대 그대로 내보내지 않는다.
const MESSAGES = {
  methodNotAllowed: "잘못된 요청입니다.",
  notConfigured:    "문의 접수가 일시적으로 중단되어 있습니다.",
  badOrigin:        "지금 이 페이지에서는 문의를 보낼 수 없습니다.",
  rateLimited:      `${RATE_LIMIT.windowMinutes}분에 ${RATE_LIMIT.max}번까지 보낼 수 있습니다.`,
  missingFields:    "필수 항목이 비어 있습니다.",
  nameTooLong:      `이름은 ${MAX_NAME}자 이내로 적어주세요.`,
  badEmail:         "이메일 주소 형식이 올바르지 않습니다.",
  messageTooShort:  "문의 내용을 조금 더 자세히 적어주세요.",
  messageTooLong:   `문의 내용은 ${MAX_MESSAGE.toLocaleString("ko-KR")}자 이내로 적어주세요.`,
  uploadTooLarge:   `첨부파일이 너무 큽니다. ${FILE_LIMIT_LABEL} 이하로 줄여주세요.`,
  uploadBadType:    `첨부할 수 없는 형식입니다. ${ALLOWED_EXT_LABEL}만 보낼 수 있습니다.`,
  uploadBadContent: "파일 내용이 확장자와 맞지 않습니다. 원본 파일을 그대로 첨부해 주세요.",
  uploadUnreadable: "첨부파일을 읽지 못했습니다. 파일을 빼고 다시 보내주세요.",
  parseFailed:      "요청을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.",
  sendFailed:       "메일 전송에 실패했습니다.",
};

module.exports = {
  RATE_LIMIT, FILE_LIMIT, FILE_LIMIT_LABEL, MAX_NAME, MAX_MESSAGE,
  CONTACT_EMAIL, ALLOWED_UPLOADS, ALLOWED_EXT_LABEL, ALLOWED_ACCEPT, MESSAGES,
};
