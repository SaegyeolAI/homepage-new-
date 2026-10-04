// Part 2 합격 기준 단정.
//
//   "풀페이지 스크롤 라우트의 모든 섹션이 1366x768 / 1440x900 / 1536x864 /
//    1920x1080 네 크기 전부에서 한 화면 안에 들어간다."
//
// 이것이 성립하면 .snap-tall이 붙는 섹션이 하나도 없고, 휠 한 번은 항상
// 정확히 한 섹션이 된다. 배치를 고치기 전에는 당연히 실패한다 — 실패 목록이
// 곧 남은 할 일이다. tweaks.js(회귀 감시)와 섞지 않으려고 파일을 나눴다.
//
// 안전장치도 같이 본다: 1366x768보다 좁거나 낮은 창에서는 섹션이 화면보다
// 길어도 되지만, 내용이 잘리지 않고 섹션 안에서 스크롤되어야 한다.
const { chromium } = require("playwright");

const { resolveTarget } = require("../_target");
// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:3220");

const ROUTES = ["home", "product", "pricing", "team",
  "feature-shadow", "feature-pii", "feature-report"];
const SIZES = [[1366, 768], [1440, 900], [1536, 864], [1920, 1080]];
// 기준보다 작은 창 / 확대 상태. 여기서는 "들어감"을 요구하지 않고 "잘리지 않음"만 본다.
const SMALL = [[1280, 600], [960, 540]];

let pass = 0; const fails = [];
const ok = (m) => { pass++; console.log("  ✓ " + m); };
const no = (m) => { fails.push(m); console.log("  ✗ " + m); };

async function snapshot(page, route) {
  await page.goto(`${BASE}/#${route}`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(750);
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  return page.evaluate(() => {
    const vh = window.innerHeight;
    return {
      vh,
      snap: document.documentElement.dataset.snap || "off",
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      sections: [...document.querySelectorAll(".snap-section")].map((el) => ({
        label: el.dataset.sectionLabel || el.id || el.className.split(" ")[0],
        h: Math.round(el.offsetHeight),
        over: Math.round(el.offsetHeight) - vh,
        tall: el.classList.contains("snap-tall"),
        // 내용이 섹션 박스 밖으로 삐져나왔는지 (잘림 신호)
        clipped: el.scrollHeight - el.clientHeight > 2 &&
          getComputedStyle(el).overflowY === "hidden",
      })),
    };
  });
}

(async () => {
  const browser = await chromium.launch();

  console.log("\n[1] 네 개 데스크톱 크기 — 모든 섹션이 한 화면 안에");
  for (const [w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const bad = [];
    let count = 0;
    for (const route of ROUTES) {
      const s = await snapshot(page, route);
      for (const sec of s.sections) {
        count++;
        if (sec.over > 4) bad.push(`${route}/${sec.label} ${sec.h}px(+${sec.over})`);
      }
    }
    if (bad.length === 0) ok(`${w}x${h}: ${count}개 섹션 전부 한 화면 안`);
    else no(`${w}x${h}: ${bad.length}/${count}개가 화면보다 김 — ${bad.slice(0, 4).join(", ")}${bad.length > 4 ? ` 외 ${bad.length - 4}건` : ""}`);
    await ctx.close();
  }

  console.log("\n[2] snap-tall 보정이 더 필요한가");
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await ctx.newPage();
    let tall = 0;
    for (const route of ROUTES) {
      const s = await snapshot(page, route);
      tall += s.sections.filter((x) => x.tall).length;
    }
    if (tall === 0) ok("1366x768에서 .snap-tall 섹션 0개 — 긴 섹션 보정 코드가 데스크톱에서 쓰이지 않음");
    else no(`1366x768에서 .snap-tall 섹션 ${tall}개 — 아직 보정 코드가 필요함`);
    await ctx.close();
  }

  console.log("\n[3] 기준보다 작은 창 — 잘리지 않고 섹션 안에서 스크롤되는 안전장치");
  for (const [w, h] of SMALL) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const clipped = []; let reachable = true;
    for (const route of ROUTES) {
      const s = await snapshot(page, route);
      for (const sec of s.sections) if (sec.clipped) clipped.push(`${route}/${sec.label}`);
      if (s.overflowX > 0) reachable = false;
    }
    if (clipped.length === 0 && reachable) ok(`${w}x${h}: 잘린 섹션 0개 · 가로 overflow 0`);
    else no(`${w}x${h}: 잘린 섹션 ${clipped.length}개${!reachable ? " · 가로 overflow 발생" : ""} ${clipped.slice(0, 3).join(", ")}`);
    await ctx.close();
  }

  await browser.close();
  console.log("\n" + "=".repeat(66));
  console.log(`  통과 ${pass} / 실패 ${fails.length}`);
  if (fails.length) {
    console.log("\n  남은 일 (Part 2 재배치 대상):");
    fails.forEach((f) => console.log("    - " + f));
  }
  process.exitCode = fails.length ? 1 : 0;
})();
