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
    if (!el.dataset.sectionLabel) {
      const source =
        el.querySelector(".section-label")?.textContent ||
        el.querySelector("h1, h2")?.textContent ||
        `섹션 ${i + 1}`;
      const clean = source.replace(/\s+/g, " ").trim();
      // 툴팁이므로 길면 자르되, 단어 중간에서 끊기지 않게 마지막 공백까지만 쓴다.
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
    return () => { clearTimeout(t); delete root.dataset.snap; };
  }, [route]);

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
              <span className="section-dot-mark" aria-hidden="true" />
              <span className="section-dot-tip" aria-hidden="true">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------- Back button (법적 고지 페이지용) ---------------- */
function BackButton({ onBack }) {
  return (
    <button type="button" className="back-link" aria-label="이전 페이지로 돌아가기" onClick={onBack}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
      </svg>
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
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("saegyeol-theme-v3") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("saegyeol-theme-v3", theme);
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
const CONTACT_PREFILL_EVENT = "saegyeol:contact-prefill";

// 라우트 전환 직후에는 ContactForm이 아직 마운트 전일 수 있다.
// 이벤트를 놓치더라도 마운트 시점에 집어갈 수 있도록 값을 잠시 보관한다.
let pendingContactPrefill = "";

function takeContactPrefill() {
  const value = pendingContactPrefill;
  pendingContactPrefill = "";
  return value;
}

// 페이지 컴포넌트는 `const goContact = createContactNav(setRoute)` 로 받아 쓴다.
// 인자로 넘긴 문구는 문의 내용 칸에 미리 채워진다(사용자가 이미 쓴 내용은 건드리지 않음).
function createContactNav(setRoute) {
  return (prefillMessage) => {
    setRoute("home");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (prefillMessage) {
        pendingContactPrefill = prefillMessage;
        window.dispatchEvent(new CustomEvent(CONTACT_PREFILL_EVENT));
      }
    }, CONTACT_SCROLL_DELAY);
  };
}

// 모든 페이지가 같은 모양의 문의 버튼을 쓰도록 한 컴포넌트로 모았다.
// 문구는 "문의하기"로 통일하고, 맥락은 prefill로 전달한다.
function ContactButton({ onContact, prefill, variant = "accent", onDark = false }) {
  const className = [
    "btn",
    variant === "accent" ? "btn-accent" : "btn-ghost",
    onDark ? "on-dark" : "",
  ].filter(Boolean).join(" ");

  return (
    <button type="button" className={className} onClick={() => onContact(prefill)}>
      문의하기 <span className="arrow">→</span>
    </button>
  );
}

/* ---------------- Closing CTA (full-bleed) ---------------- */
function ClosingCTA({ onContact, prefill }) {
  return (
    <section className="closing-cta" data-section-label="문의하기">
      <div className="closing-cta-inner">
        <span className="label">JOIN US</span>
        <h2>지금 새결과<br />함께하세요.</h2>
        <p>AI 에이전트를 내보내기 전에 한국어 공격 관점으로 한 번 점검해 보세요. 어디까지 확인했고 무엇이 남았는지 함께 정리해 드립니다.</p>
        <div className="hero-cta">
          <ContactButton onContact={onContact} prefill={prefill} />
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

function FormStatus({ sent, successText, error }) {
  return (
    <React.Fragment>
      {sent && <div className="form-success" role="status">{successText}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
    </React.Fragment>
  );
}

function FormField({ id, label, optional, children }) {
  return (
    <div className="row">
      <label htmlFor={id}>
        {label}
        {optional && <span style={{ fontWeight: 400, opacity: 0.5 }}> (선택)</span>}
      </label>
      {children}
    </div>
  );
}

function TextField({ id, label, type = "text", placeholder, value, onChange, autoComplete }) {
  return (
    <FormField id={id} label={label}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}

function FileField({ id, label, optional, file, fileRef, onSelect, note }) {
  return (
    <FormField id={id} label={label} optional={optional}>
      <input
        ref={fileRef}
        id={id}
        type="file"
        accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.png,.jpg,.jpeg"
        style={{ display: "none" }}
        onChange={(e) => onSelect(e.target.files?.[0] || null)}
      />
      <div className="file-drop" role="button" tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onSelect(e.dataTransfer.files?.[0] || null); }}>
        <div className="icon">{file ? "✓" : "↑"}</div>
        <div className="meta">
          <div className="name">{file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"}</div>
          <div className="sub">{file ? `${(file.size / 1024).toFixed(1)} KB` : `PDF · PPT · DOC · ZIP · 이미지 등 (최대 ${MAX_UPLOAD_LABEL})`}</div>
        </div>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
        {note}<span className="mono" style={{ fontSize: 12 }}>contact@saegyeol.ai.kr</span>로 직접 보내주세요.
      </p>
    </FormField>
  );
}

function FormActions({ sending, disabled, label }) {
  return (
    <div className="actions">
      <span className="hint">→ contact@saegyeol.ai.kr 로 전송됩니다</span>
      <button type="submit" className="btn btn-accent" disabled={disabled || sending}>
        {sending ? "전송 중…" : <>{label} <span className="arrow">→</span></>}
      </button>
    </div>
  );
}

// 파일 선택 공통 처리. 두 폼 모두 같은 한도(백엔드 FILE_LIMIT과 동일)를 쓴다.
function useFileSelect() {
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    if (nextFile.size > MAX_UPLOAD_BYTES) {
      alert(`파일 크기는 ${MAX_UPLOAD_LABEL}를 초과할 수 없습니다.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFile(nextFile);
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return { file, fileRef, selectFile, clearFile };
}

/* ---------------- Inline contact form ---------------- */
const SUBMIT_COOLDOWN_MS = 60_000;
const lastSubmitKey = "saegyeol-last-submit";

function ContactForm() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const { file, fileRef, selectFile, clearFile } = useFileSelect();

  // 다른 페이지의 문의 버튼이 넘긴 문구를 받아 채운다.
  // 사용자가 이미 입력한 내용이 있으면 덮어쓰지 않는다.
  useEffect(() => {
    const apply = () => {
      const message = takeContactPrefill();
      if (!message) return;
      setData((prev) => (prev.message.trim() ? prev : { ...prev, message }));
    };
    apply();
    window.addEventListener(CONTACT_PREFILL_EVENT, apply);
    return () => window.removeEventListener(CONTACT_PREFILL_EVENT, apply);
  }, []);

  const valid = data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.message.trim().length > 3;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;

    const lastSubmit = parseInt(localStorage.getItem(lastSubmitKey) || "0", 10);
    if (Date.now() - lastSubmit < SUBMIT_COOLDOWN_MS) {
      setError("잠시 후 다시 시도해 주세요. (1분 쿨다운)");
      return;
    }

    setSending(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("message", data.message);
      if (file) formData.append("file", file);

      const res = await fetch("/api/contact", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "전송 실패");
      localStorage.setItem(lastSubmitKey, String(Date.now()));
      setSent(true);
      setTimeout(() => { setSent(false); setData({ name: "", email: "", message: "" }); clearFile(); setTouched(false); }, 5000);
    } catch (err) {
      setError(err.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <FormStatus sent={sent} error={error}
        successText="문의가 전송되었습니다. 영업일 기준 1일 내 회신드립니다." />
      <TextField id="cfv2-name" label="이름 / NAME" placeholder="홍길동" autoComplete="name"
        value={data.name} onChange={(v) => setData({ ...data, name: v })} />
      <TextField id="cfv2-email" label="이메일 / EMAIL" type="email" placeholder="you@company.kr" autoComplete="email"
        value={data.email} onChange={(v) => setData({ ...data, email: v })} />
      <FormField id="cfv2-msg" label="문의 내용 / MESSAGE">
        <textarea id="cfv2-msg" placeholder="자세한 문의 내용을 적어주세요."
          value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} />
      </FormField>
      <FileField id="cfv2-file" label="첨부파일 / ATTACHMENT" optional
        file={file} fileRef={fileRef} onSelect={selectFile}
        note={`${MAX_UPLOAD_LABEL}를 초과하는 파일은 `} />
      <FormActions sending={sending} disabled={touched && !valid} label="문의 보내기" />
    </form>
  );
}

Object.assign(window, {
  useTheme, useFullScroll, useReveal, Nav, Footer, Brand, ContactForm, ClosingCTA, Icon,
  SectionDots, BackButton, ContactButton, createContactNav, SNAP_ROUTES,
  FormStatus, FormField, TextField, FileField, FormActions, useFileSelect,
});
