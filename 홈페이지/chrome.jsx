const { useState, useEffect, useRef } = React;

/* ---------------- Theme hook ---------------- */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("saegyeol-theme");
    if (saved) return saved;
    return "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("saegyeol-theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

/* ---------------- Logo ---------------- */
function Brand({ onClick }) {
  return (
    <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }}>
      <span className="brand-mark" aria-hidden="true"></span>
      <span>Saegyeol</span>
    </a>
  );
}

/* ---------------- Nav ---------------- */
function Nav({ route, setRoute, theme, setTheme }) {
  const NAV = [
    { id: "product", label: "서비스 소개" },
    { id: "team", label: "팀 소개" },
    { id: "contact", label: "문의" },
  ];

  const go = (id) => {
    if (id === "contact") {
      setRoute("home");
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } else {
      setRoute(id);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Brand onClick={() => go("home")} />
        <div className="nav-links">
          {NAV.map(n => (
            <a
              key={n.id}
              href="#"
              className={"nav-link" + (route === n.id ? " active" : "")}
              onClick={(e) => { e.preventDefault(); go(n.id); }}
            >{n.label}</a>
          ))}
          <button
            className="theme-toggle"
            aria-label="모드 변경"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
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

/* ---------------- Footer ---------------- */
function Footer({ setRoute }) {
  const go = (id) => {
    setRoute(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-block">
            <Brand onClick={() => go("home")} />
            <p>한국어 AI 에이전트를 위한 자동 침투 테스트 및 컴플라이언스 매핑 서비스를 제공하는 보안 스타트업입니다.</p>
          </div>
          <div>
            <h4>SITEMAP</h4>
            <ul>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go("home");}}>홈</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go("product");}}>K-AgentSec</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go("team");}}>팀 소개</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); go("home"); setTimeout(()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"}),60);}}>문의</a></li>
            </ul>
          </div>
          <div>
            <h4>COMPANY</h4>
            <ul className="mono">
              <li>회사명 &nbsp;새결 (Saegyeol)</li>
              <li>대표자 &nbsp;[대표자명]</li>
              <li>사업자번호 &nbsp;000-00-00000</li>
              <li>주소 &nbsp;[서울시 ··· ]</li>
            </ul>
          </div>
          <div>
            <h4>LEGAL</h4>
            <ul>
              <li><a href="#">개인정보처리방침</a></li>
              <li><a href="#">이용약관</a></li>
              <li><a href="mailto:contact@saegyeol.kr">contact@saegyeol.kr</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Saegyeol. All rights reserved.</span>
          <span>새결 · MADE IN SEOUL</span>
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
    // Mailto fallback: prepares an email to contact@saegyeol.kr
    const subject = encodeURIComponent(`[Saegyeol 문의] ${data.name}`);
    const body = encodeURIComponent(`이름: ${data.name}\n이메일: ${data.email}\n\n문의 내용:\n${data.message}`);
    window.location.href = `mailto:contact@saegyeol.kr?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => { setSent(false); setData({ name: "", email: "", message: "" }); setTouched(false); }, 4000);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {sent && <div className="form-success">문의가 전송되었습니다. 메일 클라이언트를 확인해 주세요.</div>}
      <div className="row">
        <label htmlFor="cf-name">이름 / NAME</label>
        <input id="cf-name" type="text" placeholder="홍길동"
          value={data.name}
          onChange={(e)=>setData({...data, name: e.target.value})} />
      </div>
      <div className="row">
        <label htmlFor="cf-email">이메일 / EMAIL</label>
        <input id="cf-email" type="email" placeholder="you@company.kr"
          value={data.email}
          onChange={(e)=>setData({...data, email: e.target.value})} />
      </div>
      <div className="row">
        <label htmlFor="cf-msg">문의 내용 / MESSAGE</label>
        <textarea id="cf-msg" placeholder="도입 검토 중인 AI 에이전트 시스템 정보와 함께 자세한 문의 사항을 적어주세요."
          value={data.message}
          onChange={(e)=>setData({...data, message: e.target.value})} />
      </div>
      <div className="actions">
        <span className="hint">→ contact@saegyeol.kr 로 전송됩니다</span>
        <button type="submit" className="btn btn-accent" disabled={touched && !valid}>
          문의 보내기 <span className="arrow">→</span>
        </button>
      </div>
    </form>
  );
}

Object.assign(window, { useTheme, Nav, Footer, Brand, ContactForm });
