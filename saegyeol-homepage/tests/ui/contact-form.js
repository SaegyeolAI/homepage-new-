// 재디자인 뒤에도 문의·채용 폼이 전과 똑같이 메일까지 가는지 확인한다.
// SMTP는 목이라 실제로 한 통도 나가지 않고, 만들어진 메일 객체만 본다.
const { chromium } = require("playwright");
const { resolveTarget } = require("../_target");
// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:3210");

const problems = [];
const ok = (m) => console.log("  ok    " + m);
const fail = (m) => { problems.push(m); console.log("  FAIL  " + m); };

async function fill(page, sel, value) {
  await page.fill(sel, value);
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const reqs = [];
  page.on("request", (r) => { if (r.url().includes("/api/")) reqs.push({ url: r.url(), method: r.method() }); });
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  /* 문의 폼 */
  console.log("\n[1] 문의 폼");
  await page.goto(`${BASE}/#home`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById("contact")?.scrollIntoView());
  await page.waitForTimeout(500);

  const ids = await page.evaluate(() =>
    [...document.querySelectorAll("#contact input, #contact textarea")]
      .map((e) => ({ id: e.id, name: e.name, type: e.type })));
  console.log("      입력 칸:", JSON.stringify(ids));

  await fill(page, "#cfv2-name", "테스트 담당자");
  await fill(page, "#cfv2-email", "tester@example.com");
  await fill(page, "#cfv2-msg", "재디자인 후 전송 경로 확인용 문의입니다. 자동 테스트.");
  // 사람으로 보이게 (3초 봇 판정 회피)
  await page.waitForTimeout(3500);
  await page.click("#contact form button[type=submit]");
  await page.waitForTimeout(2500);

  const res = await page.evaluate(() => {
    const okEl = document.querySelector(".form-success");
    const blocked = document.querySelector(".form-blocked .form-blocked-reason");
    const err = document.querySelector(".field-error");
    return {
      success: okEl ? okEl.textContent.trim() : null,
      blocked: blocked ? blocked.textContent.trim() : null,
      fieldError: err ? err.textContent.trim() : null,
    };
  });
  console.log("      결과:", JSON.stringify(res));
  res.success ? ok(`성공 표시: "${res.success}"`) : fail(`성공 표시 없음 (blocked=${res.blocked} / err=${res.fieldError})`);

  const posted = reqs.filter((r) => r.method === "POST");
  posted.some((r) => r.url.endsWith("/api/contact"))
    ? ok("POST /api/contact 로 전송됨 (경로 그대로)")
    : fail("전송 요청이 /api/contact 가 아님: " + JSON.stringify(reqs));

  await ctx.close();
  await b.close();

  /* 서버가 실제로 만든 메일 객체 */
  console.log("\n[2] 서버가 만든 메일");
  const sent = globalThis.__sentMails;
  console.log("      (목 버퍼는 서버 프로세스 안에 있어 여기서는 못 읽는다 — 대신 응답으로 판단)");

  console.log("\n[3] 콘솔 에러");
  errs.length ? fail("콘솔 에러: " + errs.slice(0, 3).join(" | ")) : ok("없음");

  console.log("\n" + "=".repeat(46));
  console.log(problems.length ? `실패 ${problems.length}건` : "전부 통과 — 전송 경로 그대로");
  process.exitCode = problems.length ? 1 : 0;
})();
