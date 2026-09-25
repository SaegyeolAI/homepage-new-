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
}

build().catch((err) => {
  console.error("빌드 실패:", err.message);
  process.exit(1);
});
