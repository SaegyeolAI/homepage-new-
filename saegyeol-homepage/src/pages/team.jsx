const TEAM_MEMBERS_V2 = [
  { initials: "JH", name: "황지후", role: "CEO / Founder",      bio: "소프트웨어로 세상을 바꾸는, 더 나은 세상을 꿈꾸다.", link: "https://www.notion.so/saegyeol/Hwang-Jihoo-31cb75833d178043a85ec6c11a1b2af8?source=copy_link" },
  { initials: "YS", name: "신유승", role: "Full-Stack Engineer", bio: "세상의 문제를 코드로 풀고, 소프트웨어로 답을 찾다.", link: "https://app.notion.com/p/PoRTfoLio-9831ecbe58c883fca2aa81f08c64f30a?source=copy_link" },
];

function TeamPage({ setRoute }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [blocked, setBlocked] = useState(null);
  const startedAt = useRef(Date.now()).current;
  const { file, fileRef, fileError, setFileError, selectFile, clearFile } = useFileSelect();

  // 문의 폼과 같은 방식으로 필드별로 검사한다.
  // 예전에는 버튼이 페이지에 들어온 순간부터 회색이었고, 왜인지는 어디에도 없었다.
  const validate = () => {
    const found = {};
    if (!name.trim()) found["rcv2-name"] = "이름을 적어주세요.";
    if (!email.trim()) found["rcv2-email"] = "이메일 주소를 적어주세요.";
    else if (email.trim().length > MAX_EMAIL_LEN) found["rcv2-email"] = `이메일 주소는 ${MAX_EMAIL_LEN}자 이내로 적어주세요.`;
    else if (!/\S+@\S+\.\S+/.test(email)) found["rcv2-email"] = "이메일 주소를 다시 확인해 주세요. (예: you@mail.kr)";
    return found;
  };

  const submit = async (e) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (!file) setFileError("포트폴리오 파일을 첨부해 주세요.");
    if (Object.keys(found).length > 0 || !file) {
      setBlocked(null);
      if (Object.keys(found).length > 0) focusFirstError(found, ["rcv2-name", "rcv2-email"]);
      else document.getElementById("rcv2-file")?.parentElement?.querySelector(".file-drop")?.focus();
      return;
    }

    setSending(true);
    setBlocked(null);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("file", file);
      formData.append("company_site", document.getElementById("company_site")?.value || "");
      formData.append("form_ts", String(startedAt));
      const res = await fetch("/api/recruit", { method: "POST", body: formData });
      const payload = await readJson(res);
      if (!res.ok) {
        setBlocked(describeFailure(res.status, payload));
        return;
      }
      setSent(true);
      setTimeout(() => { setSent(false); clearFile(); setName(""); setEmail(""); setErrors({}); }, 4000);
    } catch {
      setBlocked(describeFailure(0, null));
    } finally {
      setSending(false);
    }
  };

  const goContact = createContactNav(setRoute);

  return (
    <div data-screen-label="02 Team">
      <section className="page-hero" data-section-label="팀 소개">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <span className="section-label">새결을 만드는 사람들</span>
          <h1>AI 보안을<br className="wide-only" />{" "}믿고 맡길 수 있는 팀</h1>
          <p>정보보안, LLM 연구, 한국 AI 에이전트 환경을 연구하는 사람들이 모였어요.</p>
        </div>
      </section>

      <section className="block" data-section-label="회사">
        <div className="container">
          <div className="section-head">
            <span className="section-label">회사</span>
            <h2>보안을 더 쉽게,<br className="wide-only" />{" "}안전한 디지털 세상을 위하여.</h2>
          </div>
          <div className="about-grid">
            <div className="about-item">
              <span className="k">모토</span>
              <strong>Think Better Act Smarter</strong>
              <p>더 좋은 생각으로, 똑똑하게 행동하는 것.</p>
            </div>
            <div className="about-item">
              <span className="k">비전</span>
              <strong>정보보안의 단순화·간편화·보편화</strong>
              <p>보안은 원래 어려운 분야예요. 이것을 쉽게 풀거에요.</p>
            </div>
            <div className="about-item">
              <span className="k">하는 일</span>
              <strong>레드티밍 및 모의해킹</strong>
              <p>지금은 AI 에이전트 점검부터 해 드려요. 나머지는 준비하고 있어요.</p>
            </div>
            <div className="about-item">
              <span className="k">목표</span>
              <strong>안전하고 편리한 정보사회</strong>
              <p>안전한 정보사회를 만드는 데 기여하고 앞장서는 것.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" data-section-label="구성원">
        <div className="container">
          <div className="team-grid">
            {TEAM_MEMBERS_V2.map((m) => {
              const content = (
                <>
                  <div className="photo">{m.initials}</div>
                  <div className="role">{m.role}</div>
                  <h3>{m.name}</h3>
                  <p className="bio">{m.bio}</p>
                  {m.link && <div className="visit">포트폴리오 보기</div>}
                </>
              );
              return m.link ? (
                <a key={m.initials} className="member" href={m.link} target="_blank" rel="noreferrer">{content}</a>
              ) : (
                <article key={m.initials} className="member">{content}</article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="block" id="recruit" data-section-label="채용">
        <div className="container">
          <div className="recruit">
            <div style={{position:"relative", zIndex:1}}>
              <span className="section-label">채용</span>
              <h2>함께할 사람을<br/>찾아요.</h2>
              <p>이력서든 프로젝트든, 써둔 글이나 발표 영상이든 형식은 자유예요. 새결이 푸는 문제에 흥미가 있다면 가볍게라도 보내주세요. contact@saegyeol.ai.kr 로 전달돼요.</p>
              <div className="tags">
                <span className="tag">Offensive Eng.</span>
                <span className="tag">LLM Researcher</span>
                <span className="tag">Compliance</span>
                <span className="tag">Product Design</span>
                <span className="tag">Open Application</span>
              </div>
            </div>

            {/* 문의 폼(ContactForm)과 같은 조각들로 구성한다. 전송 경로는 /api/recruit 그대로. */}
            <form className="form" onSubmit={submit} noValidate style={{position:"relative", zIndex:1}}>
              <FormStatus sent={sent} successText="지원서가 전송됐어요." />
              {blocked && <FormBlocked {...blocked}
                mailSubject={`[Saegyeol 지원] ${name || ""}`.trim()}
                mailBody={`지원자: ${name}\n이메일: ${email}\n\n포트폴리오 파일을 첨부해 주세요.`} />}
              <Honeypot startedAt={startedAt} />
              <TextField id="rcv2-name" label="이름 / NAME" placeholder="홍길동" autoComplete="name"
                value={name} error={errors["rcv2-name"]}
                onChange={(v) => { setName(v); setErrors((p) => (p["rcv2-name"] ? { ...p, "rcv2-name": "" } : p)); }} />
              <TextField id="rcv2-email" label="이메일 / EMAIL" type="email" placeholder="you@mail.kr" autoComplete="email" maxLength={MAX_EMAIL_LEN}
                value={email} error={errors["rcv2-email"]}
                onChange={(v) => { setEmail(v); setErrors((p) => (p["rcv2-email"] ? { ...p, "rcv2-email": "" } : p)); }} />
              <FileField id="rcv2-file" label="포트폴리오 / FREE FORMAT"
                file={file} fileRef={fileRef} onSelect={selectFile} error={fileError}
                note={`한 개만 첨부할 수 있어요. 영상이거나 ${MAX_UPLOAD_LABEL}를 넘으면 드라이브 등에 올린 링크를 ${CONTACT_MAIL}로 보내주세요.`} />
              <FormActions sending={sending} label="지원하기" hint={`→ ${CONTACT_MAIL} 로 전송돼요`} />
            </form>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

window.TeamPage = TeamPage;
