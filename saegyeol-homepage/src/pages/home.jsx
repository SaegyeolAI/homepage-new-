function HomePage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const openRoute = (route) => { setRoute(route); window.scrollTo({ top: 0, behavior: "auto" }); };
  const cardKey = (event, route) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRoute(route);
    }
  };

  return (
    <div data-screen-label="01 Home">
      {/* HERO — full viewport */}
      <section className="hero" data-section-label="인트로">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <span className="hero-tag"><span className="blink" />KOREAN AI AGENT SECURITY · SINCE 2026</span>
          <h1>
            Securing the Future<br />
            of <span className="accent-w">Korean AI Agents.</span>
          </h1>
          <p className="hero-sub">
            AI 에이전트, 내보내도 괜찮은 상태인지 먼저 확인하세요.<br />
            여울은 출시 직전의 한국어 AI 에이전트에 실제 공격을 넣어보고 배포 여부를 판정합니다.<br />
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
      </section>

      {/* WHAT WE DO */}
      <section className="block" id="what-we-do" data-section-label="하는 일">
        <div className="container">
          <div className="section-head">
            <span className="section-label">WHAT WE DO</span>
            <h2>한국어로 공격해야<br />보이는 구멍이 있습니다.</h2>
            <p>한국어는 조사와 어미가 붙어 같은 뜻을 수없이 다르게 쓸 수 있습니다.
              영어를 기준으로 만든 필터는 이 변형을 대부분 놓칩니다.
              여울은 그 형태 변형을 공격 방법으로 삼아 에이전트를 두드려 봅니다.</p>
          </div>

          <div className="cards">
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-shadow")} onKeyDown={(e) => cardKey(e, "feature-shadow")}>
              <span className="num">01</span>
              <div className="ico"><Icon.shadow /></div>
              <h3>Shadow Agent 탐지</h3>
              <p>임직원이 사내 데이터로 만든 개인 AI 에이전트가 만드는 보안 사각지대를 자동으로 발견하고 위험도를 평가합니다.</p>
              <span className="more">자세히 보기</span>
            </article>
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-pii")} onKeyDown={(e) => cardKey(e, "feature-pii")}>
              <span className="num">02</span>
              <div className="ico"><Icon.pii /></div>
              <h3>K-PII 차단</h3>
              <p>주민번호·사업자번호·한국식 주소·계좌·운전면허 등 한국식 PII 14종을 전용 탐지기로 식별하고 차단합니다.</p>
              <span className="more">자세히 보기</span>
            </article>
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-report")} onKeyDown={(e) => cardKey(e, "feature-report")}>
              <span className="num">03</span>
              <div className="ico"><Icon.report /></div>
              <h3>증거 기반 리포트</h3>
              <p>취약점마다 재현할 수 있는 최소한의 증거를 담은 PDF 리포트를 드립니다. 표지에는 이번 검사가 어디까지 다뤘는지 적습니다.</p>
              <span className="more">자세히 보기</span>
            </article>
          </div>

          <div className="stats" style={{ marginTop: 64 }}>
            <div className="item">
              <div className="v">154<span className="unit">종</span></div>
              <div className="k">형태 변형 공격 유형</div>
            </div>
            <div className="item">
              <div className="v">97.4<span className="unit">%</span></div>
              <div className="k">탐지율 (recall)</div>
            </div>
            <div className="item">
              <div className="v">5.3<span className="unit">%</span></div>
              <div className="k">오탐률</div>
            </div>
            <div className="item">
              <div className="v">4<span className="unit">단계</span></div>
              <div className="k">판정 구분 (확정·의심·통과·미검사)</div>
            </div>
          </div>
          <p className="stats-note">내부 회귀 벤치마크 기준입니다.</p>
        </div>
      </section>

      {/* TEAM SHORTCUT BANNER */}
      <section className="block" data-section-label="팀" style={{ paddingTop: 0, borderTop: "none" }}>
        <div className="container">
          <div className="banner" role="button" tabIndex={0}
            onClick={() => { setRoute("team"); window.scrollTo({ top: 0 }); }}
            onKeyDown={(e) => { if (e.key === "Enter") { setRoute("team"); window.scrollTo({ top: 0 }); } }}>
            <div>
              <span className="section-label">TEAM · 새결을 만드는 사람들</span>
              <h3>한국 AI 보안을 가장 가까이서<br />다뤄온 사람들.</h3>
              <p>오펜시브 시큐리티, LLM 평가, 한국형 컴플라이언스 — 세 영역에서 전문성을 쌓은 팀이 새결의 기술을 만들고 있습니다.</p>
              <div className="av-stack">
                <span className="av">JH</span>
                <span className="av">YS</span>
              </div>
            </div>
            <button className="btn btn-accent"
              onClick={(e) => { e.stopPropagation(); setRoute("team"); window.scrollTo({ top: 0 }); }}>
              바로가기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* INLINE CONTACT FORM */}
      <section className="block" id="contact" data-section-label="문의">
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
                출시를 앞둔 에이전트를 점검하고 싶으시거나 여울이 어떤 범위를 검사하는지 궁금하시면 아래 양식으로 보내주세요. 영업일 기준 1일 내 회신드립니다.
              </p>
              <div className="contact-meta">
                <div className="row"><span className="k">EMAIL</span><span className="mono">contact@saegyeol.ai.kr</span></div>
                <div className="row"><span className="k">RESPONSE</span><span className="mono">24시간 이내 (연중무휴)</span></div>
                <div className="row"><span className="k">FOR</span><span>도입 문의 · 보안 검증 · 보안 자문 · 채용 문의</span></div>
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
