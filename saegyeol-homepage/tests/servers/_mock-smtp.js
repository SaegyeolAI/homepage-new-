// SMTP를 목으로 갈아끼운다. 테스트에서 실제 메일이 나가는 일이 없게 하는 곳.
//
// api/_utils.js가 transporter 객체 하나를 만들어 두고 핸들러들이 그걸 그대로
// 쓰므로, require 캐시에 올라온 그 객체의 메서드만 바꾸면 모든 경로가 목이 된다.
// 반드시 핸들러(server.js, api/*.js)를 require 하기 "전에" 불러야 한다.
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

function installMockSmtp() {
  // 혹시라도 진짜 자격증명이 환경에 남아 있으면 지운다.
  // 목을 끼우기 전에 지워 두면, 목이 어떤 이유로 빠지더라도 인증이 안 되어
  // 메일이 나갈 수 없다. 두 겹으로 막는 것이다.
  for (const k of ["SMTP_PASS", "SMTP_HOST", "SMTP_PORT", "SMTP_SECURE"]) delete process.env[k];
  process.env.SMTP_HOST = "smtp.invalid";   // 존재하지 않는 TLD
  process.env.SMTP_USER = require("../_fixtures").MAIL_FROM;

  const utils = require(path.join(ROOT, "api", "_utils.js"));
  const sent = [];

  utils.transporter.sendMail = async (opts) => {
    if (process.env.MOCK_SMTP_FAIL === "1") {
      // 장애 상황의 오류 메시지가 사용자에게 새는지 보려고 일부러 지저분하게 던진다.
      throw new Error("mock SMTP down: 535 auth failed at /opt/app/node_modules/x/lib/y.js:42");
    }
    sent.push(opts);
    return { messageId: "mock" };
  };

  // 목이 제대로 끼워졌는지 확인한다. 아니면 서버를 띄우지 않는다.
  if (!/sent\.push/.test(String(utils.transporter.sendMail))) {
    console.error("[목 SMTP] 교체에 실패했습니다. 실제 메일이 나갈 수 있어 중단합니다.");
    process.exit(1);
  }

  return { sent, ROOT };
}

module.exports = { installMockSmtp, ROOT };
