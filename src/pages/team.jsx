const TEAM_MEMBERS_V2 = [
  { initials: "JH", name: "황지후", role: "CEO / Founder",      bio: "소프트웨어로 세상을 바꾸는 더 나은 세상을 꿈꾸는 보안 전문가.", link: "https://www.notion.so/saegyeol/Hwang-Jihoo-31cb75833d178043a85ec6c11a1b2af8?source=copy_link" },
  { initials: "SY", name: "김수윤", role: "Technical Advisor",  bio: "LLM 레드팀 도구 K-RedKit 메인 컨트리뷰터. 10년차 시큐리티 엔지니어.", link: "https://devksy.xyz/portfolio" },
  { initials: "YK", name: "김윤지", role: "CISO",               bio: "KAIST 정보보호 박사. 한국어 프롬프트 인젝션 벤치마크 KoPI 저자.", link: "https://www.notion.so/YUNJI-S-PORTFOLIO-369bed12f7ec804385c6c6e4608ea371?source=copy_link" },
  { initials: "YS", name: "신유승", role: "Full-Stack Engineer", bio: "ISMS-P 심사원. 금융권 AI 가이드라인 자문 다수.", link: "#" },
];

function TeamPage({ setRoute }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !file) return;
    setSending(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("file", file);
      const res = await fetch("/api/recruit", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "전송 실패");
      setSent(true);
      setTimeout(() => { setSent(false); setFile(null); setName(""); setEmail(""); }, 4000);
    } catch (err) {
      setError(err.message || "전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSending(false);
    }
  };

  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  return (
    <div data-screen-label="02 Team">
      <section className="page-hero">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <span className="section-label">TEAM · 새결을 만드는 사람들</span>
          <h1>한국 AI 보안을<br/>가장 잘 아는 팀.</h1>
          <p>오펜시브 시큐리티 · LLM 연구 · 한국형 컴플라이언스 — 새결의 팀은 한국 AI 에이전트 환경을 실전에서 다뤄온 사람들로 구성됩니다.</p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="team-grid">
            {TEAM_MEMBERS_V2.map(m => (
              <a key={m.initials} className="member" href={m.link} target="_blank" rel="noreferrer">
                <div className="photo">{m.initials}</div>
                <div className="role">{m.role}</div>
                <h3>{m.name}</h3>
                <p className="bio">{m.bio}</p>
                <div className="visit">VIEW PORTFOLIO</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="recruit">
        <div className="container">
          <div className="recruit">
            <div style={{position:"relative", zIndex:1}}>
              <span className="section-label">JOIN US · 채용</span>
              <h2>함께할 사람을<br/>찾습니다.</h2>
              <p>이력서, 프로젝트, 글, 발표 영상 — 형식은 자유입니다. 새결이 풀고 있는 문제에 흥미가 있다면 가볍게라도 보내주세요. 자유 형식의 포트폴리오를 contact@saegyeol.ai.kr 로 전달합니다.</p>
              <div className="tags">
                <span className="tag">Offensive Eng.</span>
                <span className="tag">LLM Researcher</span>
                <span className="tag">Compliance</span>
                <span className="tag">Product Design</span>
                <span className="tag">Open Application</span>
              </div>
            </div>

            <form className="form" onSubmit={submit} style={{position:"relative", zIndex:1}}>
              {sent && <div className="form-success">지원서가 전송되었습니다.</div>}
              {error && <div className="form-error">{error}</div>}
              <div className="row">
                <label>이름 / NAME</label>
                <input type="text" placeholder="홍길동" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div className="row">
                <label>이메일 / EMAIL</label>
                <input type="email" placeholder="you@mail.kr" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div className="row">
                <label>포트폴리오 / FREE FORMAT</label>
                <input ref={fileRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.mp4,.mov,.avi,.png,.jpg,.jpeg" style={{display:"none"}} onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > 50 * 1024 * 1024) {
                    alert("파일 크기는 50MB 이하로 첨부해 주세요.");
                    e.target.value = "";
                    return;
                  }
                  setFile(f);
                }} />
                <div className="file-drop" onClick={()=>fileRef.current?.click()}>
                  <div className="icon">{file ? "✓" : "↑"}</div>
                  <div className="meta">
                    <div className="name">{file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"}</div>
                    <div className="sub">{file ? `${(file.size/1024).toFixed(1)} KB` : "PDF · PPT · DOC · ZIP · 영상 등 (최대 50MB)"}</div>
                  </div>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                  50MB를 초과하는 파일은 <span className="mono" style={{ fontSize: 12 }}>contact@saegyeol.ai.kr</span>로 직접 보내주세요.
                </p>
              </div>
              <div className="actions">
                <span className="hint">→ contact@saegyeol.ai.kr 로 전송됩니다</span>
                <button type="submit" className="btn btn-accent" disabled={sending || !name || !email || !file}>
                  {sending ? "전송 중…" : <>지원하기 <span className="arrow">→</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

window.TeamPage = TeamPage;
