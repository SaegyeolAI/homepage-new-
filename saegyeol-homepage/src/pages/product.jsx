function ProductPage({ setRoute }) {
  const goContact = createContactNav(setRoute);

  const openRoute = (route) => {
    setRoute(route);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const cardKey = (event, route) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRoute(route);
    }
  };

  return (
    <div data-screen-label="03 Product · 여울">
      <section className="page-hero" data-section-label="여울 소개">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <span className="section-label">PRODUCT · 여울</span>
          <h1>내보내도 되는지,<br/>내보내기 전에<br/>확인합니다.</h1>
          <p>여울은 한국어 AI 에이전트 침투 테스트 서비스입니다. 출시를 앞둔 에이전트에 한국어 공격을 넣어보고 배포해도 되는지 판정합니다. 지금은 출시를 준비하고 있습니다.</p>
          <div className="hero-cta" style={{marginTop:36}}>
            <ContactButton onContact={goContact} prefill="여울 도입을 문의합니다." />
            <button className="btn btn-ghost" onClick={() => openRoute("pricing")}>
              요금제 보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* One-liner block / stats */}
      <section className="block" data-section-label="WHY 여울" style={{paddingBottom:0}}>
        <div className="container">
          <div className="section-head">
            <span className="section-label">WHY 여울</span>
            <h2>조사 하나만 바꿔도<br/>필터는 그냥 지나갑니다.</h2>
            <p>한국어는 조사와 어미가 붙어 같은 요구를 수없이 다르게 쓸 수 있습니다. 여울은 이 교착어 형태론을 공격 방법론으로 삼아, 조사·어미·동의어를 바꿔가며 같은 공격을 다시 시도합니다. 영어 기준으로 만든 필터가 놓치는 구조적 취약점이 여기서 드러납니다.</p>
          </div>
          <div className="stats">
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
          <p className="stats-note">내부 회귀 벤치마크 기준입니다. 관련 연구는 ACK2026 학술대회에 논문으로 제출했습니다.</p>
        </div>
      </section>

      {/* 3 feature cards */}
      <section className="block" id="features" data-section-label="핵심 기능">
        <div className="container">
          <div className="section-head">
            <span className="section-label">CORE CAPABILITIES · 03</span>
            <h2>핵심 기능 세 가지.</h2>
            <p>한국 기업 환경에서 가장 자주 발견되는 보안 사각지대를 정면으로 다루는 세 가지 기능입니다.</p>
          </div>

          <div className="cards">
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-shadow")} onKeyDown={(e) => cardKey(e, "feature-shadow")}>
              <span className="num">01</span>
              <div className="ico"><Icon.shadow /></div>
              <h3>Shadow Agent 탐지</h3>
              <p>임직원이 사내 데이터로 만든 개인 AI 에이전트(ChatGPT GPTs, MCP 클라이언트 등)가 만드는 보안 사각지대를 자동으로 발견하고, 데이터 노출 위험도를 평가합니다.</p>
              <span className="more">자세히 보기</span>
            </article>
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-pii")} onKeyDown={(e) => cardKey(e, "feature-pii")}>
              <span className="num">02</span>
              <div className="ico"><Icon.pii /></div>
              <h3>K-PII 차단</h3>
              <p>주민번호·사업자번호·한국식 주소·계좌·운전면허 등 한국식 PII 14종을 전용 탐지기로 식별하고, 에이전트가 외부로 유출하기 전에 차단합니다.</p>
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
        </div>
      </section>

      {/* How it works */}
      <section className="block" id="how-it-works" data-section-label="검사 절차">
        <div className="container">
          <div className="section-head">
            <span className="section-label">HOW IT WORKS · 03 STEPS</span>
            <h2>남의 서비스를<br/>함부로 두드리지 않습니다.</h2>
            <p>침투 테스트는 실제 공격을 보내는 일입니다. 여울은 검사할 권한이 있는지 먼저 확인하고, 검사 직전에 다시 한번 승낙을 받은 뒤에만 시작합니다.</p>
          </div>

          <div className="flow">
            <div className="flow-step">
              <span className="step-num">STEP 01</span>
              <h4>권한 확인</h4>
              <p>도메인 소유권을 검증한 뒤에만 검사할 수 있습니다. 검사를 시작하기 직전에 한 번 더 개별 승낙을 받습니다.</p>
              <div className="terminal">verify domain · confirm consent</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 02</span>
              <h4>형태 변형 공격</h4>
              <p>조사·어미·동의어를 바꿔가며 같은 공격을 다시 시도합니다. 진행 중 언제든 즉시 중단(Kill Switch)할 수 있습니다.</p>
              <div className="terminal">mutate josa · eomi · synonym</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 03</span>
              <h4>판정과 리포트</h4>
              <p>결과를 확정·의심·통과·미검사 네 단계로 나눠 알려드립니다. 저장 전 개인정보는 마스킹하고, 데이터 유형별로 자동 파기합니다.</p>
              <div className="terminal">CONFIRMED · SUSPECTED · CLEAN · UNTESTED</div>
            </div>
          </div>

          <div className="honesty-note" style={{marginTop: 48}}>
            <span className="section-label">WHAT WE DO NOT SAY</span>
            <h3>"100% 안전"이라고 말하지 않습니다.</h3>
            <p>여울이 확인해 드리는 것은 알려진 공격 범위 안에서 통과했다는 사실입니다. 검사하지 못한 범위는 리포트에 미검사(UNTESTED)로 남기고 표지에 그대로 적습니다. 무엇을 확인했는지만큼 무엇을 확인하지 못했는지도 알아야 판단할 수 있기 때문입니다.</p>
          </div>

          <div style={{marginTop: 56, display: "flex", justifyContent: "center"}}>
            <ContactButton onContact={goContact} prefill="여울 검사 절차에 대해 문의합니다." />
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} prefill="여울 도입을 문의합니다." />
    </div>
  );
}

window.ProductPage = ProductPage;
