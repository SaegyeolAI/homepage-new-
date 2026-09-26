#!/usr/bin/env node
/**
 * src/*.jsx  ->  public/app.js
 *
 * 이 사이트는 번들러 없이 React UMD를 CDN에서 받아 쓰고, 브라우저에는
 * public/app.js 한 장만 내려간다(.vercelignore가 src/를 제외한다).
 * 예전에는 그 파일을 손으로 고쳐왔는데, 괄호 하나가 어긋나 화면이
 * 백지가 된 적이 있어(fcb238b) JSX 변환만 자동화한다.
 *
 * 번들링이 아니라 "파일별 JSX 변환 후 이어붙이기"다. 각 파일은 ES 모듈이
 * 아니라 전역 스크립트이며 window.X 할당으로 서로를 참조하므로,
 * import/export를 쓰지 말고 아래 FILES 순서(= 의존 순서)를 지킬 것.
 *
 *   npm run build
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const esbuild = require("esbuild");

// 로드 순서 = 의존 순서. chrome.jsx가 React 구조분해와 공통 상수를 선언하므로 항상 먼저.
const FILES = [
  "src/components/chrome.jsx",
  "src/pages/home.jsx",
  "src/pages/team.jsx",
  "src/pages/product.jsx",
  "src/pages/pricing.jsx",
  "src/pages/privacy.jsx",
  "src/pages/terms.jsx",
  "src/pages/features.jsx",
  "src/app.jsx",
];

const OUT = "public/app.js";

const HEADER = `/* 이 파일은 build.js가 src/*.jsx에서 생성합니다. 직접 수정하지 마세요. */\n`;

// 캐시 무효화 대상. index.html이 참조하는 자체 정적 파일.
const STAMPED = ["app.js", "styles.css"];
const INDEX = "public/index.html";

/**
 * index.html의 /app.js, /styles.css 참조에 내용 해시를 ?v=로 붙인다.
 *
 * 왜 필요한가 (2026-09-26):
 *   vercel.json이 app.js·styles.css에 max-age=86400을 걸어 두었는데 파일명은
 *   고정이다. index.html만 매번 재검증되므로, 다시 찾아온 방문자는 하루까지
 *   "새 HTML + 낡은 CSS/JS"를 쓰게 된다. word-break: keep-all을 배포했는데도
 *   운영에서 어절 줄바꿈이 안 먹던 것이 이 조합 때문이었다.
 *
 * 왜 파일명 해시(app.a1b2c3.js)가 아닌가:
 *   번들러가 없어서 지난 해시 파일을 지워 줄 주체가 없고, vercel.json의
 *   헤더 source 패턴과 CSP도 같이 손봐야 한다. 쿼리만 바꾸면 URL은 내용에
 *   따라 달라지면서 경로는 그대로라 헤더·CSP를 건드리지 않는다.
 *
 * 멱등하다. 이미 붙은 ?v=는 새 값으로 교체된다.
 */
function stampAssets() {
  const indexPath = path.join(__dirname, INDEX);
  let html = fs.readFileSync(indexPath, "utf8");
  const stamped = [];

  for (const name of STAMPED) {
    // 줄바꿈을 정규화한 뒤 해시한다.
    //   이 저장소는 core.autocrlf=true에 .gitattributes가 없어서, 작업 사본은
    //   CRLF인데 git이 보관하고 Vercel이 받는 것은 LF다. 날바이트로 해시하면
    //   같은 내용인데 내 PC와 Vercel의 해시가 달라진다. \r만 빼고 세면 두 곳이
    //   같은 값을 낸다.
    const text = fs.readFileSync(path.join(__dirname, "public", name), "utf8");
    const hash = crypto.createHash("sha256")
      .update(text.replace(/\r\n/g, "\n"), "utf8")
      .digest("hex").slice(0, 10);
    // href="/styles.css" 또는 href="/styles.css?v=낡은해시" 모두 잡는다.
    const re = new RegExp(`((?:href|src)=")/${name.replace(/\./g, "\\.")}(?:\\?v=[0-9a-f]+)?(")`, "g");
    // 해시가 그대로일 때도 replace 결과는 같으므로, 치환 결과가 아니라
    // 참조를 찾았는지로 판단한다.
    if (!re.test(html)) throw new Error(`${INDEX}에서 /${name} 참조를 찾지 못했습니다.`);
    re.lastIndex = 0;
    html = html.replace(re, `$1/${name}?v=${hash}$2`);
    stamped.push(`${name}?v=${hash}`);
  }

  fs.writeFileSync(indexPath, html, "utf8");
  return stamped;
}

async function build() {
  const parts = [];

  for (const file of FILES) {
    const abs = path.join(__dirname, file);
    const source = fs.readFileSync(abs, "utf8");

    if (/^\s*(import|export)\s/m.test(source)) {
      throw new Error(`${file}: 이 빌드는 전역 스크립트 연결 방식이라 import/export를 쓸 수 없습니다.`);
    }

    const result = await esbuild.transform(source, {
      loader: "jsx",
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      target: "es2020",
      format: "esm",
      sourcefile: file,
      charset: "ascii",
    });

    for (const warning of result.warnings) {
      console.warn(`[warn] ${file}: ${warning.text}`);
    }

    parts.push(`/* ---- ${file} ---- */\n${result.code.trimEnd()}\n`);
  }

  const code = HEADER + parts.join("\n");
  fs.writeFileSync(path.join(__dirname, OUT), code, "utf8");

  // 생성한 파일이 실제로 파싱되는지 확인한다. 예전 백지 사고가 바로 이 지점이었다.
  new Function(code);

  const kb = (Buffer.byteLength(code, "utf8") / 1024).toFixed(1);
  console.log(`${OUT} 생성 완료 — ${FILES.length}개 파일, ${code.split("\n").length}줄, ${kb} KB`);

  // app.js를 쓴 뒤에 찍어야 해시가 방금 만든 내용과 맞는다.
  console.log(`${INDEX} 캐시 버전 — ${stampAssets().join(", ")}`);
}

build().catch((err) => {
  console.error("빌드 실패:", err.message);
  process.exit(1);
});
