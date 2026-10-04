// server.js(로컬 개발 서버)를 그대로 띄우되 SMTP만 목으로 바꾼다.
// 브라우저로 폼을 끝까지 눌러 보는 테스트가 쓴다. 실제 메일은 나가지 않는다.
const { installMockSmtp, ROOT } = require("./_mock-smtp");

process.env.PORT = process.env.APP_PORT || "3210";
process.chdir(ROOT);

installMockSmtp();

require(ROOT + "/server.js");
console.log(`앱 서버 http://127.0.0.1:${process.env.PORT} (목 SMTP — 실제 발송 없음)`);
