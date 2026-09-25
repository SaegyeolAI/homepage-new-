const { useState, useEffect, useRef } = React;

// 파일 업로드 크기 제한 (프론트엔드 공통 상수).
// Vercel 서버리스 함수의 request body 한도가 4.5MB이므로 그 값에 맞춘다.
// 이보다 큰 값을 설정해도 플랫폼 단에서 거부되므로 백엔드(api/_utils.js의 FILE_LIMIT)와
// 반드시 동일하게 유지할 것. chrome.jsx가 가장 먼저 로드되므로 다른 페이지(team.jsx 등)에서도 이 상수를 재사용한다.
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "4.5MB";

/* ---------------- Full-page scroll ---------------- */

// 풀페이지 스크롤을 적용하는 라우트.
// 개인정보처리방침·이용약관은 끝까지 읽어 내려가는 긴 문서라 제외한다.
const SNAP_ROUTES = new Set([
  "home", "team", "product", "pricing",
  "feature-shadow", "feature-pii", "feature-report",
]);

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 모바일 해제 기준. styles.css의 `@media (max-width: 800px)`와 반드시 같이 움직일 것.
const SNAP_MIN_WIDTH = 801;
const snapActive = (route) =>
  SNAP_ROUTES.has(route) && window.innerWidth >= SNAP_MIN_WIDTH && !prefersReducedMotion();

// 스냅 단위가 될 섹션을 찾아 표시하고, 도트 내비게이션이 쓸 라벨을 붙인다.
// 페이지 컴포넌트가 감싸는 [data-screen-label] 컨테이너의 직계 <section>이
// 한 화면 단위이며, 마지막 CTA(.closing-cta)도 같은 방식으로 포함된다.
function markSnapSections() {
  const page = document.querySelector("[data-screen-label]");
  if (!page) return [];
  const sections = [...page.children].filter((el) => el.tagName === "SECTION");
  sections.forEach((el, i) => {
    el.classList.add("snap-section");

    // 화면보다 긴 섹션은 CSS 스냅 지점에서 뺀다.
    // 안 그러면 섹션 안에서 조금 내렸을 때 proximity가 윗변으로 도로 끌어당긴다.
    // 이런 섹션의 이동은 아래 휠 핸들러가 한 화면씩 직접 처리한다.
    el.classList.toggle("snap-tall", el.offsetHeight > window.innerHeight + 4);

    if (!el.dataset.sectionLabel) {
      const source =
        el.querySelector(".section-label")?.textContent ||
        el.querySelector("h1, h2")?.textContent ||
        `섹션 ${i + 1}`;
      const clean = source.replace(/\s+/g, " ").trim();
      // 스크린리더용 이름이므로 길면 자르되, 단어 중간에서 끊기지 않게 한다.
      const MAX = 40;
      el.dataset.sectionLabel = clean.length <= MAX
        ? clean
        : `${clean.slice(0, MAX).replace(/\s+\S*$/, "")}…`;
    }
  });
  return sections;
}

// 키보드로 한 섹션씩 이동. 입력 중이거나 조합키가 눌린 경우는 건드리지 않는다.
const SCROLL_KEYS = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1 };

function isTextEntry(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

// Space는 버튼·링크·details를 여는 기본 동작이 있어 더 넓게 양보한다.
function isActivatable(el) {
  if (!el) return false;
  return ["BUTTON", "A", "SUMMARY", "DETAILS", "LABEL"].includes(el.tagName);
}

/* ---------------- 휠 한 번 = 한 섹션 ---------------- */

// CSS scroll-snap만으로는 "한 번에 한 섹션"이 되지 않는다. proximity는
// 스크롤이 멎은 뒤에야 개입해서, 조금 내리면 제자리로 끌려오는 느낌이 난다.
// (mandatory로 바꾸면 화면보다 긴 섹션의 내용이 잘린다.)
// 그래서 스냅은 그대로 두고, 휠 입력만 여기서 가로채 한 섹션씩 옮긴다.

const WHEEL_MIN_DELTA = 4;        // 트랙패드 미세 떨림 무시
const WHEEL_QUIET_MS = 120;       // 이만큼 휠이 멎어야 관성이 끝난 것으로 본다
const WHEEL_SETTLE_TIMEOUT = 1200;
const EDGE_TOLERANCE = 2;

// 긴 섹션 안에서 한 번에 움직이는 양. 한 화면을 통째로 넘기면 읽던 자리를
// 잃어버려서, 직전 화면의 마지막 부분이 위에 조금 남도록 줄인다.
const WHEEL_STEP_RATIO = 0.85;

// 고정 nav가 화면 위쪽을 덮는다. 그만큼은 스크롤해도 읽히지 않으므로
// 이동량 계산에서 빼야 내용이 nav 뒤로 건너뛰지 않는다.
function stickyTopOffset() {
  const nav = document.querySelector(".nav");
  if (!nav) return 0;
  const position = getComputedStyle(nav).position;
  if (position !== "fixed" && position !== "sticky") return 0;
  return Math.round(nav.getBoundingClientRect().height);
}

// 휠이 향하는 쪽으로 더 스크롤할 수 있는 조상이 있으면 그대로 둔다.
// 입력 칸, 가로 스크롤 표, 모달 내부가 여기에 걸린다.
function scrollableAncestor(start, direction) {
  let el = start;
  while (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
    if (isTextEntry(el)) return el;
    if (el.getAttribute("role") === "dialog" || el.getAttribute("aria-modal") === "true") return el;

    const style = getComputedStyle(el);
    // 가로로 스크롤되는 표는 세로로 못 움직여도 건드리지 않는다.
    if (/(auto|scroll)/.test(style.overflowX) && el.scrollWidth > el.clientWidth + 1) return el;

    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1) {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if (direction > 0 ? !atBottom : !atTop) return el;
    }
    el = el.parentElement;
  }
  return null;
}

function snapGeometry() {
  const sections = [...document.querySelectorAll(".snap-section")];
  if (sections.length < 2) return null;
  const tops = sections.map((el) => el.offsetTop);
  const heights = sections.map((el) => el.offsetHeight);
  const y = window.scrollY;
  let index = 0;
  tops.forEach((top, i) => { if (top <= y + EDGE_TOLERANCE) index = i; });
  return { tops, heights, index, y, vh: window.innerHeight };
}

function useWheelSnap(route) {
  useEffect(() => {
    if (!SNAP_ROUTES.has(route)) return undefined;

    let locked = false;      // 이동 애니메이션이 끝날 때까지 추가 입력을 막는다
    let settled = true;      // 목표 위치에 도착했는가
    let frame = 0;
    let quietTimer = 0;

    const releaseWhenQuiet = () => {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(() => { if (settled) locked = false; }, WHEEL_QUIET_MS);
    };

    const glideTo = (target) => {
      locked = true;
      settled = false;
      window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      const startedAt = Date.now();
      const check = () => {
        const arrived = Math.abs(window.scrollY - target) <= EDGE_TOLERANCE;
        if (arrived || Date.now() - startedAt > WHEEL_SETTLE_TIMEOUT) {
          settled = true;
          releaseWhenQuiet();
          return;
        }
        frame = requestAnimationFrame(check);
      };
      frame = requestAnimationFrame(check);
    };

    const onWheel = (e) => {
      if (!snapActive(route)) return;

      // 조합키가 눌린 휠은 절대 가로채지 않는다. 브라우저·OS의 기본 동작이다.
      //   Ctrl  — 브라우저 확대·축소 (트랙패드 핀치도 ctrlKey로 들어온다)
      //   Meta  — macOS의 Cmd 확대·축소
      //   Shift — 가로 스크롤
      //   Alt   — 일부 브라우저의 가로 스크롤
      // 여기서 preventDefault를 하면 확대가 먹지 않거나 가로 스크롤이 죽는다.
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      if (Math.abs(e.deltaY) < WHEEL_MIN_DELTA) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;      // 가로 제스처

      const direction = e.deltaY > 0 ? 1 : -1;
      if (scrollableAncestor(e.target, direction)) return;

      // 애니메이션 중이거나 관성이 아직 남아 있으면 삼킨다.
      // 트랙패드 한 번에 휠 이벤트가 수십 개 들어와도 한 섹션만 움직이는 이유다.
      if (locked) {
        e.preventDefault();
        releaseWhenQuiet();
        return;
      }

      const g = snapGeometry();
      if (!g) return;

      const { tops, heights, index, y, vh } = g;
      const top = tops[index];
      const bottom = top + heights[index];
      const maxScroll = document.documentElement.scrollHeight - vh;
      let target;

      // 화면보다 긴 섹션은 섹션 안에서 먼저 조금씩 움직인다.
      // 끝(또는 시작)에 닿은 다음 휠에서 옆 섹션으로 넘어간다.
      //
      // 이동량은 "nav에 가리지 않고 실제로 읽히는 높이"의 85%다.
      // 한 화면을 통째로 넘기면 읽던 자리를 잃고, nav 높이를 빼지 않으면
      // 다음 화면의 첫 부분이 nav 뒤로 들어가 건너뛰어진다.
      if (heights[index] > vh + EDGE_TOLERANCE) {
        const readable = Math.max(120, vh - stickyTopOffset());
        const step = Math.max(80, Math.round(readable * WHEEL_STEP_RATIO));
        if (direction > 0 && y + vh < bottom - EDGE_TOLERANCE) {
          target = Math.min(y + step, bottom - vh);   // 마지막엔 섹션 끝에 딱 맞춘다
        } else if (direction < 0 && y > top + EDGE_TOLERANCE) {
          target = Math.max(y - step, top);
        }
      }

      if (target === undefined) {
        const next = index + direction;
        if (next < 0) {
          if (y <= EDGE_TOLERANCE) return;
          target = 0;
        } else if (next >= tops.length) {
          // 마지막 섹션 뒤에는 푸터가 있다. 더 내려갈 데가 없으면 브라우저에 넘긴다.
          if (y >= maxScroll - EDGE_TOLERANCE) return;
          target = maxScroll;
        } else {
          target = tops[next];
        }
      }

      target = Math.max(0, Math.min(target, maxScroll));
      if (Math.abs(target - y) < 1) return;

      e.preventDefault();
      glideTo(target);
    };

    // preventDefault를 쓰므로 passive가 아니어야 한다.
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frame);
      clearTimeout(quietTimer);
    };
  }, [route]);
}

function useFullScroll(route) {
  // 라우트가 바뀌면 맨 위로. (해시 라우팅이라 브라우저가 대신 해주지 않는다)
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    return () => cancelAnimationFrame(frame);
  }, [route]);

  // <html data-snap="on">으로 CSS 스냅을 켠다. 실제 해제 조건(모바일 폭,
  // prefers-reduced-motion)은 styles.css의 미디어 쿼리가 최종 판단한다.
  useEffect(() => {
    const root = document.documentElement;
    if (SNAP_ROUTES.has(route)) root.dataset.snap = "on";
    else delete root.dataset.snap;

    const t = setTimeout(markSnapSections, 60);

    // 창 크기가 바뀌면 "화면보다 긴 섹션"의 판정도 달라진다. 다시 잰다.
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(markSnapSections, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      delete root.dataset.snap;
    };
  }, [route]);

  useWheelSnap(route);

  // 키보드 이동
  useEffect(() => {
    if (!SNAP_ROUTES.has(route)) return undefined;

    const onKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (!snapActive(route)) return;

      const target = e.target;
      const isSpace = e.key === " " || e.code === "Space";
      if (isTextEntry(target)) return;
      if (isSpace && isActivatable(target)) return;

      const direction = isSpace ? (e.shiftKey ? -1 : 1) : SCROLL_KEYS[e.key];
      if (!direction) return;

      const sections = [...document.querySelectorAll(".snap-section")];
      if (sections.length < 2) return;

      const viewport = window.innerHeight;
      const current = window.scrollY;
      const tops = sections.map((el) => el.offsetTop);

      let next;
      if (direction > 0) {
        next = tops.find((top) => top > current + 4);
        if (next === undefined) next = document.body.scrollHeight - viewport;
      } else {
        const earlier = tops.filter((top) => top < current - 4);
        next = earlier.length ? earlier[earlier.length - 1] : 0;
      }

      // 화면보다 긴 섹션 안에 있으면 한 번에 건너뛰지 않고 한 화면씩만 움직인다.
      if (Math.abs(next - current) > viewport) next = current + direction * viewport;

      e.preventDefault();
      window.scrollTo({ top: Math.max(0, next), behavior: "smooth" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [route]);
}

/* ---------------- Section dots ---------------- */
function SectionDots({ route }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const sectionsRef = useRef([]);

  useEffect(() => {
    if (!SNAP_ROUTES.has(route)) {
      sectionsRef.current = [];
      setItems([]);
      return undefined;
    }

    let frame = 0;
    const sync = () => {
      const sections = sectionsRef.current;
      if (!sections.length) return;
      // 화면 중앙이 어느 섹션 위에 있는지로 현재 섹션을 정한다.
      const middle = window.scrollY + window.innerHeight / 2;
      let index = 0;
      sections.forEach((el, i) => { if (el.offsetTop <= middle) index = i; });
      setActive(index);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    // 페이지가 렌더된 뒤에 섹션을 읽어야 한다. useReveal과 같은 지연폭을 쓴다.
    const t = setTimeout(() => {
      sectionsRef.current = markSnapSections();
      setItems(sectionsRef.current.map((el, i) => ({
        key: i,
        label: el.dataset.sectionLabel || `섹션 ${i + 1}`,
      })));
      sync();
    }, 80);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [route]);

  if (items.length < 2) return null;

  const goTo = (index) => {
    const el = sectionsRef.current[index];
    if (!el) return;
    window.scrollTo({
      top: el.offsetTop,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <nav className="section-dots" aria-label="섹션 바로가기">
      <ul>
        {items.map((item, i) => (
          <li key={item.key}>
            <button
              type="button"
              className={"section-dot" + (i === active ? " is-active" : "")}
              aria-label={`${item.label} 섹션으로 이동`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              {/* 눈에 보이는 툴팁은 두지 않는다. 섹션 이름은 aria-label로만 전달한다. */}
              <span className="section-dot-mark" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------- Back button (법적 고지 페이지용) ---------------- */
const BackArrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

function BackButton({ onBack }) {
  return (
    <button type="button" className="back-link" aria-label="이전 페이지로 돌아가기" onClick={onBack}>
      <BackArrow />
      <span>뒤로</span>
    </button>
  );
}

// 개인정보처리방침은 4,600px(5화면)이 넘는다. 위쪽 .back-link는 문서 흐름에
// 놓여 있어서, 아래까지 읽고 나면 나가려고 네 화면을 거슬러 올라가야 했다.
//
// 항상 떠 있는 버튼 대신 스크롤 감지형으로 둔다. 이 사이트는 얇은 테두리와
// 낮은 대비로 조용하게 끌고 가는 톤이라, 법적 문서 위에 상시 떠 있는 알약은
// 계속 거슬린다. 위쪽에서는 원래 버튼이 바로 보이므로 띄울 이유도 없다.
// 그래서 원래 버튼이 화면 밖으로 나간 뒤에만 나타나고, 푸터에 닿으면 다시 숨는다.
const BACK_FLOAT_SHOW_AT = 480;   // 위쪽 .back-link가 확실히 화면을 벗어나는 지점
const BACK_FLOAT_FOOTER_GAP = 180; // 푸터 링크를 가리지 않도록 미리 비켜난다

function FloatingBackButton({ onBack }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      const atBottom = y + window.innerHeight > document.documentElement.scrollHeight - BACK_FLOAT_FOOTER_GAP;
      setVisible(y > BACK_FLOAT_SHOW_AT && !atBottom);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 숨을 때 visibility: hidden 이라 탭 순서와 접근성 트리에서도 빠진다.
  return (
    <button type="button" className={`back-float${visible ? " is-visible" : ""}`}
      aria-label="이전 페이지로 돌아가기" onClick={onBack}>
      <BackArrow />
      <span>뒤로</span>
    </button>
  );
}

/* ---------------- Scroll Reveal ---------------- */
function useReveal(route) {
  useEffect(() => {
    const SELECTORS = [
      'section.block .section-head',
      'section.block .cards > article',
      'section.block .stats',
      'section.block .flow-step',
      'section.block .banner',
      'section.block .contact-grid > div',
      'section.block .team-grid',
      'section.block .recruit',
      '.closing-cta-inner',
      '.privacy-header',
      '.privacy-section',
    ].join(',');

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (e.target.classList.contains('sr')) {
          e.target.classList.add('sr-in');
        } else {
          e.target.classList.add('line-in');
        }
        observer.unobserve(e.target);
      }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const t = setTimeout(() => {
      document.querySelectorAll(SELECTORS).forEach(el => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) return;
        el.classList.add('sr');
        const siblings = el.parentElement
          ? [...el.parentElement.children].filter(c => c.classList.contains('sr'))
          : [];
        const idx = siblings.indexOf(el);
        if (idx > 0) el.classList.add(`sr-d${Math.min(idx, 3)}`);
        observer.observe(el);
      });

      document.querySelectorAll('section.block').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('line-in');
        } else {
          observer.observe(el);
        }
      });
    }, 60);

    return () => { clearTimeout(t); observer.disconnect(); };
  }, [route]);
}

/* ---------------- Theme ---------------- */

// 처음 온 방문자는 다크모드를 보게 한다.
// 한 번이라도 토글을 누른 사람은 저장된 선택을 그대로 따른다.
const THEME_KEY = "saegyeol-theme-v3";
const DEFAULT_THEME = "dark";

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
  } catch {
    // 시크릿 모드나 쿠키 차단 환경에서는 localStorage 접근 자체가 예외를 던진다.
    // 최상단에서 호출하므로 여기서 막지 않으면 앱 전체가 뜨지 않는다.
    return DEFAULT_THEME;
  }
}

// React가 그리기 전에 <html data-theme>을 맞춰 둔다.
// index.html이 이미 dark로 시작하므로, 라이트를 저장해 둔 재방문자만 여기서 바뀐다.
// CSP가 script-src 'self'라 인라인 스크립트를 쓸 수 없어서, 번들에서 가장 먼저
// 실행되는 이 파일 최상단에 둔다. (build.js의 FILES 첫 번째가 chrome.jsx)
document.documentElement.setAttribute("data-theme", readStoredTheme());

function useTheme() {
  const [theme, setTheme] = useState(readStoredTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // 저장에 실패해도 이번 세션 화면은 정상 동작한다.
    }
    // 모바일 브라우저 주소창 색도 같이 맞춘다. 값은 CSS 토큰에서 그대로 읽어
    // 색을 두 곳에 적어두지 않는다.
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  }, [theme]);
  return [theme, setTheme];
}

/* ---------------- Brand ---------------- */
function Brand({ onClick, showSub }) {
  return (
    <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }}>
      <img src="logo.png" alt="Saegyeol" className="brand-logo" />
      {showSub && <span className="brand-sub">새결</span>}
    </a>
  );
}

/* ---------------- Icons (small) ---------------- */
const Icon = {
  shadow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="4" />
      <circle cx="15" cy="15" r="4" strokeDasharray="2 2" />
      <path d="M3 21c0-3 3-5 6-5" />
    </svg>
  ),
  pii: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M5 16c1-1.5 3-2 4-2s3 .5 4 2" />
      <path d="M15 9h4M15 13h3" />
    </svg>
  ),
  report: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
      <path d="M16.5 17l2 2 3-3.5" stroke="var(--accent-ink, currentColor)" />
    </svg>
  ),
  inject: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h10" />
      <path d="M14 8l4 4-4 4" />
      <circle cx="20" cy="12" r="1.2" fill="currentColor" />
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  graph: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18V8M10 18V4M16 18v-7M22 18H2" />
    </svg>
  ),
};

/* ---------------- Mega-menu Nav ---------------- */
function Nav({ route, setRoute, theme, setTheme }) {
  const [open, setOpen] = useState(null); // 'products' | null
  const closeTimer = useRef(null);

  const enter = (id) => {
    clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const goContact = createContactNav(setRoute);

  const go = (id, hash) => {
    setOpen(null);
    if (id === "contact") {
      goContact();
    } else {
      setRoute(id);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), CONTACT_SCROLL_DELAY);
    }
  };

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Brand onClick={() => go("home")} showSub />

        <div className="nav-links">
          <div className={"nav-item" + (open === "products" ? " open" : "")}
            onMouseEnter={() => enter("products")} onMouseLeave={leave}>
            <button className={"nav-link" + (["product", "pricing", "feature-shadow", "feature-pii", "feature-report"].includes(route) ? " active" : "")} onClick={() => go("product")}>
              제품 <span className="chev">▾</span>
            </button>
            <div className="mega" role="menu">
              <div className="mega-col">
                <h5>제품</h5>
                <a className="mega-item" role="menuitem" tabIndex={0}
                  onClick={() => go("product")}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("product"); }}>
                  <div className="t" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    여울
                  </div>
                  <div className="d">한국어 AI 에이전트 자동 침투 테스트 서비스</div>
                </a>
                <a className="mega-item" role="menuitem" tabIndex={0}
                  onClick={() => go("pricing")}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("pricing"); }}>
                  <div className="t">여울 요금 안내</div>
                  <div className="d">무료 · 프로 · 프랜차이즈 플랜 비교</div>
                </a>
              </div>
              <div className="mega-col">
                <h5>여울 기능</h5>
                <a className="mega-item" role="menuitem" tabIndex={0} onClick={() => go("feature-shadow")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("feature-shadow"); }}>
                  <div className="t">Shadow Agent 탐지</div>
                  <div className="d">사각지대의 개인 AI 에이전트 발견</div>
                </a>
                <a className="mega-item" role="menuitem" tabIndex={0} onClick={() => go("feature-pii")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("feature-pii"); }}>
                  <div className="t">K-PII 차단</div>
                  <div className="d">한국식 개인정보 14종 전용 탐지</div>
                </a>
                <a className="mega-item" role="menuitem" tabIndex={0} onClick={() => go("feature-report")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("feature-report"); }}>
                  <div className="t">컴플라이언스 리포트</div>
                  <div className="d">ISMS-P · 개인정보보호법 자동 매핑</div>
                </a>
              </div>
              <div className="mega-col">
                <h5>RESOURCES</h5>
                <a className="mega-item" role="menuitem" tabIndex={0} onClick={() => go("contact")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("contact"); }}>
                  <div className="t">도입 상담</div>
                  <div className="d">서비스 적용 범위와 도입 절차를 안내합니다</div>
                </a>
                <a className="mega-item" role="menuitem" tabIndex={0} onClick={() => go("team")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go("team"); }}>
                  <div className="t">팀 만나기</div>
                  <div className="d">새결을 만드는 사람들</div>
                </a>
              </div>
            </div>
          </div>

          <button className={"nav-link" + (route === "pricing" ? " active" : "")} onClick={() => go("pricing")}>요금제</button>
          <button className={"nav-link" + (route === "team" ? " active" : "")} onClick={() => go("team")}>팀 소개</button>
          <button className={"nav-link"} onClick={() => go("contact")}>문의</button>

          <button className="theme-toggle" aria-label="모드 변경" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- Contact navigation (전 페이지 공통) ---------------- */

// 예전에는 페이지마다 goContact가 따로 있었고 setTimeout 지연도 60/80/100ms로
// 제각각이었다. 모든 "문의" CTA는 이 한 곳을 통해 홈의 #contact로 간다.
const CONTACT_SCROLL_DELAY = 100;

// 페이지 컴포넌트는 `const goContact = createContactNav(setRoute)` 로 받아 쓴다.
//
// 어떤 버튼으로 들어오든 문의 칸은 빈 채로 시작한다.
// 예전에는 CTA마다 맥락 문구를 문의 내용에 미리 채워 넣었는데,
// 쓰려던 말을 지우고 시작해야 해서 오히려 방해가 됐다.
function createContactNav(setRoute) {
  return () => {
    setRoute("home");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, CONTACT_SCROLL_DELAY);
  };
}

// 모든 페이지가 같은 모양의 문의 버튼을 쓰도록 한 컴포넌트로 모았다.
function ContactButton({ onContact, variant = "accent", onDark = false }) {
  const className = [
    "btn",
    variant === "accent" ? "btn-accent" : "btn-ghost",
    onDark ? "on-dark" : "",
  ].filter(Boolean).join(" ");

  return (
    <button type="button" className={className} onClick={() => onContact()}>
      문의하기 <span className="arrow">→</span>
    </button>
  );
}

/* ---------------- Closing CTA (full-bleed) ---------------- */
function ClosingCTA({ onContact }) {
  return (
    <section className="closing-cta" data-section-label="문의하기">
      <div className="closing-cta-inner">
        <span className="label">JOIN US</span>
        <h2>지금 새결과<br />함께하세요.</h2>
        <p>AI 에이전트를 내보내기 전에 한국어 공격 관점으로 한 번 점검해 보세요. 어디까지 확인했고 무엇이 남았는지 함께 정리해 드립니다.</p>
        <div className="hero-cta">
          <ContactButton onContact={onContact} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ setRoute }) {
  const goContact = createContactNav(setRoute);

  const go = (id, hash) => {
    if (id === "contact") {
      goContact();
    } else {
      setRoute(id);
      window.scrollTo({ top: 0 });
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), CONTACT_SCROLL_DELAY);
    }
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-left">
            <Brand onClick={() => go("home")} />
            <div className="footer-legal">
              <div className="row"><span className="k">회사명</span><span>새결 (Saegyeol)</span></div>
              <div className="row"><span className="k">대표자</span><span>황지후</span></div>
              <div className="row"><span className="k">사업자번호</span><span>101-30-53151</span></div>
              <div className="row"><span className="k">주소</span><span>부산광역시 해운대구 좌동순환로8번길 78, 103동 801호(중동, 해운대메트로하이츠)</span></div>
              <div className="row"><span className="k">이메일</span><span>contact@saegyeol.ai.kr</span></div>
            </div>
          </div>
          <div className="footer-right">
            <div>
              <h5>PRODUCT</h5>
              <ul>
                <li onClick={() => go("product")}>여울</li>
                <li onClick={() => go("pricing")}>요금제</li>
              </ul>
            </div>
            <div>
              <h5>COMPANY</h5>
              <ul>
                <li onClick={() => go("team")}>팀 소개</li>
                <li onClick={() => go("team", "recruit")}>채용</li>
                <li onClick={() => go("contact")}>문의</li>
              </ul>
            </div>
            <div>
              <h5>FOLLOW</h5>
              <ul>
                <li><a href="https://www.instagram.com/saegyeol_official" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "none" }}>Instagram</a></li>
                <li><a href="mailto:contact@saegyeol.ai.kr" style={{ color: "inherit", textDecoration: "none" }}>Email</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Saegyeol. All rights reserved.</span>
          <span>
            <a href="#" style={{ marginRight: 24 }} onClick={(e) => { e.preventDefault(); go("privacy"); }}>개인정보처리방침</a>
            <a href="#" onClick={(e) => { e.preventDefault(); go("terms"); }}>이용약관</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Form primitives (문의 폼 · 채용 지원 폼 공용) ---------------- */

// 문의 폼과 채용 지원 폼이 같은 마크업·같은 상태 표시를 쓰도록 모아둔 조각들.
// 전송 경로(엔드포인트·FormData 키·검증 순서)는 각 폼이 그대로 유지한다.

// 첨부 허용 형식. 서버(api/_config.js ALLOWED_UPLOADS)와 같이 고쳐야 한다.
// 여기서 막는 건 파일 선택 창을 좁혀 주는 편의일 뿐이고, 실제 판정은 서버가 한다.
const UPLOAD_ACCEPT = ".pdf,.docx,.pptx,.png,.jpg,.jpeg";
const UPLOAD_TYPES_LABEL = "PDF · DOCX · PPTX · PNG · JPG";

const CONTACT_MAIL = "contact@saegyeol.ai.kr";

// 폼이 막혔을 때 쓸 대체 경로. 지금까지 쓴 내용을 그대로 담아 메일 앱을 연다.
function mailtoHref(subject, body) {
  const trimmed = (body || "").slice(0, 1500);
  return `mailto:${CONTACT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed)}`;
}

function formatSeconds(total) {
  if (total <= 0) return "곧";
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}분 ${String(s).padStart(2, "0")}초` : `${s}초`;
}

// 남은 시간을 1초마다 다시 그린다.
function useCountdown(until) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!until) return undefined;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [until]);
  if (!until) return null;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function FormStatus({ sent, successText }) {
  if (!sent) return null;
  return <div className="form-success" role="status">{successText}</div>;
}

// 폼이 막혔을 때 보여주는 블록.
// 세 가지를 반드시 함께 보여준다 — 왜 막혔는지, 언제 다시 되는지, 지금 당장 쓸 대체 경로.
// 입력한 내용은 지우지 않으므로 그 사실도 같이 알린다.
function FormBlocked({ reason, retryText, retryAt, mailSubject, mailBody }) {
  const left = useCountdown(retryAt);
  return (
    <div className="form-blocked">
      <div role="alert">
        <p className="form-blocked-reason">{reason}</p>
        {retryText && <p className="form-blocked-retry">{retryText}</p>}
        <p className="form-blocked-fallback">
          급하시면 <a href={mailtoHref(mailSubject, mailBody)}>{CONTACT_MAIL}</a>로 직접 보내주세요.
          적어주신 내용은 그대로 남아 있습니다.
        </p>
      </div>
      {left !== null && left > 0 && (
        <p className="form-blocked-countdown" aria-hidden="true">{formatSeconds(left)} 남음</p>
      )}
    </div>
  );
}

// 봇 걸러내기용. 사람에게는 보이지 않고 탭으로도 닿지 않는다.
// 판정은 서버(api/_utils.js detectBot)가 한다.
function Honeypot({ startedAt }) {
  return (
    <div className="hp-field" aria-hidden="true">
      <label htmlFor="company_site">회사 홈페이지</label>
      <input id="company_site" name="company_site" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      <input type="hidden" name="form_ts" value={startedAt} readOnly />
    </div>
  );
}

// 필수/선택을 누르기 전에 알 수 있게 한다.
// 별표는 눈으로만 보는 표시라 aria-hidden으로 감추고,
// 스크린리더에는 입력 요소의 aria-required로 알린다.
function FormField({ id, label, optional, error, children }) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className={`row${error ? " row-invalid" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional
          ? <span className="field-optional"> (선택)</span>
          : <span className="field-required" aria-hidden="true"> *</span>}
      </label>
      {children({ describedBy, invalid: !!error, required: !optional })}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

function TextField({ id, label, type = "text", placeholder, value, onChange, autoComplete, error }) {
  return (
    <FormField id={id} label={label} error={error}>
      {({ describedBy, invalid, required }) => (
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </FormField>
  );
}

function FileField({ id, label, optional, file, fileRef, onSelect, note, error }) {
  return (
    <FormField id={id} label={label} optional={optional} error={error}>
      {({ describedBy, invalid, required }) => (
        <React.Fragment>
          <input
            ref={fileRef}
            id={id}
            type="file"
            accept={UPLOAD_ACCEPT}
            style={{ display: "none" }}
            onChange={(e) => onSelect(e.target.files?.[0] || null)}
          />
          {/* role="button" 이라 이름이 없으면 스크린리더가 안쪽 글을 통째로 읽는다.
              선택한 파일이 있으면 그 이름까지 이름에 담아 상태를 알 수 있게 한다. */}
          <div className={`file-drop${invalid ? " file-drop-invalid" : ""}`} role="button" tabIndex={0}
            aria-label={file ? `첨부파일 선택됨: ${file.name}. 다시 선택하려면 누르세요` : "첨부파일 선택"}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onSelect(e.dataTransfer.files?.[0] || null); }}>
            <div className="icon">{file ? "✓" : "↑"}</div>
            <div className="meta">
              <div className="name">{file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"}</div>
              <div className="sub">{file ? `${(file.size / 1024).toFixed(1)} KB` : `${UPLOAD_TYPES_LABEL} (최대 ${MAX_UPLOAD_LABEL}, 한 개)`}</div>
            </div>
          </div>
          <p className="field-note">{note}</p>
        </React.Fragment>
      )}
    </FormField>
  );
}

// 버튼은 잠그지 않는다. 눌러야 무엇이 잘못됐는지 알 수 있기 때문이다.
// 예전에는 빈 칸으로 제출하면 아무 설명 없이 버튼만 회색이 됐다.
function FormActions({ sending, label, hint }) {
  return (
    <div className="actions">
      <span className="hint">{hint}</span>
      <button type="submit" className="btn btn-accent" disabled={sending}>
        {sending ? "전송 중…" : <>{label} <span className="arrow">→</span></>}
      </button>
    </div>
  );
}

// 파일 선택 공통 처리. 두 폼 모두 같은 한도(백엔드 FILE_LIMIT과 동일)를 쓴다.
// 크기 초과는 alert 대신 필드 에러로 돌려준다.
function useFileSelect() {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef(null);

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    if (nextFile.size > MAX_UPLOAD_BYTES) {
      setFileError(`파일이 너무 큽니다. ${MAX_UPLOAD_LABEL} 이하로 줄이거나, 링크로 보내주세요.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFileError("");
    setFile(nextFile);
  };

  const clearFile = () => {
    setFile(null);
    setFileError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return { file, fileRef, fileError, setFileError, selectFile, clearFile };
}

// 서버 응답을 사람이 읽을 수 있는 차단 안내로 바꾼다.
// "10분에 5번" 같은 숫자는 여기서 만들지 않는다 — 서버가 준 문구를 그대로 쓴다.
// 그래야 나중에 한도를 바꿔도 화면 문구가 어긋나지 않는다.
function describeFailure(status, payload) {
  const fromServer = payload && typeof payload.error === "string" ? payload.error : "";
  const retryAfter = payload && Number(payload.retryAfter);
  const retryAt = Number.isFinite(retryAfter) && retryAfter > 0 ? Date.now() + retryAfter * 1000 : null;

  if (status === 429) {
    return {
      reason: fromServer || "짧은 시간에 너무 많이 보내셨습니다.",
      retryText: retryAt
        ? `약 ${formatSeconds(Math.ceil((retryAt - Date.now()) / 1000))} 뒤에 다시 보낼 수 있습니다.`
        : "잠시 후 다시 시도해 주세요.",
      retryAt,
    };
  }
  if (status === 503) {
    return { reason: fromServer || "문의 접수가 일시적으로 중단되어 있습니다.",
      retryText: "복구되는 대로 다시 받습니다. 그전까지는 아래 주소로 보내주세요." };
  }
  if (status === 403) {
    return { reason: fromServer || "지금 이 페이지에서는 문의를 보낼 수 없습니다.",
      retryText: "페이지를 새로고침한 뒤 다시 시도해 주세요." };
  }
  if (status === 413) {
    return { reason: "첨부파일이 너무 커서 보내지 못했습니다.",
      retryText: `파일을 빼거나 ${MAX_UPLOAD_LABEL} 이하로 줄여 다시 보내주세요.` };
  }
  if (status >= 500) {
    return { reason: fromServer || "서버에서 문제가 생겨 보내지 못했습니다.",
      retryText: "잠시 후 다시 시도해 주세요." };
  }
  if (status === 0) {
    return { reason: "네트워크에 연결하지 못했습니다.",
      retryText: "인터넷 연결을 확인하고 다시 시도해 주세요." };
  }
  return { reason: fromServer || "보내지 못했습니다.",
    retryText: "내용을 확인하고 다시 시도해 주세요." };
}

// 응답이 JSON이 아닐 수 있다. Vercel의 413 같은 플랫폼 오류는 HTML을 돌려주는데,
// 예전에는 res.json()이 거기서 터져 "Unexpected token '<'" 같은 문구가 그대로 보였다.
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------------- Inline contact form ---------------- */
const SUBMIT_COOLDOWN_MS = 60_000;
const lastSubmitKey = "saegyeol-last-submit";

// 어느 칸이 왜 비었는지 알려주려고, 필드별로 따로 검사한다.
// 예전에는 세 조건을 하나의 불리언으로 묶어서 "뭔가 잘못됐다"는 것밖에 알 수 없었다.
function validateContact(data) {
  const errors = {};
  if (!data.name.trim()) errors["cfv2-name"] = "이름을 적어주세요.";
  if (!data.email.trim()) errors["cfv2-email"] = "이메일 주소를 적어주세요.";
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors["cfv2-email"] = "이메일 주소를 다시 확인해 주세요. (예: you@company.kr)";
  if (!data.message.trim()) errors["cfv2-msg"] = "문의 내용을 적어주세요.";
  else if (data.message.trim().length < 4) errors["cfv2-msg"] = "조금만 더 자세히 적어주세요. (네 글자 이상)";
  return errors;
}

// 첫 번째 문제 칸으로 옮겨 준다. 고정 nav에 가리지 않도록 화면 가운데로 맞춘 뒤 포커스한다.
function focusFirstError(errors, order) {
  const firstId = order.find((id) => errors[id]);
  if (!firstId) return;
  const el = document.getElementById(firstId);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
}

function ContactForm() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [blocked, setBlocked] = useState(null);
  const startedAt = useRef(Date.now()).current;
  const { file, fileRef, fileError, setFileError, selectFile, clearFile } = useFileSelect();

  // 어떤 경로로 들어오든 세 칸 모두 빈 채로 시작한다.
  // (자동 채움을 쓰지 않으므로 마운트 시 따로 할 일이 없다.)

  // 고친 칸의 에러는 타이핑하는 즉시 지운다.
  const update = (key, id) => (value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[id] ? { ...prev, [id]: "" } : prev));
  };

  const submit = async (e) => {
    e.preventDefault();

    const found = validateContact(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setBlocked(null);
      focusFirstError(found, ["cfv2-name", "cfv2-email", "cfv2-msg"]);
      return;
    }

    let lastSubmit = 0;
    try {
      lastSubmit = parseInt(localStorage.getItem(lastSubmitKey) || "0", 10) || 0;
    } catch { lastSubmit = 0; }
    const waited = Date.now() - lastSubmit;
    if (waited < SUBMIT_COOLDOWN_MS) {
      const retryAt = lastSubmit + SUBMIT_COOLDOWN_MS;
      setBlocked({
        reason: "방금 보내신 문의가 접수됐습니다. 연달아 보내는 것만 잠깐 막고 있습니다.",
        retryText: `약 ${formatSeconds(Math.ceil((retryAt - Date.now()) / 1000))} 뒤에 다시 보낼 수 있습니다.`,
        retryAt,
      });
      return;
    }

    setSending(true);
    setBlocked(null);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("message", data.message);
      formData.append("company_site", document.getElementById("company_site")?.value || "");
      formData.append("form_ts", String(startedAt));
      if (file) formData.append("file", file);

      const res = await fetch("/api/contact", { method: "POST", body: formData });
      const payload = await readJson(res);
      if (!res.ok) {
        setBlocked(describeFailure(res.status, payload));
        return;
      }
      try { localStorage.setItem(lastSubmitKey, String(Date.now())); } catch { /* 저장 못 해도 전송은 끝났다 */ }
      setSent(true);
      setTimeout(() => { setSent(false); setData({ name: "", email: "", message: "" }); clearFile(); setErrors({}); }, 5000);
    } catch {
      // fetch 자체가 실패한 경우(오프라인·DNS 등). 브라우저 영문 메시지는 쓰지 않는다.
      setBlocked(describeFailure(0, null));
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <FormStatus sent={sent} successText="문의가 전송되었습니다. 영업일 기준 1일 내 회신드립니다." />
      {blocked && <FormBlocked {...blocked}
        mailSubject={`[새결 문의] ${data.name || ""}`.trim()}
        mailBody={data.message} />}
      <Honeypot startedAt={startedAt} />
      <TextField id="cfv2-name" label="이름 / NAME" placeholder="홍길동" autoComplete="name"
        value={data.name} onChange={update("name", "cfv2-name")} error={errors["cfv2-name"]} />
      <TextField id="cfv2-email" label="이메일 / EMAIL" type="email" placeholder="you@company.kr" autoComplete="email"
        value={data.email} onChange={update("email", "cfv2-email")} error={errors["cfv2-email"]} />
      <FormField id="cfv2-msg" label="문의 내용 / MESSAGE" error={errors["cfv2-msg"]}>
        {({ describedBy, invalid, required }) => (
          <textarea id="cfv2-msg" name="cfv2-msg" placeholder="자세한 문의 내용을 적어주세요."
            aria-required={required || undefined}
            aria-invalid={invalid || undefined} aria-describedby={describedBy}
            value={data.message} onChange={(e) => update("message", "cfv2-msg")(e.target.value)} />
        )}
      </FormField>
      <FileField id="cfv2-file" label="첨부파일 / ATTACHMENT" optional
        file={file} fileRef={fileRef} onSelect={selectFile} error={fileError}
        note={`한 개만 첨부할 수 있습니다. 여러 개이거나 ${MAX_UPLOAD_LABEL}를 넘으면 드라이브 등에 올린 링크를 문의 내용에 적어주세요.`} />
      <FormActions sending={sending} label="문의 보내기" hint={`→ ${CONTACT_MAIL} 로 전송됩니다`} />
    </form>
  );
}

Object.assign(window, {
  useTheme, useFullScroll, useReveal, Nav, Footer, Brand, ContactForm, ClosingCTA, Icon,
  SectionDots, BackButton, FloatingBackButton, ContactButton, createContactNav, SNAP_ROUTES,
  FormStatus, FormField, TextField, FileField, FormActions, useFileSelect,
  FormBlocked, Honeypot, describeFailure, readJson, focusFirstError, formatSeconds, CONTACT_MAIL,
});
