function HomePage({ setRoute }) {
  const goContact = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div data-screen-label="01 Home">
      {/* HERO — full viewport */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <span className="hero-tag"><span className="blink" />KOREAN AI AGENT SECURITY · SINCE 2026</span>
          <h1>
            Securing the Future<br />
            of <span className="accent-w">Korean AI Agents.</span>
          </h1>
          <p className="hero-sub">
            한국어 AI 에이전트, 한국형 위협 관점으로 먼저 점검합니다.<br />
            새결은 LLM·MCP·사용자 플로우 전체를 자동으로 공격해 익스플로잇 PoC와 컴플라이언스 리포트를 산출합니다.
          </p>
          <div className="hero-cta">
            <button className="btn btn-accent" onClick={() => { setRoute("product"); window.scrollTo({ top: 0 }); }}>
              서비스 알아보기 <span className="arrow">→</span>
            </button>
            <button className="btn btn-ghost" onClick={() => { setRoute("team"); window.scrollTo({ top: 0 }); }}>
              팀 소개 보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
        <div className="hero-scrollhint">
          <span>SCROLL</span>
          <span className="bar" />
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="block" id="what-we-do">
        <div className="container">
          <div className="section-head">
            <span className="section-label">WHAT WE DO</span>
            <h2>한국 환경에서만 보이는<br />위협을 정면으로 다룹니다.</h2>
            <p>국제 LLM 보안 도구는 한국어 인젝션, 한국식 PII, 국내 컴플라이언스를 다루지 못합니다.
              K-AgentSec은 한국어 위협 모델에 특화된 자동 침투 테스트와 리포트를 제공합니다.</p>
          </div>

          <div className="cards">
            <article className="card">
              <span className="num">01</span>
              <div className="ico"><Icon.shadow /></div>
              <h3>Shadow Agent 탐지</h3>
              <p>임직원이 사내 데이터로 만든 개인 AI 에이전트가 만드는 보안 사각지대를 자동으로 발견하고 위험도를 평가합니다.</p>
              <a className="more" href="#" onClick={(e) => { e.preventDefault(); setRoute("feature-shadow"); window.scrollTo({ top: 0 }); }}>자세히 보기</a>
            </article>
            <article className="card">
              <span className="num">02</span>
              <div className="ico"><Icon.pii /></div>
              <h3>K-PII 차단</h3>
              <p>주민번호·사업자번호·한국식 주소·계좌·운전면허 등 한국식 PII 14종을 전용 탐지기로 식별하고 차단합니다.</p>
              <a className="more" href="#" onClick={(e) => { e.preventDefault(); setRoute("feature-pii"); window.scrollTo({ top: 0 }); }}>자세히 보기</a>
            </article>
            <article className="card">
              <span className="num">03</span>
              <div className="ico"><Icon.report /></div>
              <h3>컴플라이언스 리포트</h3>
              <p>ISMS-P · 개인정보보호법 · 금융 AI 가이드라인 등 한국형 기준에 자동 매핑된 리포트를 PDF·웹으로 생성합니다.</p>
              <a className="more" href="#" onClick={(e) => { e.preventDefault(); setRoute("feature-report"); window.scrollTo({ top: 0 }); }}>자세히 보기</a>
            </article>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="block" style={{ paddingTop: 0, paddingBottom: 120, borderTop: "none" }}>
        <div className="container">
          <div className="stats">
            <div className="item">
              <div className="v">2,400<span className="unit">+</span></div>
              <div className="k">한국어 공격 페이로드</div>
            </div>
            <div className="item">
              <div className="v">36<span className="unit">분</span></div>
              <div className="k">평균 점검 시간</div>
            </div>
            <div className="item">
              <div className="v">14<span className="unit">종</span></div>
              <div className="k">한국식 PII 카테고리</div>
            </div>
            <div className="item">
              <div className="v">8<span className="unit">개</span></div>
              <div className="k">컴플라이언스 매핑 기준</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SHORTCUT BANNER */}
      <section className="block" style={{ paddingTop: 0, borderTop: "none" }}>
        <div className="container">
          <div className="banner" role="button" tabIndex={0}
            onClick={() => { setRoute("team"); window.scrollTo({ top: 0 }); }}
            onKeyDown={(e) => { if (e.key === "Enter") { setRoute("team"); window.scrollTo({ top: 0 }); } }}>
            <div>
              <span className="section-label">TEAM · 새결을 만드는 사람들</span>
              <h3>한국 AI 보안을 가장 가까이서<br />다뤄온 사람들.</h3>
              <p>오펜시브 시큐리티, LLM 평가, 한국형 컴플라이언스 — 세 영역에서 실전 경험을 쌓은 팀이 새결의 기술을 만들고 있습니다.</p>
              <div className="av-stack">
                <span className="av">JM</span>
                <span className="av">HS</span>
                <span className="av">YK</span>
                <span className="av">DJ</span>
                <span className="av">SC</span>
                <span className="av" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>+3</span>
              </div>
            </div>
            <span className="banner-arrow">↗</span>
          </div>
        </div>
      </section>

      {/* INLINE CONTACT FORM */}
      <section className="block" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div>
              <span className="section-label">CONTACT · INLINE</span>
              <h2 style={{
                margin: "16px 0 18px",
                fontSize: "clamp(32px, 4vw, 52px)",
                lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700
              }}>새결 팀에<br />직접 문의해 주세요.</h2>
              <p style={{ margin: 0, color: "var(--text-2)", fontSize: 17, lineHeight: 1.7, maxWidth: 480 }}>
                AI 에이전트 보안 도입을 검토 중이시거나, K-AgentSec PoC가 필요하다면 아래 양식으로 직접 문의해 주세요. 영업일 기준 1일 내 회신드립니다.
              </p>
              <div className="contact-meta">
                <div className="row"><span className="k">EMAIL</span><span className="mono">customerservice@saegyeol.ai.kr</span></div>
                <div className="row"><span className="k">RESPONSE</span><span className="mono">24시간 이내 (연중무휴)</span></div>
                <div className="row"><span className="k">FOR</span><span>도입 문의 · PoC 요청 · 보안 자문 · 채용 문의</span></div>
                <div className="row"><span className="k">NDA</span><span>요청 시 체결 가능</span></div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

window.HomePage = HomePage;
