// 어색한 줄바꿈 탐지기.
// 텍스트 노드를 한 글자씩 Range로 재어 "줄이 바뀐 지점"을 실제 렌더 좌표에서 찾는다.
// getComputedStyle이나 CSS 문자열을 믿지 않고, 눈에 보이는 결과만 본다.
//
// 세는 것:
//   midWord  - 어절 중간에서 끊김 (한글+한글 경계) ← keep-all이 막아야 하는 것
//   widow    - 문단 마지막 줄에 한 어절만 남음
//   longLine - 한 줄 한글 46자 초과
//   tightUnit- 의미 단위가 갈라짐 (숫자/단위, 특정 복합어)
const { chromium } = require("playwright");
const { resolveTarget } = require("../_target");

const ROUTES = ["home", "product", "pricing", "team", "contact", "recruit"];
const SEL = "h1,h2,h3,h4,p,li,.k,.v,.basis,.lead,.section-label,button,td,th,.field-error,.caption";

async function scan(page, base, route, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(650);
  // 모든 섹션을 훑어 지연 렌더가 없게 한다
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);

  return page.evaluate((sel) => {
    const out = { midWord: [], widow: [], longLine: [], tightUnit: [], overflow: 0, lines: 0 };
    const HAN = /[가-힣]/;
    // 붙어 있어야 자연스러운 의미 단위
    // 숫자·수사 + 단위, 그리고 떨어지면 안 되는 고유 묶음.
    // 한글 수사(세 가지, 네 단계)도 본다 — 2026-10-03 보고된 경우가 이것이다.
    const UNITS = [
      /\d\s%/, /\d\s단계/, /\d\s종/, /\d\s개/, /\d\s분/, /\d\s배/, /\d\s번/,
      /(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s(가지|단계|종|개|곳|번|명|차례|줄|배)/,
      /AI\s에이전트/, /LLM\s에이전트/,
    ];

    for (const el of document.querySelectorAll(sel)) {
      if (el.offsetParent === null && el.tagName !== "BODY") continue;
      for (const node of el.childNodes) {
        if (node.nodeType !== 3) continue;
        const text = node.textContent;
        if (!HAN.test(text) || text.trim().length < 4) continue;

        // 각 글자의 렌더 top으로 줄을 나눈다
        const range = document.createRange();
        const rows = [];   // [{top, chars:[i…]}]
        for (let i = 0; i < text.length; i++) {
          range.setStart(node, i); range.setEnd(node, i + 1);
          const r = range.getBoundingClientRect();
          if (r.height === 0) continue;
          const top = Math.round(r.top);
          const last = rows[rows.length - 1];
          if (!last || top > last.top + 2) rows.push({ top, chars: [i] });
          else last.chars.push(i);
        }
        if (rows.length === 0) continue;
        out.lines += rows.length;

        // 줄이 바뀐 경계마다 앞뒤 글자를 본다
        for (let r = 1; r < rows.length; r++) {
          const i = rows[r].chars[0];
          const prev = text[i - 1], cur = text[i];
          if (!prev) continue;
          const ctx = text.slice(Math.max(0, i - 8), i) + " ⏎ " + text.slice(i, i + 8);
          if (HAN.test(prev) && HAN.test(cur)) out.midWord.push(ctx);
          // 묶음이 "줄 사이에서" 갈라졌는지만 본다.
          // 줄이 묶음 바로 앞에서 바뀐 것("다루는 ⏎ 세 가지")은 정상이다.
          // 앞 줄의 마지막 어절과 뒷 줄의 첫 어절을 공백 하나로 이어 검사한다.
          const pre = (text.slice(0, i).match(/\S+\s*$/) || [""])[0].trim();
          const post = (text.slice(i).match(/^\S+/) || [""])[0];
          if (pre && post && UNITS.some((u) => u.test(pre + " " + post))) out.tightUnit.push(ctx);
        }

        // 마지막 줄에 어절 하나만 남았나 (2줄 이상일 때만)
        if (rows.length >= 2) {
          const s = rows[rows.length - 1].chars[0];
          const tail = text.slice(s).trim();
          if (tail.length > 0 && tail.length <= 6 && !/\s/.test(tail)) {
            out.widow.push(`…${text.slice(Math.max(0, s - 12), s)} ⏎ [${tail}]`);
          }
        }

        // 너무 긴 줄
        for (const row of rows) {
          const line = row.chars.map((i) => text[i]).join("");
          const han = (line.match(/[가-힣]/g) || []).length;
          if (han > 46) out.longLine.push(`${han}자: ${line.slice(0, 30)}…`);
        }
      }
    }
    out.overflow = document.documentElement.scrollWidth - window.innerWidth;
    return out;
  }, SEL);
}

async function run(base, label, sizes) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const total = { midWord: [], widow: [], longLine: [], tightUnit: [], overflow: 0, lines: 0 };
  const per = {};

  for (const [w, h] of sizes) {
    for (const route of ROUTES) {
      const r = await scan(page, base, route, w, h);
      const key = `${w}x${h}`;
      per[key] = per[key] || { midWord: 0, widow: 0, longLine: 0, tightUnit: 0, overflow: 0 };
      per[key].midWord += r.midWord.length;
      per[key].widow += r.widow.length;
      per[key].longLine += r.longLine.length;
      per[key].tightUnit += r.tightUnit.length;
      per[key].overflow = Math.max(per[key].overflow, r.overflow);
      for (const k of ["midWord", "widow", "longLine", "tightUnit"]) {
        total[k].push(...r[k].map((s) => `[${route} ${w}] ${s}`));
      }
      total.lines += r.lines;
      total.overflow = Math.max(total.overflow, r.overflow);
    }
  }
  await browser.close();

  console.log(`\n${"═".repeat(84)}\n  ${label}\n${"═".repeat(84)}`);
  console.log("  화면          어절중간  고아어절  긴줄(46자+)  의미단위분리  가로overflow");
  for (const [k, v] of Object.entries(per)) {
    console.log(`  ${k.padEnd(13)} ${String(v.midWord).padEnd(9)} ${String(v.widow).padEnd(9)} ${String(v.longLine).padEnd(12)} ${String(v.tightUnit).padEnd(13)} ${v.overflow}px`);
  }
  console.log(`  ${"합계".padEnd(11)} ${String(total.midWord.length).padEnd(9)} ${String(total.widow.length).padEnd(9)} ${String(total.longLine.length).padEnd(12)} ${String(total.tightUnit.length).padEnd(13)} ${total.overflow}px   (측정한 줄 ${total.lines})`);
  return total;
}

(async () => {
  const sizes = process.argv[3] === "mobile"
    ? [[390, 844]]
    : [[1366, 768], [1440, 900], [1536, 864], [1920, 1080], [390, 844]];
  // 기본은 로컬. 운영 도메인은 _target이 거부한다.
  const t = await run(resolveTarget("http://127.0.0.1:3220"), process.argv[4] || "측정", sizes);
  for (const k of ["midWord", "tightUnit", "widow", "longLine"]) {
    if (!t[k].length) continue;
    console.log(`\n  ── ${k} 예시 (총 ${t[k].length}건) ──`);
    [...new Set(t[k])].slice(0, 12).forEach((s) => console.log("   " + s));
  }
})();
