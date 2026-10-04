// api/ 서버리스 핸들러를 로컬 http 서버에 직접 얹는다. 보안 점검 대상.
// 실제 메일은 한 통도 나가지 않는다(_mock-smtp).
//
//   GET  /__mails        목이 받은 메일 (본문·헤더 검사용)
//   POST /__mails/clear  버퍼 비우기
//   POST /api/contact    실제 핸들러
//   POST /api/recruit    실제 핸들러
const http = require("http");
const path = require("path");
const { installMockSmtp, ROOT } = require("./_mock-smtp");
const { SITE_ORIGIN, SITE_ORIGIN_ALT } = require("../_fixtures");

// Origin 검사 경로를 실제로 타 보려고 허용목록을 켜 둔다.
// 운영 도메인이 아니라 테스트 전용 도메인을 쓴다 — 검사하는 것은 "메커니즘"이지
// 특정 도메인이 아니다.
process.env.ALLOWED_ORIGIN = `${SITE_ORIGIN},${SITE_ORIGIN_ALT}`;

const { sent } = installMockSmtp();

const contact = require(path.join(ROOT, "api", "contact.js"));
const recruit = require(path.join(ROOT, "api", "recruit.js"));

// Vercel의 res 셰이프(status().json())를 흉내낸다.
function shim(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => {
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify(o));
    return res;
  };
  return res;
}

const PORT = Number(process.env.HARNESS_PORT) || 4321;

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/__mails" && req.method === "GET") {
    res.setHeader("content-type", "application/json; charset=utf-8");
    return res.end(JSON.stringify(sent.map((m) => ({
      from: m.from, to: m.to, replyTo: m.replyTo, subject: m.subject,
      text: m.text, html: m.html,
      attachments: (m.attachments || []).map((a) => ({
        filename: a.filename, contentType: a.contentType,
        bytes: a.content ? a.content.length : 0,
      })),
      // 주입으로 "새 헤더"가 생겼는지 보려고 키 목록도 같이 넘긴다
      keys: Object.keys(m),
    }))));
  }
  if (url === "/__mails/clear") { sent.length = 0; res.statusCode = 204; return res.end(); }

  shim(res);
  try {
    if (url === "/api/contact") return await contact(req, res);
    if (url === "/api/recruit") return await recruit(req, res);
  } catch (err) {
    // 핸들러가 예외를 흘리면 그것 자체가 결함이다. 감추지 않는다.
    console.error("[하네스] 핸들러 예외:", err.stack);
    res.statusCode = 500;
    return res.end(JSON.stringify({ harnessUncaught: String(err && err.message) }));
  }
  res.statusCode = 404;
  res.end("not found");
});

server.listen(PORT, "127.0.0.1", () => console.log(`api 하네스 http://127.0.0.1:${PORT} (목 SMTP)`));
