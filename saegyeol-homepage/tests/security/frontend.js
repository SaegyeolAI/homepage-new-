// 브라우저 쪽 점검 — 에러 표시, 해시 라우팅, 외부 링크, 보안 헤더 설정.
// 로컬 빌드(3220)를 대상으로 한다. 운영에는 요청하지 않는다.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { resolveTarget } = require("../_target");

// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:3220");
const REPO = path.resolve(__dirname, "..", "..");

const findings = [];
let pass = 0;
const ok = (m) => { pass++; console.log("  \u2713 " + m); };
const bad = (sev, m) => { findings.push({ sev, m }); console.log(`  \u2717 [${sev}] ` + m); };
const note = (m) => console.log("  \u00b7 " + m);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  console.log("\n\u2501\u2501 1. 서버 오류 문구가 화면에 안전하게 뜨는가 \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  // 서버가 태그가 섞인 오류 문구를 주면 화면이 어떻게 되는지
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify({ error: '<img src=x onerror="window.__pwned=1">오류' }),
    }));
  await page.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById("contact")?.scrollIntoView());
  await page.waitForTimeout(400);
  await page.fill("#cfv2-name", "점검");
  await page.fill("#cfv2-email", "a@b.co");
  await page.fill("#cfv2-msg", "오류 표시 점검용 문의 내용입니다.");
  await page.waitForTimeout(3400);
  await page.click("#contact form button[type=submit]");
  await page.waitForTimeout(1500);

  const r = await page.evaluate(() => ({
    pwned: !!window.__pwned,
    imgs: document.querySelectorAll('img[src="x"]').length,
    shown: (document.querySelector(".form-blocked-reason, .field-error, .form-error")
      || {}).textContent || null,
  }));
  r.pwned || r.imgs > 0
    ? bad("HIGH", `서버 오류 문구의 태그가 DOM으로 들어감 (pwned=${r.pwned}, img=${r.imgs})`)
    : ok("서버가 태그를 섞어 보내도 글자로만 표시됨 (React 이스케이프)");
  note(`화면에 뜬 문구: ${JSON.stringify(String(r.shown).slice(0, 60))}`);
  await page.unroute("**/api/contact");

  console.log("\n\u2501\u2501 2. 해시 라우팅으로 스크립트가 들어가는가 \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  const payloads = [
    '#<img src=x onerror="window.__h=1">',
    '#"><script>window.__h=1</script>',
    "#javascript:alert(1)",
    "#../../etc/passwd",
  ];
  let hashBad = 0;
  for (const p of payloads) {
    await page.goto(`${BASE}/${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const hit = await page.evaluate(() => ({ h: !!window.__h, imgs: document.querySelectorAll('img[src="x"]').length }));
    if (hit.h || hit.imgs) { bad("HIGH", `해시 주입이 실행됨: ${p}`); hashBad++; }
  }
  hashBad === 0 ? ok(`해시 4종 주입 모두 무해 (알 수 없는 라우트는 홈으로)`) : null;

  console.log("\n\u2501\u2501 3. 외부 링크 \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  await page.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const links = await page.evaluate(() => {
    const out = [];
    for (const r of ["home", "team", "product"]) {} // 홈만 봐도 푸터는 공통
    for (const a of document.querySelectorAll('a[target="_blank"]')) {
      out.push({ href: a.href, rel: a.getAttribute("rel") || "" });
    }
    return out;
  });
  const unsafe = links.filter((l) => !/noreferrer|noopener/.test(l.rel));
  links.length === 0
    ? note("새 창으로 여는 링크 없음")
    : unsafe.length === 0
      ? ok(`새 창 링크 ${links.length}개 전부 rel=noreferrer (탭 탈취 방지)`)
      : bad("LOW", `rel 없는 새 창 링크 ${unsafe.length}개: ${unsafe.map((l) => l.href).join(", ")}`);

  console.log("\n\u2501\u2501 4. 폼이 보내는 것 \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  let captured = null;
  await page.route("**/api/contact", async (route) => {
    const req = route.request();
    captured = { method: req.method(), headers: req.headers(), post: (req.postData() || "").slice(0, 600) };
    await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
  });
  await page.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById("contact")?.scrollIntoView());
  await page.fill("#cfv2-name", "점검");
  await page.fill("#cfv2-email", "a@b.co");
  await page.fill("#cfv2-msg", "폼 전송 내용 점검입니다.");
  await page.waitForTimeout(3400);
  await page.click("#contact form button[type=submit]");
  await page.waitForTimeout(1200);
  if (!captured) bad("MEDIUM", "폼 요청을 잡지 못함");
  else {
    captured.headers["content-type"]?.startsWith("multipart/form-data")
      ? ok("FormData로 전송 — 커스텀 헤더가 없어 preflight 없이 Origin 검사가 그대로 걸림")
      : note(`content-type: ${captured.headers["content-type"]}`);
    /company_site/.test(captured.post) ? ok("허니팟 칸이 함께 전송됨") : bad("LOW", "허니팟 칸이 전송되지 않음");
    /form_ts/.test(captured.post) ? ok("폼을 연 시각이 함께 전송됨") : bad("LOW", "form_ts가 전송되지 않음");
    const leak = /password|token|secret|authorization/i.test(JSON.stringify(captured.headers));
    leak ? bad("MEDIUM", "요청 헤더에 자격증명으로 보이는 값") : ok("요청 헤더에 자격증명 없음");
  }
  await page.unroute("**/api/contact");

  console.log("\n\u2501\u2501 5. 보안 헤더 설정 (vercel.json — 읽기만) \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  const vj = JSON.parse(fs.readFileSync(REPO + "/vercel.json", "utf8"));
  const all = vj.headers.flatMap((h) => h.headers.map((x) => x.key + ": " + x.value));
  const need = ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options",
    "X-Frame-Options", "Referrer-Policy", "Permissions-Policy",
    "Cross-Origin-Opener-Policy", "Cross-Origin-Resource-Policy"];
  const missing = need.filter((k) => !all.some((h) => h.startsWith(k + ":")));
  missing.length === 0 ? ok(`보안 헤더 ${need.length}종 모두 설정됨`) : bad("MEDIUM", `빠진 헤더: ${missing.join(", ")}`);
  const csp = all.find((h) => h.startsWith("Content-Security-Policy:")) || "";
  /unsafe-eval/.test(csp) ? bad("MEDIUM", "CSP에 unsafe-eval") : ok("CSP에 unsafe-eval 없음");
  /script-src[^;]*unsafe-inline/.test(csp) ? bad("MEDIUM", "script-src에 unsafe-inline") : ok("script-src에 unsafe-inline 없음");
  /object-src 'none'/.test(csp) ? ok("object-src 'none'") : bad("LOW", "object-src가 none이 아님");
  /frame-ancestors 'none'/.test(csp) ? ok("frame-ancestors 'none' (클릭재킹 방지)") : bad("MEDIUM", "frame-ancestors 없음");
  note("style-src에 unsafe-inline이 있다 — React 인라인 스타일 때문. 스타일 한정이라 스크립트 실행과는 무관");

  console.log("\n\u2501\u2501 6. 콘솔 \u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
  errs.length ? bad("LOW", "페이지 에러: " + errs.slice(0, 2).join(" | ")) : ok("페이지 에러 없음");

  await browser.close();
  console.log("\n" + "=".repeat(68));
  console.log(`  통과 ${pass}   문제 ${findings.length}`);
  findings.forEach((f) => console.log(`   [${f.sev}] ${f.m}`));
  process.exitCode = findings.some((f) => f.sev === "HIGH") ? 1 : 0;
})();
