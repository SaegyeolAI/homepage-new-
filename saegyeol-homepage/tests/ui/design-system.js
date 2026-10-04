// saegyeol_design.md 9장 출고 전 체크리스트를 실제 렌더에서 확인한다.
// 코드로 지킬 수 있는 항목만 — 로고 원본 여부 같은 건 사람이 본다.
const { chromium } = require("playwright");

const { resolveTarget } = require("../_target");
// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:3220");

const ROUTES = ["home", "product", "pricing", "team",
  "feature-shadow", "feature-pii", "feature-report", "privacy", "terms"];

let pass = 0; const fails = [];
const ok = (m) => { pass++; console.log("  ✓ " + m); };
const no = (m) => { fails.push(m); console.log("  ✗ " + m); };

// WCAG 상대휘도 대비
function lum(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
const rgb = (s) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
function ratio(fg, bg) {
  const a = lum(rgb(fg)), b = lum(rgb(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function sweep(page, theme) {
  const perRoute = [];
  for (const route of ROUTES) {
    await page.goto(`${BASE}/#${route}`, { waitUntil: "networkidle" });
    await page.evaluate((t) => { try { localStorage.setItem("saegyeol-theme-v3", t); } catch {} }, theme);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 25)); }
      window.scrollTo(0, 0);
    });
    perRoute.push({ route, ...await page.evaluate(() => {
      const HAN = /[가-힣]/;
      const out = { monoKo: [], caps: [], reds: 0, lowContrast: [], radii: {}, shadowCards: [] };

      // 4장: 한국어가 고정폭 서체에 들어가면 안 된다
      for (const el of document.querySelectorAll("*")) {
        if (el.children.length) continue;
        const t = (el.textContent || "").trim();
        if (!t || !HAN.test(t)) continue;
        const ff = getComputedStyle(el).fontFamily.toLowerCase();
        if (/mono|courier|consolas/.test(ff)) {
          out.monoKo.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}: ${t.slice(0, 22)}`);
        }
      }

      // 4장: 영문 라벨 전부 대문자 금지 (로고 워드마크 예외)
      for (const el of document.querySelectorAll("*")) {
        if (el.children.length) continue;
        const t = (el.textContent || "").trim();
        if (!/^[A-Z][A-Z0-9 ·&/+-]{3,}$/.test(t)) continue;
        if (el.closest(".brand")) continue;             // 로고
        // 표준 이름과 약어는 고유명사다. 문서가 금지하는 것은 "영문 라벨"을
        // 대문자로 쓰는 것이지 ISO/IEC 42001 같은 이름이 아니다.
        if (/^(PDF|DOCX|PPTX|PNG|JPG|NDA|ISMS|K-ISMS|NIST|ISO|EU|AI|OWASP|MCP|SOC)/.test(t)) continue;
        out.caps.push(t);
      }

      // 3.2: 레드팀 레드는 한 화면에 한 군데 이하
      const isRed = (c) => {
        const m = (c.match(/\d+/g) || []).map(Number);
        return m.length >= 3 && m[0] > 150 && m[1] < 90 && m[2] < 90;
      };
      const seen = new Set();
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (el.offsetParent === null && el.tagName !== "BODY") continue;
        if (isRed(cs.color) || isRed(cs.backgroundColor)) seen.add(el);
      }
      out.reds = seen.size;

      // 9장: 본문 대비 4.5:1 이상 (여기선 색만 모아 보내고 계산은 바깥에서)
      const samples = [];
      for (const el of document.querySelectorAll("p, li, td, .k, .section-label, .hero-sub, .basis")) {
        if (el.offsetParent === null) continue;
        const cs = getComputedStyle(el);
        let bgEl = el, bg = "rgba(0, 0, 0, 0)";
        while (bgEl && bg === "rgba(0, 0, 0, 0)") {
          bg = getComputedStyle(bgEl).backgroundColor;
          if (bg === "rgba(0, 0, 0, 0)") bgEl = bgEl.parentElement;
        }
        samples.push({ fg: cs.color, bg, size: parseFloat(cs.fontSize),
          weight: cs.fontWeight, what: `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`,
          text: (el.textContent || "").trim().slice(0, 18) });
      }
      out.samples = samples;

      // 5장: 평면 카드에 그림자를 쓰지 않는다
      for (const el of document.querySelectorAll(".card, .pricing-card, .flow-step, .info-card")) {
        const sh = getComputedStyle(el).boxShadow;
        if (sh && sh !== "none") out.shadowCards.push(String(el.className).split(" ")[0]);
      }
      return out;
    }) });
  }
  return perRoute;
}

(async () => {
  const browser = await chromium.launch();
  for (const theme of ["light", "dark"]) {
    console.log(`\n━━━ ${theme} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const rows = await sweep(page, theme);

    const mono = rows.flatMap((r) => r.monoKo.map((s) => `${r.route}: ${s}`));
    mono.length === 0 ? ok("한국어가 고정폭 서체에 들어간 곳 없음")
      : no(`한국어 + 고정폭 ${mono.length}건 — ${[...new Set(mono)].slice(0, 4).join(" / ")}`);

    const caps = rows.flatMap((r) => r.caps.map((s) => `${r.route}: ${s}`));
    caps.length === 0 ? ok("전부 대문자 영문 라벨 없음")
      : no(`대문자 라벨 ${caps.length}건 — ${[...new Set(caps)].slice(0, 5).join(" / ")}`);

    const redBad = rows.filter((r) => r.reds > 1);
    redBad.length === 0 ? ok(`레드팀 레드가 화면당 1곳 이하 (최대 ${Math.max(...rows.map(r => r.reds))})`)
      : no(`레드가 2곳 이상인 페이지: ${redBad.map((r) => `${r.route}(${r.reds})`).join(", ")}`);

    const low = [];
    for (const r of rows) {
      for (const s of r.samples) {
        if (!s.bg || s.bg === "rgba(0, 0, 0, 0)") continue;
        const need = (s.size >= 18.66 || (s.size >= 24)) ? 3 : 4.5;
        const c = ratio(s.fg, s.bg);
        if (c < need) low.push(`${r.route} ${s.what} "${s.text}" ${c.toFixed(2)}:1`);
      }
    }
    low.length === 0 ? ok("본문 대비 전부 4.5:1 이상")
      : no(`대비 미달 ${low.length}건 — ${[...new Set(low)].slice(0, 4).join(" / ")}`);

    const sh = rows.flatMap((r) => r.shadowCards);
    sh.length === 0 ? ok("평면 카드에 그림자 없음")
      : no(`카드 그림자 ${sh.length}건 — ${[...new Set(sh)].join(", ")}`);

    await ctx.close();
  }
  await browser.close();
  console.log("\n" + "=".repeat(60));
  console.log(`  통과 ${pass} / 실패 ${fails.length}`);
  process.exitCode = fails.length ? 1 : 0;
})();
