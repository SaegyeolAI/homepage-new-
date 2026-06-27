const TEAM_MEMBERS_V2 = [
  { initials: "JH", name: "황지후", role: "CEO / Founder",      bio: "소프트웨어로 세상을 바꾸는, 더 나은 세상을 꿈꾸다.", link: "https://www.notion.so/saegyeol/Hwang-Jihoo-31cb75833d178043a85ec6c11a1b2af8?source=copy_link" },
  { initials: "YJ", name: "김윤지", role: "CISO",               bio: " 그 누구보다 반짝일 미래를 믿습니다. 더 나은 세상을 위하여.", link: "https://www.notion.so/YUNJI-S-PORTFOLIO-369bed12f7ec804385c6c6e4608ea371?source=copy_link" },
  { initials: "YS", name: "신유승", role: "Full-Stack Engineer", bio: "세상의 문제를 코드로 풀고, 소프트웨어로 답을 찾다.", link: "#", pending: true },
];

function TeamPage({ setRoute }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [pendingToast, setPendingToast] = useState(false);
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
          <h1>AI 보안을<br/>믿고 맡길 수 있는 팀</h1>
          <p>오펜시브 시큐리티 · LLM 연구 · 한국형 컴플라이언스 — 새결의 팀은 한국 AI 에이전트 환경을 실전에서 다뤄온 사람들로 구성됩니다.</p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          {pendingToast && (
            <div style={{
              position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
              background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "14px 24px", fontSize: 14,
              color: "var(--text-2)", zIndex: 9999, whiteSpace: "nowrap",
              boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
            }}>
              포트폴리오 준비중입니다.
            </div>
          )}
          <div className="team-grid">
            {TEAM_MEMBERS_V2.map(m => (
              <a key={m.initials} className="member" href={m.pending ? undefined : m.link}
                target={m.pending ? undefined : "_blank"} rel="noreferrer"
                style={m.pending ? { cursor: "pointer" } : undefined}
                onClick={m.pending ? (e) => {
                  e.preventDefault();
                  setPendingToast(true);
                  setTimeout(() => setPendingToast(false), 2500);
                } : undefined}>
                <div className="photo">{m.initials}</div>
                <div className="role">{m.role}</div>
                <h3>{m.name}</h3>
                <p className="bio">{m.bio}</p>
                <div className="visit">{m.pending ? "COMING SOON" : "VIEW PORTFOLIO"}</div>
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
                  if (f && f.size > MAX_UPLOAD_BYTES) {
                    alert(`파일 크기는 ${MAX_UPLOAD_LABEL}를 초과할 수 없습니다.`);
                    e.target.value = "";
                    return;
                  }
                  setFile(f);
                }} />
                <div className="file-drop" onClick={()=>fileRef.current?.click()}>
                  <div className="icon">{file ? "✓" : "↑"}</div>
                  <div className="meta">
                    <div className="name">{file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"}</div>
                    <div className="sub">{file ? `${(file.size/1024).toFixed(1)} KB` : `PDF · PPT · DOC · ZIP · 이미지 등 (최대 ${MAX_UPLOAD_LABEL})`}</div>
                  </div>
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                  {MAX_UPLOAD_LABEL}를 초과하는 파일은 <span className="mono" style={{ fontSize: 12 }}>contact@saegyeol.ai.kr</span>로 직접 보내주세요.
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
