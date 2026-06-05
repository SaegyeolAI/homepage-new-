const { useState, useEffect, useRef } = React;

/* ---------------- Fullpage Scroll ---------------- */
function useFullScroll(route) {
  useEffect(() => {
    if (route === "privacy" || route === "terms") return;
    const QUERY = '.hero, .page-hero, section.block, .closing-cta';
    const getSections = () => [...document.querySelectorAll(QUERY)];

    const easeInOutCubic = t =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let busy = false;
    let accumulated = 0;
    let resetTimer = null;

    const animateTo = (targetY) => {
      const startY = window.scrollY;
      const dist = targetY - startY;
      if (Math.abs(dist) < 2) { busy = false; return; }
      const duration = 900;
      let startTime = null;
      busy = true;

      const step = (ts) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        window.scrollTo(0, startY + dist * easeInOutCubic(p));
        if (p < 1) requestAnimationFrame(step);
        else busy = false;
      };
      requestAnimationFrame(step);
    };

    const getNearestIdx = (sections) => {
      let idx = 0, minDist = Infinity;
      sections.forEach((s, i) => {
        const d = Math.abs(s.getBoundingClientRect().top);
        if (d < minDist) { minDist = d; idx = i; }
      });
      return idx;
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (busy) return;

      accumulated += e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulated = 0; }, 200);
      if (Math.abs(accumulated) < 60) return;

      const dir = accumulated > 0 ? 1 : -1;
      accumulated = 0;

      const sections = getSections();
      const idx = getNearestIdx(sections);
      const next = idx + dir;

      if (next < 0) return;
      if (next >= sections.length) {
        animateTo(document.body.scrollHeight - window.innerHeight);
        return;
      }
      animateTo(sections[next].offsetTop);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => { window.removeEventListener('wheel', onWheel); busy = false; };
  }, [route]);
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
  const [theme, setTheme] = useState(() => localStorage.getItem("saegyeol-theme-v2") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("saegyeol-theme-v2", theme);
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
  const [open, setOpen] = useState(null); // 'services' | null
  const closeTimer = useRef(null);

  const enter = (id) => {
    clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const go = (id, hash) => {
    setOpen(null);
    if (id === "contact") {
      setRoute("home");
      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      setRoute(id);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  };

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Brand onClick={() => go("home")} showSub />

        <div className="nav-links">
          <div className={"nav-item" + (open === "services" ? " open" : "")}
            onMouseEnter={() => enter("services")} onMouseLeave={leave}>
            <button className={"nav-link" + (route === "product" ? " active" : "")} onClick={() => go("product")}>
              서비스 소개 <span className="chev">▾</span>
            </button>
            <div className="mega" role="menu">
              <div className="mega-col">
                <h5>PRODUCT</h5>
                <a className="mega-item" onClick={() => go("product")}>
                  <div className="t">K-AgentSec</div>
                  <div className="d">한국어 AI 에이전트 자동 침투 테스트 서비스</div>
                </a>
                <a className="mega-item" onClick={() => go("product", "how-it-works")}>
                  <div className="t">How It Works</div>
                  <div className="d">3단계 자동 분석 흐름</div>
                </a>
              </div>
              <div className="mega-col">
                <h5>CAPABILITIES</h5>
                <a className="mega-item" onClick={() => go("product", "features")}>
                  <div className="t">Shadow Agent 탐지</div>
                  <div className="d">사각지대의 개인 AI 에이전트 발견</div>
                </a>
                <a className="mega-item" onClick={() => go("product", "features")}>
                  <div className="t">K-PII 차단</div>
                  <div className="d">한국식 개인정보 14종 전용 탐지</div>
                </a>
                <a className="mega-item" onClick={() => go("product", "features")}>
                  <div className="t">컴플라이언스 리포트</div>
                  <div className="d">ISMS-P · 개인정보보호법 자동 매핑</div>
                </a>
              </div>
              <div className="mega-col">
                <h5>RESOURCES</h5>
                <a className="mega-item" onClick={() => go("contact")}>
                  <div className="t">PoC 요청</div>
                  <div className="d">이번 분기 PoC 슬롯 확인하기</div>
                </a>
                <a className="mega-item" onClick={() => go("team")}>
                  <div className="t">팀 만나기</div>
                  <div className="d">새결을 만드는 사람들</div>
                </a>
              </div>
            </div>
          </div>

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

/* ---------------- Closing CTA (full-bleed) ---------------- */
function ClosingCTA({ onContact }) {
  return (
    <section className="closing-cta">
      <div className="closing-cta-inner">
        <span className="label">JOIN US</span>
        <h2>지금 새결과<br />함께하세요.</h2>
        <p>AI 에이전트 도입은 더 이상 미래의 이야기가 아닙니다. 새결과 함께 한국어 위협 관점에서 점검하고, 안전하게 출시하세요.</p>
        <div className="hero-cta">
          <button className="btn btn-accent" onClick={onContact}>문의하기 <span className="arrow">→</span></button>
          <button className="btn btn-ghost on-dark" onClick={onContact}>PoC 슬롯 확인 <span className="arrow">→</span></button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ setRoute }) {
  const go = (id, hash) => {
    if (id === "contact") {
      setRoute("home");
      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      setRoute(id);
      window.scrollTo({ top: 0 });
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 60);
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
                <li onClick={() => go("product")}>K-AgentSec</li>
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
                <li>Blog</li>
                <li>GitHub</li>
                <li>LinkedIn</li>
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

/* ---------------- Inline contact form ---------------- */
const SUBMIT_COOLDOWN_MS = 60_000;
const lastSubmitKey = "saegyeol-last-submit";

function ContactForm() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [file, setFile] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const fileRef = useRef(null);

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
      setTimeout(() => { setSent(false); setData({ name: "", email: "", message: "" }); setFile(null); setTouched(false); }, 5000);
    } catch (err) {
      setError(err.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {sent && <div className="form-success">문의가 전송되었습니다. 영업일 기준 1일 내 회신드립니다.</div>}
      {error && <div className="form-error">{error}</div>}
      <div className="row">
        <label htmlFor="cfv2-name">이름 / NAME</label>
        <input id="cfv2-name" type="text" placeholder="홍길동" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
      </div>
      <div className="row">
        <label htmlFor="cfv2-email">이메일 / EMAIL</label>
        <input id="cfv2-email" type="email" placeholder="you@company.kr" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
      </div>
      <div className="row">
        <label htmlFor="cfv2-msg">문의 내용 / MESSAGE</label>
        <textarea id="cfv2-msg" placeholder="자세한 문의 내용을 적어주세요." value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} />
      </div>
      <div className="row">
        <label>첨부파일 / ATTACHMENT <span style={{ fontWeight: 400, opacity: 0.5 }}>(선택)</span></label>
        <input ref={fileRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={(e) => {
          const f = e.target.files?.[0] || null;
          if (f && f.size > 50 * 1024 * 1024) {
            alert("파일 크기는 50MB 이하로 첨부해 주세요.");
            e.target.value = "";
            return;
          }
          setFile(f);
        }} />
        <div className="file-drop" onClick={() => fileRef.current?.click()}>
          <div className="icon">{file ? "✓" : "↑"}</div>
          <div className="meta">
            <div className="name">{file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"}</div>
            <div className="sub">{file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF · PPT · DOC · ZIP · 이미지 등 (최대 50MB)"}</div>
          </div>
        </div>
      </div>
      <div className="actions">
        <span className="hint">→ contact@saegyeol.ai.kr 로 전송됩니다</span>
        <button type="submit" className="btn btn-accent" disabled={(touched && !valid) || sending}>
          {sending ? "전송 중…" : <>문의 보내기 <span className="arrow">→</span></>}
        </button>
      </div>
    </form>
  );
}

Object.assign(window, { useTheme, useFullScroll, useReveal, Nav, Footer, Brand, ContactForm, ClosingCTA, Icon });
