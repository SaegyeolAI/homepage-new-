const { useState, useEffect, useRef } = React;

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
      {showSub && <span className="brand-sub">새결 · AI AGENT SECURITY</span>}
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
              <div className="row"><span className="k">이메일</span><span>customerservice@saegyeol.ai.kr</span></div>
            </div>
          </div>
          <div className="footer-right">
            <div>
              <h5>PRODUCT</h5>
              <ul>
                <li onClick={() => go("product")}>K-AgentSec</li>
                <li onClick={() => go("product", "features")}>Shadow Agent 탐지</li>
                <li onClick={() => go("product", "features")}>K-PII 차단</li>
                <li onClick={() => go("product", "features")}>컴플라이언스 리포트</li>
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
            <a href="#">이용약관</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Inline contact form ---------------- */
function ContactForm() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.message.trim().length > 3;

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const subject = encodeURIComponent(`[Saegyeol 문의] ${data.name}`);
    const body = encodeURIComponent(`이름: ${data.name}\n이메일: ${data.email}\n\n문의 내용:\n${data.message}`);
    window.location.href = `mailto:customerservice@saegyeol.ai.kr?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => { setSent(false); setData({ name: "", email: "", message: "" }); setTouched(false); }, 4000);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {sent && <div className="form-success">문의가 전송되었습니다. 메일 클라이언트를 확인해 주세요.</div>}
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
      <div className="actions">
        <span className="hint">→ customerservice@saegyeol.ai.kr 로 전송됩니다</span>
        <button type="submit" className="btn btn-accent" disabled={touched && !valid}>
          문의 보내기 <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}

Object.assign(window, { useTheme, Nav, Footer, Brand, ContactForm, ClosingCTA, Icon });
