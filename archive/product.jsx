function ProductPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({behavior:"smooth"}), 80);
  };

  return (
    <div data-screen-label="03 Product · K-AgentSec">
      <section className="prod-hero">
        <div className="hero-grid" />
        <div className="container" style={{position:"relative"}}>
          <span className="prod-tag"><span className="blink" /> K-AGENTSEC · v1.2 · BETA</span>
          <h1>한국어 AI 에이전트<br/>시스템을 위한 자동 침투 테스트 서비스.</h1>
          <p className="lede">
            한국 기업의 AI 에이전트 시스템(LLM + MCP 서버 + 사용자 플로우)을
            한국어 위협 관점에서 자동으로 공격하고,
            익스플로잇 PoC와 한국형 컴플라이언스 매핑 리포트를 산출합니다.
          </p>

          <div className="prod-stats">
            <div className="item">
              <div className="k">한국어 공격 페이로드</div>
              <div className="v">2,400<span className="unit">+</span></div>
            </div>
            <div className="item">
              <div className="k">평균 점검 시간</div>
              <div className="v">36<span className="unit">분</span></div>
            </div>
            <div className="item">
              <div className="k">컴플라이언스 매핑</div>
              <div className="v">8<span className="unit">개 기준</span></div>
            </div>
            <div className="item">
              <div className="k">한국어 PII 카테고리</div>
              <div className="v">14<span className="unit">종</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="block">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">CORE FEATURES · 03</span>
              <h2>한국 환경에서만 보이는<br/>위협을 정확히 짚어냅니다.</h2>
            </div>
            <p>국제 LLM 보안 도구는 한국어 인젝션, 한국식 PII, 국내 컴플라이언스를 다루지 못합니다. K-AgentSec은 이를 정면으로 다룹니다.</p>
          </div>

          <div className="features">
            <div className="feature">
              <div className="num">01</div>
              <div className="glyph glyph-shadow"></div>
              <h3>Shadow Agent 탐지</h3>
              <p>임직원이 사내 데이터로 만든 개인 AI 에이전트가 만드는 보안 사각지대를 자동으로 발견하고 위험도를 평가합니다.</p>
              <span className="tag">DISCOVERY · BLIND SPOT</span>
            </div>
            <div className="feature">
              <div className="num">02</div>
              <div className="glyph">
                <div className="glyph-pii">
                  주민번호:&nbsp;<span className="red">900101-1******</span><br/>
                  사업자번호:&nbsp;<span className="red">123-45-*****</span><br/>
                  주소:&nbsp;<span className="red">서울시 ··· 101동</span>
                </div>
              </div>
              <h3>K-PII 차단</h3>
              <p>주민번호·사업자번호·한국식 주소·계좌·운전면허 등 한국식 PII 14종을 전용 탐지기로 식별·차단합니다.</p>
              <span className="tag">PII · KO_KR</span>
            </div>
            <div className="feature">
              <div className="num">03</div>
              <div className="glyph">
                <div className="glyph-report" style={{height:"60%"}}>
                  <div className="bar" style={{height:"40%"}}></div>
                  <div className="bar" style={{height:"70%"}}></div>
                  <div className="bar a" style={{height:"90%"}}></div>
                  <div className="bar" style={{height:"55%"}}></div>
                  <div className="bar" style={{height:"75%"}}></div>
                  <div className="bar a" style={{height:"95%"}}></div>
                </div>
              </div>
              <h3>컴플라이언스 리포트</h3>
              <p>ISMS-P · 개인정보보호법 · 금융 AI 가이드라인 등 한국형 기준에 자동 매핑된 리포트를 생성합니다.</p>
              <span className="tag">REPORT · KO COMPLIANCE</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="block">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">HOW IT WORKS · 03 STEPS</span>
              <h2>연결만 해주시면<br/>나머지는 자동입니다.</h2>
            </div>
            <p>MCP 엔드포인트 또는 에이전트 API만 연결하면, 새결이 한국어 위협 시나리오를 자동으로 실행하고 결과 리포트를 받아보실 수 있습니다.</p>
          </div>

          <div className="flow">
            <div className="flow-step">
              <span className="step-num">STEP 01</span>
              <h4>에이전트 행동 수집</h4>
              <p>MCP 서버·LLM 엔드포인트·사용자 플로우 로그를 안전하게 연결해 정상 행동 모델을 학습합니다.</p>
              <div className="glyph-row">/agent/* · /mcp/* · /logs/*</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="step-num">STEP 02</span>
              <h4>위협 분석</h4>
              <p>한국어 프롬프트 인젝션 2,400+, MCP 권한 우회, K-PII 추출 시나리오를 자동 실행합니다.</p>
              <div className="glyph-row">INJECT · PIVOT · EXFIL</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <span className="step-num">STEP 03</span>
              <h4>리포트 산출</h4>
              <p>익스플로잇 PoC와 ISMS-P/개인정보보호법 매핑이 포함된 한국어 리포트를 PDF·웹으로 받아보세요.</p>
              <div className="glyph-row">PoC · KO_REPORT.pdf</div>
            </div>
          </div>

          <div className="cta-band">
            <h3>K-AgentSec PoC를<br/>이번 분기 안에 시작해 보세요.</h3>
            <button className="btn btn-accent" onClick={goContact}>
              도입 문의하기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

window.ProductPage = ProductPage;
