// 테마 기본값 검증. 2026-10-03부터 명세가 바뀌었다.
//   기본 = 라이트(물보라). 다크는 토글로만. OS의 prefers-color-scheme은 보지 않는다.
// (이전 버전은 "다크 기본"을 단정했고, 스크래치패드 초기화로 지워져 새로 썼다.)
const { chromium } = require("playwright");
const { resolveTarget } = require("../_target");
// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:3210");

const problems = [];
const fail = (m) => { problems.push(m); console.log("  FAIL  " + m); };
const ok = (m) => console.log("  ok    " + m);

const FOAM = "rgb(245, 248, 251)";   // #F5F8FB 물보라
const DEEP = "rgb(8, 26, 46)";       // #081A2E 심해

const readState = (p) => p.evaluate(() => ({
  attr: document.documentElement.getAttribute("data-theme"),
  bg: getComputedStyle(document.body).backgroundColor,
  themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  stored: (() => { try { return localStorage.getItem("saegyeol-theme-v3"); } catch { return "BLOCKED"; } })(),
}));

(async () => {
  const b = await chromium.launch();

  /* 1. 처음 오는 방문자 */
  console.log("\n[1] 처음 오는 방문자 (localStorage 비어 있음)");
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  let p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  let s = await readState(p);
  console.log(`      data-theme=${s.attr}  bg=${s.bg}  theme-color=${s.themeColor}  저장값=${s.stored}`);
  s.attr === "light" ? ok("라이트로 보임 (디자인 시스템 6.3 물보라 히어로)") : fail(`기본이 라이트가 아님 (${s.attr})`);
  s.bg === FOAM ? ok("배경이 물보라 #F5F8FB") : fail(`배경 ${s.bg}`);
  s.themeColor === "#F5F8FB" ? ok("주소창 색도 물보라") : fail(`theme-color=${s.themeColor}`);
  errs.length ? fail("콘솔 에러: " + errs.join(" | ")) : ok("콘솔 에러 없음");
  await ctx.close();

  /* 2. HTML 최초 응답 — 어두운 화면이 번쩍이지 않게 */
  console.log("\n[2] HTML 초기값");
  const res = await (await b.newContext()).newPage().then(async (pg) => {
    const r = await pg.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    return r.text();
  });
  /<html[^>]*data-theme="light"/.test(res)
    ? ok("HTML이 이미 light — JS 실행 전에도 밝은 화면")
    : fail("HTML 초기값이 light가 아님 → 어두운 화면이 한 번 번쩍임");

  /* 3. 다크를 골라 둔 재방문자 */
  console.log("\n[3] 다크를 골라둔 재방문자");
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  p = await ctx.newPage();
  await p.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.setItem("saegyeol-theme-v3", "dark"));
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  s = await readState(p);
  console.log(`      data-theme=${s.attr}  bg=${s.bg}  theme-color=${s.themeColor}`);
  s.attr === "dark" ? ok("저장된 다크 선택이 유지됨") : fail(`선택이 무시됨 (${s.attr})`);
  s.bg === DEEP ? ok("배경이 심해 #081A2E") : fail(`배경 ${s.bg}`);
  s.themeColor === "#081A2E" ? ok("주소창 색도 심해") : fail(`theme-color=${s.themeColor}`);
  await ctx.close();

  /* 4. 토글 */
  console.log("\n[4] 토글 동작");
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  p = await ctx.newPage();
  await p.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.click(".theme-toggle");
  await p.waitForTimeout(500);
  s = await readState(p);
  s.attr === "dark" && s.stored === "dark" ? ok("라이트 → 다크 전환, 저장값=dark") : fail(`토글 후 ${s.attr}/${s.stored}`);
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  s = await readState(p);
  s.attr === "dark" ? ok("새로고침해도 선택 유지") : fail(`새로고침 후 ${s.attr}`);
  await p.click(".theme-toggle");
  await p.waitForTimeout(500);
  s = await readState(p);
  s.attr === "light" ? ok("다시 라이트로 복귀") : fail(`${s.attr}`);
  await ctx.close();

  /* 5. OS가 다크여도 따라가지 않는다 */
  console.log("\n[5] OS 설정(prefers-color-scheme: dark)");
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  p = await ctx.newPage();
  await p.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  s = await readState(p);
  s.attr === "light" && s.bg === FOAM
    ? ok("OS가 다크여도 라이트 유지 — 저장된 선택만 본다")
    : fail(`OS 설정을 따라감 (${s.attr} / ${s.bg})`);
  await ctx.close();

  /* 6. localStorage가 막힌 환경 */
  console.log("\n[6] localStorage 차단 (시크릿 모드 등)");
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  p = await ctx.newPage();
  await p.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked"); } });
  });
  const errs5 = [];
  p.on("pageerror", (e) => errs5.push(e.message));
  await p.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const rendered = await p.$eval("#root", (e) => e.innerHTML.length);
  const attr5 = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
  rendered > 500 && attr5 === "light"
    ? ok(`페이지 정상 렌더 (#root ${rendered}자), data-theme=${attr5}`)
    : fail(`렌더 실패 또는 테마 이상 (#root ${rendered}, ${attr5}) — ${errs5.join(" | ")}`);
  await ctx.close();

  /* 7. 전 페이지 두 테마 렌더 */
  console.log("\n[7] 전 페이지 렌더");
  for (const theme of ["light", "dark"]) {
    ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    p = await ctx.newPage();
    const e7 = [];
    p.on("console", (m) => { if (m.type() === "error") e7.push(m.text()); });
    p.on("pageerror", (e) => e7.push(e.message));
    let bad = 0;
    for (const r of ["home", "product", "pricing", "team", "privacy", "terms", "feature-pii"]) {
      await p.goto(`${BASE}/#${r}`, { waitUntil: "networkidle" });
      await p.evaluate((t) => { try { localStorage.setItem("saegyeol-theme-v3", t); } catch {} }, theme);
      await p.reload({ waitUntil: "networkidle" });
      await p.waitForTimeout(450);
      const st = await readState(p);
      if (st.attr !== theme) { fail(`${theme}/${r}: ${st.attr}`); bad++; }
    }
    bad === 0 && e7.length === 0
      ? ok(`${theme}: 7개 페이지 전부 정상, 콘솔 에러 없음`)
      : fail(`${theme}: 어긋남 ${bad}개, 콘솔 에러 ${e7.length}건 ${e7.slice(0, 2).join(" | ")}`);
    await ctx.close();
  }

  await b.close();
  console.log("\n" + "=".repeat(46));
  console.log(problems.length ? `실패 ${problems.length}건` : "전부 통과");
  process.exitCode = problems.length ? 1 : 0;
})();
