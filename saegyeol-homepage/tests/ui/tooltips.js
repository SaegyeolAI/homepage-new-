// 용어 툴팁 검증 (디자인 시스템 5장).
//  - 상세 페이지에만 있고 홈·랜딩에는 없다
//  - 한 페이지에 2~3개 이하, 같은 용어는 한 번만
//  - 호버·클릭·키보드로 열리고 Esc로 닫힌다
//  - 말풍선이 잘리거나 화면 밖으로 나가지 않는다
//  - 밑줄이 글자색과 같다
const { chromium } = require("playwright");
const { resolveTarget } = require("../_target");
// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:3220");

const DETAIL = ["product", "pricing", "feature-shadow", "feature-pii", "feature-report"];
const LANDING = ["home", "team"];

let pass = 0; const fails = [];
const ok = (m) => { pass++; console.log("  ✓ " + m); };
const no = (m) => { fails.push(m); console.log("  ✗ " + m); };

async function load(page, route) {
  await page.goto(`${BASE}/#${route}`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 25)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(e.message));

  console.log("\n[1] 홈·랜딩에는 툴팁이 없다 (5장)");
  for (const r of LANDING) {
    await load(page, r);
    const n = await page.evaluate(() => document.querySelectorAll(".sg-term").length);
    n === 0 ? ok(`${r}: 0개`) : no(`${r}: ${n}개 — 홈·랜딩에는 달지 않는다`);
  }

  console.log("\n[2] 상세 페이지 — 개수와 중복");
  for (const r of DETAIL) {
    await load(page, r);
    const info = await page.evaluate(() =>
      [...document.querySelectorAll(".sg-term")].map((e) => e.textContent.trim()));
    const uniq = new Set(info);
    if (info.length === 0) { no(`${r}: 0개 — 어려운 용어가 없는지 확인 필요`); continue; }
    if (info.length > 3) no(`${r}: ${info.length}개 (문서 기준 2~3개 이하) — ${info.join(", ")}`);
    else if (uniq.size !== info.length) no(`${r}: 같은 용어가 두 번 — ${info.join(", ")}`);
    else ok(`${r}: ${info.length}개 (${info.join(", ")})`);
  }

  console.log("\n[3] 열림·닫힘과 위치");
  await load(page, "product");
  const term = await page.$(".sg-term");
  // 이 페이지는 scroll-snap이 걸려 있어서, Playwright가 호버 직전에 하는
  // 자동 스크롤이 스냅과 부딪혀 엉뚱한 자리에 멈춘다. 먼저 화면 가운데로
  // 가져다 두고 멈춘 뒤에 호버한다.
  // Playwright의 hover()는 호버 직전에 스스로 한 번 더 스크롤하는데, 그게 스냅에
  // 밀려 요소가 다시 화면 밖으로 나간다. 직접 가운데로 옮겨 세운 뒤 좌표로 움직인다.
  await term.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(500);
  const box = await term.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  let tip = await page.evaluate(() => {
    const t = document.querySelector(".sg-tip");
    if (!t) return null;
    const r = t.getBoundingClientRect();
    const cs = getComputedStyle(t);
    return { text: t.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height),
      left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom),
      pos: cs.position, vw: window.innerWidth, vh: window.innerHeight,
      role: t.getAttribute("role"), id: t.id,
      describedby: document.querySelector(".sg-term").getAttribute("aria-describedby") };
  });
  tip ? ok(`호버로 열림: "${tip.text.slice(0, 28)}…"`) : no("호버해도 말풍선이 뜨지 않음");
  if (tip) {
    tip.pos === "fixed" ? ok("position: fixed — 카드 overflow에 잘리지 않음") : no(`position ${tip.pos}`);
    (tip.left >= 0 && tip.right <= tip.vw && tip.top >= 0 && tip.bottom <= tip.vh)
      ? ok(`화면 안에 들어옴 (${tip.left},${tip.top} ~ ${tip.right},${tip.bottom} / ${tip.vw}x${tip.vh})`)
      : no(`화면 밖으로 나감 (${tip.left},${tip.top} ~ ${tip.right},${tip.bottom} / ${tip.vw}x${tip.vh})`);
    tip.w <= 280 ? ok(`최대 폭 ${tip.w}px ≤ 280px`) : no(`폭 ${tip.w}px`);
    tip.role === "tooltip" && tip.describedby === tip.id
      ? ok(`aria-describedby가 말풍선과 연결됨 (${tip.id})`)
      : no(`aria 연결 안 됨 (role=${tip.role}, describedby=${tip.describedby}, id=${tip.id})`);
  }

  // 마우스를 떼면 닫힌다
  await page.mouse.move(5, 5);
  await page.waitForTimeout(400);
  let gone = await page.evaluate(() => !document.querySelector(".sg-tip"));
  gone ? ok("마우스를 떼면 닫힘") : no("마우스를 떼도 남아 있음");

  // 클릭으로 고정, Esc로 닫기
  await term.click();
  await page.waitForTimeout(350);
  const pinned = await page.evaluate(() => !!document.querySelector(".sg-tip"));
  await page.mouse.move(5, 5);
  await page.waitForTimeout(350);
  const stillOpen = await page.evaluate(() => !!document.querySelector(".sg-tip"));
  pinned && stillOpen ? ok("클릭하면 고정되어 마우스를 떼도 남음") : no(`클릭 고정 안 됨 (열림=${pinned}, 유지=${stillOpen})`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  gone = await page.evaluate(() => !document.querySelector(".sg-tip"));
  gone ? ok("Esc로 닫힘") : no("Esc로 안 닫힘");

  // 클릭이 카드 이동으로 번지지 않는가
  const before = page.url();
  await load(page, "product");
  const inCard = await page.evaluate(() => {
    const t = [...document.querySelectorAll(".sg-term")].find((e) => e.closest(".card, .card-link"));
    return t ? t.textContent.trim() : null;
  });
  if (inCard) {
    await page.click(`.card .sg-term`);
    await page.waitForTimeout(600);
    page.url().includes("#product") ? ok("카드 안 용어를 눌러도 페이지가 이동하지 않음") : no(`페이지가 이동함 → ${page.url()}`);
  } else {
    ok("카드 안에 놓인 용어 없음 (이동 번짐 위험 없음)");
  }

  console.log("\n[4] 키보드");
  await load(page, "product");
  await page.evaluate(() => document.querySelector(".sg-term").focus());
  await page.waitForTimeout(350);
  const byFocus = await page.evaluate(() => !!document.querySelector(".sg-tip"));
  byFocus ? ok("Tab 포커스로 열림") : no("포커스해도 안 열림");

  console.log("\n[5] 밑줄이 글자색과 같은가");
  await load(page, "product");
  const deco = await page.evaluate(() => {
    const t = document.querySelector(".sg-term");
    const cs = getComputedStyle(t);
    return { color: cs.color, decoColor: cs.textDecorationColor, style: cs.textDecorationStyle, line: cs.textDecorationLine };
  });
  deco.color === deco.decoColor && deco.style === "dotted" && deco.line.includes("underline")
    ? ok(`점선 밑줄이 글자색과 같음 (${deco.color})`)
    : no(`밑줄 ${deco.line}/${deco.style}/${deco.decoColor} vs 글자색 ${deco.color}`);

  console.log("\n[6] 모바일 390px — 탭으로 열고 화면 안에");
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const mp = await mctx.newPage();
  await load(mp, "product");
  const mt = await mp.$(".sg-term");
  await mt.click();
  await mp.waitForTimeout(450);
  const mtip = await mp.evaluate(() => {
    const t = document.querySelector(".sg-tip");
    if (!t) return null;
    const r = t.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), vw: window.innerWidth, vh: window.innerHeight };
  });
  if (!mtip) no("모바일에서 탭해도 안 열림");
  else (mtip.left >= 0 && mtip.right <= mtip.vw && mtip.top >= 0 && mtip.bottom <= mtip.vh)
    ? ok(`모바일: 화면 안 (${mtip.left}~${mtip.right} / ${mtip.vw}px)`)
    : no(`모바일: 화면 밖 (${mtip.left}~${mtip.right} / ${mtip.vw}px)`);
  await mctx.close();

  console.log("\n[7] 콘솔 에러");
  errs.length ? no("에러 " + errs.slice(0, 3).join(" | ")) : ok("없음");

  await browser.close();
  console.log("\n" + "=".repeat(62));
  console.log(`  통과 ${pass} / 실패 ${fails.length}`);
  process.exitCode = fails.length ? 1 : 0;
})();
