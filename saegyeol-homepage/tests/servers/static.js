// public/ 을 그대로 내려주는 정적 서버. 화면 쪽 테스트가 쓴다.
// API는 없으므로 이 서버로는 폼이 전송되지 않는다.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PUB = path.resolve(__dirname, "..", "..", "public");
const PORT = Number(process.env.STATIC_PORT) || 3220;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  // 해시 라우팅이라 확장자가 없는 경로는 전부 index.html
  if (p === "/" || !path.extname(p)) p = "/index.html";

  // 경로 순회 차단
  const file = path.join(PUB, p);
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end("forbidden"); }

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`정적 서버 http://127.0.0.1:${PORT}`));
