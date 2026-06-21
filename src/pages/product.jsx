function ProductPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <div data-screen-label="03 Product · 여울">
      <section className="page-hero">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <div style={{ marginBottom: 16 }}><StatusBadge status="final_review" /></div>
          <span className="section-label">PRODUCT · 여울 · 최종 검토 중</span>
          <h1>한국어 AI 에이전트<br/>시스템을 위한<br/>자동 침투 테스트.</h1>
          <p>한국 기업의 AI 에이전트 시스템(LLM + MCP 서버 + 사용자 플로우)을 한국어 위협 관점에서 자동으로 공격하고, 익스플로잇 PoC와 한국형 컴플라이언스 리포트를 산출합니다.</p>
          <div className="hero-cta" style={{marginTop:36}}>
            <button className="btn btn-accent" onClick={goContact}>도입 문의하기 <span className="arrow">→</span></button>
            <a className="btn btn-ghost" href="#features" onClick={(e)=>{e.preventDefault(); document.getElementById("features")?.scrollIntoView({behavior:"smooth"});}}>
              기능 살펴보기 <span className="arrow">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* One-liner block / stats */}
      <section className="block" style={{paddingBottom:0}}>
        <div className="container">
          <div className="section-head">
            <span className="section-label">WHY 여울</span>
            <h2>국제 도구가 다루지 못하는<br/>한국 환경의 위협을 정확히 짚어냅니다.</h2>
            <p>여울은 한국어 프롬프트 인젝션 2,400+, MCP 권한 우회, K-PII 추출 시나리오를 자동으로 실행하고, ISMS-P/개인정보보호법 기준에 매핑된 한국어 리포트를 산출합니다. PoC와 함께 우선순위 보안 조치도 함께 제안합니다.</p>
          </div>
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

      {/* 3 feature cards */}
      <section className="block" id="features">
        <div className="container">
          <div className="section-head">
            <span className="section-label">CORE CAPABILITIES · 03</span>
            <h2>핵심 기능 세 가지.</h2>
            <p>한국 기업 환경에서 가장 자주 발견되는 보안 사각지대를 정면으로 다루는 세 가지 기능입니다.</p>
          </div>

          <div className="cards">
            <article className="card">
              <span className="num">01</span>
              <div className="ico"><Icon.shadow /></div>
              <h3>Shadow Agent 탐지</h3>
              <p>임직원이 사내 데이터로 만든 개인 AI 에이전트(ChatGPT GPTs, MCP 클라이언트 등)가 만드는 보안 사각지대를 자동으로 발견하고, 데이터 노출 위험도를 평가합니다.</p>
              <a className="more" href="#" onClick={(e)=>e.preventDefault()}>자세히 보기</a>
            </article>
            <article className="card">
              <span className="num">02</span>
              <div className="ico"><Icon.pii /></div>
              <h3>K-PII 차단</h3>
              <p>주민번호·사업자번호·한국식 주소·계좌·운전면허 등 한국식 PII 14종을 전용 탐지기로 식별하고, 에이전트가 외부로 유출하기 전에 차단합니다.</p>
              <a className="more" href="#" onClick={(e)=>e.preventDefault()}>자세히 보기</a>
            </article>
            <article className="card">
              <span className="num">03</span>
              <div className="ico"><Icon.report /></div>
              <h3>컴플라이언스 리포트</h3>
              <p>ISMS-P · 개인정보보호법 · 금융 AI 가이드라인 등 한국형 기준에 자동 매핑된 리포트를 PDF·웹으로 생성. 익스플로잇 PoC와 우선순위 조치를 함께 제공합니다.</p>
              <a className="more" href="#" onClick={(e)=>e.preventDefault()}>자세히 보기</a>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="block" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="section-label">HOW IT WORKS · 03 STEPS</span>
            <h2>연결만 해주시면<br/>나머지는 자동입니다.</h2>
            <p>MCP 엔드포인트 또는 에이전트 API만 연결하면, 새결이 한국어 위협 시나리오를 자동으로 실행하고 결과 리포트를 받아보실 수 있습니다.</p>
          </div>

          <div className="flow">
            <div className="flow-step">
              <span className="step-num">STEP 01</span>
              <h4>에이전트 행동 수집</h4>
              <p>MCP 서버 · LLM 엔드포인트 · 사용자 플로우 로그를 안전하게 연결해 정상 행동 모델을 학습합니다.</p>
              <div className="terminal">connect /agent · /mcp · /logs</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 02</span>
              <h4>위협 분석</h4>
              <p>한국어 프롬프트 인젝션 2,400+, MCP 권한 우회, K-PII 추출 시나리오를 자동 실행합니다.</p>
              <div className="terminal">run inject · pivot · exfil</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 03</span>
              <h4>리포트 산출</h4>
              <p>익스플로잇 PoC와 ISMS-P/개인정보보호법 매핑이 포함된 한국어 리포트를 PDF·웹으로 받아보세요.</p>
              <div className="terminal">export ko_report.pdf</div>
            </div>
          </div>

          <div style={{marginTop: 56, display: "flex", justifyContent: "center"}}>
            <button className="btn btn-accent" onClick={goContact}>도입 문의하기 <span className="arrow">→</span></button>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

window.ProductPage = ProductPage;
