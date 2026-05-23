const TEAM_MEMBERS = [
  { initials: "JM", name: "정민호", role: "CEO / Founder",   bio: "전 카카오엔터프라이즈 보안팀 리드. AI 에이전트 위협 모델링 전문.", link: "#" },
  { initials: "HS", name: "한승우", role: "CTO",            bio: "LLM 레드팀 도구 K-RedKit 메인 컨트리뷰터. 10년차 시큐리티 엔지니어.", link: "#" },
  { initials: "YK", name: "유경아", role: "Head of Research", bio: "KAIST 정보보호 박사. 한국어 프롬프트 인젝션 벤치마크 KoPI 저자.", link: "#" },
  { initials: "DJ", name: "도지원", role: "Compliance Lead",  bio: "ISMS-P 심사원. 금융권 AI 가이드라인 자문 다수.", link: "#" },
  { initials: "SC", name: "서채연", role: "Offensive Eng.",   bio: "DEF CON CTF 본선 입상. MCP 서버 익스플로잇 PoC 다수 공개.", link: "#" },
  { initials: "BK", name: "배기훈", role: "Product Design",   bio: "토스 · 라인 출신. 보안 리포트를 읽히는 형태로 설계.", link: "#" },
];

function TeamPage({ setRoute }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const fileRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !file) return;
    const subject = encodeURIComponent(`[Saegyeol 지원] ${name}`);
    const body = encodeURIComponent(
      `지원자: ${name}\n이메일: ${email}\n첨부파일: ${file.name} (${(file.size/1024).toFixed(1)} KB)\n\n* 메일 작성 후 첨부파일을 직접 추가해 주세요.`
    );
    window.location.href = `mailto:careers@saegyeol.kr?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => { setSent(false); setFile(null); setName(""); setEmail(""); }, 4000);
  };

  return (
    <div data-screen-label="02 Team">
      <section className="team-hero">
        <div className="container">
          <span className="eyebrow">TEAM · 새결을 만드는 사람들</span>
          <h1>오펜시브 시큐리티,<br/>한국형 AI 위협을 가장 잘 아는 팀.</h1>
          <p>새결의 팀은 한국 LLM·MCP 생태계를 실전에서 다뤄온 시큐리티 엔지니어,
            연구자, 컴플라이언스 전문가로 구성됩니다.</p>
        </div>
      </section>

      <section className="block" style={{paddingTop:48}}>
        <div className="container">
          <div className="team-grid">
            {TEAM_MEMBERS.map(m => (
              <a key={m.initials} className="member" href={m.link} target="_blank" rel="noreferrer">
                <div className="avatar">{m.initials}</div>
                <div className="role">{m.role}</div>
                <h3>{m.name}</h3>
                <p className="bio">{m.bio}</p>
                <div className="ext">VIEW PORTFOLIO <span>↗</span></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="recruit">
            <div>
              <span className="eyebrow">JOIN US · 채용</span>
              <h2>함께할 사람을 찾습니다.</h2>
              <p>이력서, 프로젝트, 글, 발표 영상 — 형식은 자유입니다.
                새결이 풀고 있는 문제에 흥미가 있다면 가볍게라도 보내주세요.
                자유 형식의 포트폴리오를 careers@saegyeol.kr 로 전달합니다.</p>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
                {["Offensive Eng.", "LLM Researcher", "Compliance", "Product Design", "Open application"].map(t => (
                  <span key={t} style={{
                    fontFamily:'"JetBrains Mono", monospace', fontSize:11, letterSpacing:"0.05em",
                    textTransform:"uppercase", padding:"5px 10px", border:"1px solid var(--border)",
                    borderRadius:999, color:"var(--text-2)"
                  }}>{t}</span>
                ))}
              </div>
            </div>

            <form className="form" onSubmit={submit} style={{position:"relative", zIndex:1}}>
              {sent && <div className="form-success">지원서가 전송되었습니다.</div>}
              <div className="row">
                <label>이름 / NAME</label>
                <input type="text" placeholder="홍길동" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div className="row">
                <label>이메일 / EMAIL</label>
                <input type="email" placeholder="you@mail.kr" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div className="row">
                <label>포트폴리오 / FREE FORMAT (any file)</label>
                <input ref={fileRef} type="file" style={{display:"none"}} onChange={(e)=>setFile(e.target.files?.[0]||null)} />
                <div className="file-drop" onClick={()=>fileRef.current?.click()}>
                  <div className="icon">{file ? "✓" : "↑"}</div>
                  <div className="meta">
                    <div className="name">{file ? file.name : "파일을 선택하거나 여기로 끌어다 놓으세요"}</div>
                    <div className="sub">{file ? `${(file.size/1024).toFixed(1)} KB · 모든 형식 허용` : "PDF · PPT · LINK · ZIP · 영상 등 자유 형식"}</div>
                  </div>
                </div>
              </div>
              <div className="actions">
                <span className="hint">→ careers@saegyeol.kr 로 전송됩니다</span>
                <button type="submit" className="btn btn-accent">
                  지원하기 <span className="arrow">→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

window.TeamPage = TeamPage;
