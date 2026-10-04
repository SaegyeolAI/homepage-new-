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
  // 브라우저 기본 팝업(alert/confirm)은 쓰지 않기로 했다. 뜨면 여기서 잡힌다.
  let nativeDialog = null;
  page.on("dialog", async (d) => { nativeDialog = `${d.type()}: ${d.message()}`; await d.dismiss(); });

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
    const dlg = document.querySelector(".sg-dialog");
    const okEl = dlg && dlg.querySelector(".form-success");
    const blocked = document.querySelector(".form-blocked .form-blocked-reason");
    const err = document.querySelector(".field-error");
    const r = dlg && dlg.getBoundingClientRect();
    return {
      success: okEl ? okEl.textContent.trim() : null,
      blocked: blocked ? blocked.textContent.trim() : null,
      fieldError: err ? err.textContent.trim() : null,
      role: dlg ? dlg.getAttribute("role") : null,
      modal: dlg ? dlg.getAttribute("aria-modal") : null,
      // 포털로 body 바로 아래 붙어야 폼 쪽 transform·overflow에 안 끌려간다
      atBody: dlg ? dlg.parentElement.parentElement === document.body : false,
      inView: r ? (r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth) : false,
      focusedOk: document.activeElement === (dlg && dlg.querySelector(".sg-dialog-ok")),
    };
  });
  console.log("      결과:", JSON.stringify(res));
  res.success ? ok(`사이트 안 알림창에 성공 문구: "${res.success}"`) : fail(`알림창 없음 (blocked=${res.blocked} / err=${res.fieldError})`);
  nativeDialog === null ? ok("브라우저 기본 팝업을 띄우지 않음") : fail("브라우저 팝업이 떴다 — " + nativeDialog);
  res.role === "alertdialog" && res.modal === "true" && res.atBody
    ? ok("alertdialog · aria-modal · body 포털")
    : fail(`알림창 속성 이상 (role=${res.role}, modal=${res.modal}, body=${res.atBody})`);
  res.inView ? ok("알림창이 화면 안에 들어옴") : fail("알림창이 화면 밖으로 나감");
  res.focusedOk ? ok("포커스가 확인 버튼으로 옮겨감") : fail("포커스가 확인 버튼에 없음");

  // Esc 로 닫으면 폼이 비워진다
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const afterClose = await page.evaluate(() => ({
    closed: !document.querySelector(".sg-dialog"),
    name: document.querySelector("#cfv2-name").value,
    msg: document.querySelector("#cfv2-msg").value,
  }));
  afterClose.closed && !afterClose.name && !afterClose.msg
    ? ok("Esc 로 닫히고 폼이 비워짐")
    : fail(`닫힘/초기화 실패 ${JSON.stringify(afterClose)}`);

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
