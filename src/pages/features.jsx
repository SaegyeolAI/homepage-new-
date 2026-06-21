/* ──────────────────────────────────────────────
   CAPABILITY 01  Shadow Agent 탐지
   ────────────────────────────────────────────── */
function FeatureShadowPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  return (
    <div data-screen-label="Feature: Shadow Agent">

      <section className="page-hero">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <span className="section-label">CAPABILITY 01 · SHADOW AGENT 탐지</span>
          <h1>보안팀도 모르는<br/>AI 에이전트를<br/>먼저 찾아냅니다.</h1>
          <p>임직원이 사내 데이터로 만든 개인 AI 에이전트는 IT·보안팀의 가시권 밖에서 작동합니다. K-AgentSec은 네트워크 트래픽과 MCP 연결 패턴을 분석해 Shadow Agent를 자동으로 식별하고 데이터 노출 위험도를 평가합니다.</p>
          <div className="hero-cta" style={{marginTop:36}}>
            <button className="btn btn-accent" onClick={goContact}>도입 문의하기 <span className="arrow">→</span></button>
            <button className="btn btn-ghost" onClick={() => { setRoute("product"); window.scrollTo({ top: 0 }); }}>
              여울 전체 보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 문제 정의 */}
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="section-label">THE PROBLEM</span>
            <h2>AI 에이전트 위협의<br/>80%는 내부에서 시작됩니다.</h2>
            <p>생성형 AI 도구가 대중화되면서 임직원들은 보안 검토 없이 사내 데이터를 연결한 개인 AI 워크플로우를 구축하고 있습니다. 이 Shadow Agent들은 승인되지 않은 경로로 고객 정보, 내부 코드, 금융 데이터를 처리하고 외부 LLM 서비스로 전송합니다.</p>
          </div>
          <div className="stats">
            <div className="item">
              <div className="v">73<span className="unit">%</span></div>
              <div className="k">임직원의 비인가 AI 도구 사용률</div>
            </div>
            <div className="item">
              <div className="v">4.2<span className="unit">배</span></div>
              <div className="k">Shadow Agent 경유 데이터 유출 위험</div>
            </div>
            <div className="item">
              <div className="v">3<span className="unit">종</span></div>
              <div className="k">주요 Shadow Agent 유형</div>
            </div>
            <div className="item">
              <div className="v">18<span className="unit">일</span></div>
              <div className="k">평균 탐지 지연 (기존 도구)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Shadow Agent 유형 */}
      <section className="block" style={{paddingTop:0, borderTop:"none"}}>
        <div className="container">
          <div className="section-head">
            <span className="section-label">SHADOW AGENT TYPES</span>
            <h2>어떤 형태로 숨어있는가.</h2>
            <p>Shadow Agent는 세 가지 유형으로 분류됩니다. 각 유형은 서로 다른 공격 표면과 데이터 노출 경로를 가집니다.</p>
          </div>
          <div className="cards">
            <article className="card">
              <span className="num">TYPE A</span>
              <div className="ico"><Icon.shadow /></div>
              <h3>외부 LLM 연결형</h3>
              <p>ChatGPT GPTs, Claude Projects, Gemini Gems 등에 사내 문서·코드·DB 쿼리 결과를 직접 붙여넣거나 API로 연결하는 형태. 사내 IP·기밀 코드·고객 데이터가 외부 LLM 학습 파이프라인에 유입될 수 있습니다.</p>
            </article>
            <article className="card">
              <span className="num">TYPE B</span>
              <div className="ico"><Icon.inject /></div>
              <h3>MCP 자체 서버형</h3>
              <p>임직원이 로컬 또는 팀 서버에 비인가 MCP 서버를 구축해 사내 파일 시스템·Slack·GitHub·DB에 에이전트 접근 권한을 부여하는 형태. MCP 프로토콜 특성상 권한 경계가 느슨해 측면 이동(Lateral Movement)이 용이합니다.</p>
            </article>
            <article className="card">
              <span className="num">TYPE C</span>
              <div className="ico"><Icon.graph /></div>
              <h3>자동화 파이프라인형</h3>
              <p>n8n, Zapier AI, Make 등 노코드 자동화 플랫폼에 LLM 노드를 삽입해 사내 데이터를 정기적으로 처리·요약·전송하는 형태. 반복 실행되는 특성상 지속적인 데이터 유출 경로가 됩니다.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 탐지 방식 */}
      <section className="block" id="how-shadow-works">
        <div className="container">
          <div className="section-head">
            <span className="section-label">HOW WE DETECT · 03 STEPS</span>
            <h2>수동 감사 없이<br/>자동으로 탐지합니다.</h2>
            <p>K-AgentSec은 에이전트 연결을 수동으로 신고받는 방식 대신, 트래픽 패턴과 MCP 핸드셰이크를 자동 분석해 Shadow Agent를 식별합니다.</p>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step-num">STEP 01</span>
              <h4>트래픽 핑거프린팅</h4>
              <p>외부 LLM API 엔드포인트(OpenAI, Anthropic, Google 등)로 향하는 비인가 트래픽 패턴과 MCP SSE/WebSocket 핸드셰이크를 수동 개입 없이 탐지합니다.</p>
              <div className="terminal">detect llm_api · mcp_handshake · sse_stream</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 02</span>
              <h4>행동 분류 및 페이로드 분석</h4>
              <p>탐지된 에이전트의 도구 호출 패턴(file_read, db_query, code_exec 등)과 전송 페이로드에서 민감 데이터 포함 여부를 분석합니다.</p>
              <div className="terminal">classify tools · scan payload · tag pii</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 03</span>
              <h4>위험도 평가 및 보고</h4>
              <p>데이터 민감도 × 노출 표면 × 사용 빈도를 기반으로 위험도 점수를 산출하고, 담당자 식별과 함께 리포트를 생성합니다.</p>
              <div className="terminal">score risk · identify owner · report</div>
            </div>
          </div>
          <div style={{marginTop:56, display:"flex", justifyContent:"center"}}>
            <button className="btn btn-accent" onClick={goContact}>Shadow Agent 점검 요청 <span className="arrow">→</span></button>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   CAPABILITY 02  K-PII 차단
   ────────────────────────────────────────────── */
function FeaturePiiPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const PII_LIST = [
    { num:"01", name:"주민등록번호",    desc:"생년월일+성별+지역 조합 패턴, 체크섬 검증 포함" },
    { num:"02", name:"외국인등록번호",  desc:"A/B/C 유형 외국인 등록 번호 패턴 전체" },
    { num:"03", name:"사업자등록번호",  desc:"10자리 고유 패턴, 법인·개인사업자 모두 지원" },
    { num:"04", name:"법인등록번호",    desc:"13자리 법인 고유 식별 번호" },
    { num:"05", name:"여권번호",        desc:"한국 전자여권 알파뉴메릭 패턴" },
    { num:"06", name:"운전면허번호",    desc:"지역코드+생년+고유번호 구조 패턴" },
    { num:"07", name:"건강보험증번호",  desc:"요양기관기호 포함 복합 패턴" },
    { num:"08", name:"금융계좌번호",    desc:"18개 국내 은행 계좌 형식 전체 지원" },
    { num:"09", name:"신용·체크카드번호", desc:"Luhn 알고리즘 + 국내 카드사 BIN 패턴" },
    { num:"10", name:"한국식 전화번호", desc:"지역번호·휴대폰·인터넷전화 포맷 모두 포함" },
    { num:"11", name:"한국식 주소",     desc:"도로명·지번 주소 NLP 기반 추출" },
    { num:"12", name:"이메일 주소",     desc:"RFC 5322 + 한국 도메인 특화 패턴" },
    { num:"13", name:"의료·진단 정보", desc:"KCD 코드, 처방전 패턴, 진단서 키워드" },
    { num:"14", name:"생체 식별 정보",  desc:"얼굴 벡터·지문 해시 등 비정형 생체정보 태그" },
  ];

  return (
    <div data-screen-label="Feature: K-PII">

      <section className="page-hero">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <span className="section-label">CAPABILITY 02 · K-PII 차단</span>
          <h1>한국식 개인정보<br/>14종, 유출 전에<br/>막습니다.</h1>
          <p>국제 LLM 보안 도구는 한국식 주민번호·사업자번호·운전면허번호·한국식 주소를 제대로 식별하지 못합니다. K-AgentSec의 K-PII 탐지기는 한국 개인정보 14종을 전용 패턴과 컨텍스트 인식 ML 모델로 실시간 탐지하고, 에이전트가 외부로 전송하기 전에 차단합니다.</p>
          <div className="hero-cta" style={{marginTop:36}}>
            <button className="btn btn-accent" onClick={goContact}>도입 문의하기 <span className="arrow">→</span></button>
            <button className="btn btn-ghost" onClick={() => { setRoute("product"); window.scrollTo({ top: 0 }); }}>
              여울 전체 보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 왜 한국 특화가 필요한가 */}
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="section-label">WHY KOREAN-SPECIFIC</span>
            <h2>국제 도구가 놓치는<br/>한국 개인정보의 구조.</h2>
            <p>주민등록번호는 생년월일·성별·지역코드를 조합한 고유 구조를 가지며, 한국식 주소는 도로명·지번·동호수의 복합 표현이 혼재합니다. 계좌번호는 18개 은행별 형식이 다르고, 의료 정보는 한국형 진단 코드(KCD)를 사용합니다. 이를 정확히 탐지하려면 한국어 전용 패턴과 문맥 이해가 필요합니다.</p>
          </div>
          <div className="stats">
            <div className="item">
              <div className="v">14<span className="unit">종</span></div>
              <div className="k">한국식 PII 카테고리</div>
            </div>
            <div className="item">
              <div className="v">99.1<span className="unit">%</span></div>
              <div className="k">주민번호 탐지 정확도</div>
            </div>
            <div className="item">
              <div className="v">18<span className="unit">개</span></div>
              <div className="k">지원 국내 은행 계좌 패턴</div>
            </div>
            <div className="item">
              <div className="v">&lt;2<span className="unit">ms</span></div>
              <div className="k">실시간 탐지 지연</div>
            </div>
          </div>
        </div>
      </section>

      {/* 14종 목록 */}
      <section className="block" style={{paddingTop:0, borderTop:"none"}}>
        <div className="container">
          <div className="section-head">
            <span className="section-label">COVERAGE · 14 CATEGORIES</span>
            <h2>탐지 대상 14종.</h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16}}>
            {PII_LIST.map(p => (
              <div key={p.num} style={{
                background:"var(--card-bg)", border:"1px solid var(--border)",
                borderRadius:12, padding:"20px 24px", display:"flex", flexDirection:"column", gap:6
              }}>
                <span style={{fontFamily:'"JetBrains Mono",monospace', fontSize:11, color:"var(--accent)", letterSpacing:"0.1em"}}>{p.num}</span>
                <strong style={{fontSize:15, color:"var(--text)", fontWeight:600}}>{p.name}</strong>
                <span style={{fontSize:13, color:"var(--text-2)", lineHeight:1.6}}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 탐지 방식 */}
      <section className="block" id="how-pii-works">
        <div className="container">
          <div className="section-head">
            <span className="section-label">DETECTION APPROACH</span>
            <h2>패턴 + ML + 문맥 인식<br/>3단 방어 구조.</h2>
            <p>단순 정규식 매칭을 넘어, LLM 응답 문맥 전체를 분석해 위장된 PII와 자연어로 서술된 개인정보도 잡아냅니다.</p>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step-num">LAYER 01</span>
              <h4>정규식 패턴 매칭</h4>
              <p>주민번호 체크섬·카드 Luhn 알고리즘·계좌번호 형식 등 구조적으로 검증 가능한 패턴을 0ms 지연으로 1차 필터링합니다.</p>
              <div className="terminal">regex · checksum · luhn · bank_bin</div>
            </div>
            <div className="flow-step">
              <span className="step-num">LAYER 02</span>
              <h4>ML 분류 모델</h4>
              <p>문맥 없이 숫자 나열만으로는 구분하기 어려운 패턴을 한국어 NER 모델이 주변 문장과 함께 판단합니다. 오탐률 2% 미만.</p>
              <div className="terminal">ner · context_window · false_positive_filter</div>
            </div>
            <div className="flow-step">
              <span className="step-num">LAYER 03</span>
              <h4>실시간 차단·마스킹</h4>
              <p>탐지된 PII를 에이전트 응답에서 즉시 제거하거나 마스킹 처리하고, 사건 로그와 함께 담당자에게 알림을 전송합니다.</p>
              <div className="terminal">redact · mask · alert · log_event</div>
            </div>
          </div>
          <div style={{marginTop:56, display:"flex", justifyContent:"center"}}>
            <button className="btn btn-accent" onClick={goContact}>K-PII 탐지 데모 요청 <span className="arrow">→</span></button>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   CAPABILITY 03  컴플라이언스 리포트
   ────────────────────────────────────────────── */
function FeatureReportPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const FRAMEWORKS = [
    { id:"01", name:"ISMS-P",             full:"정보보호 및 개인정보보호 관리체계 인증",  scope:"인증심사 대응" },
    { id:"02", name:"개인정보보호법",       full:"개인정보 보호법 (2023년 개정)",          scope:"법적 의무" },
    { id:"03", name:"금융보안원 AI 가이드", full:"금융분야 AI 보안 가이드라인",            scope:"금융권 필수" },
    { id:"04", name:"금융위 AI 가이드",    full:"금융분야 인공지능(AI) 활용 가이드라인", scope:"금융권 필수" },
    { id:"05", name:"NIST AI RMF",         full:"NIST AI Risk Management Framework 1.0", scope:"글로벌 기준" },
    { id:"06", name:"ISO/IEC 42001",       full:"AI Management System Standard",          scope:"국제 인증" },
    { id:"07", name:"EU AI Act",           full:"EU Artificial Intelligence Act",         scope:"EU 서비스" },
    { id:"08", name:"K-ISMS",             full:"국내 정보보호관리체계",                   scope:"공공·의무대상" },
  ];

  return (
    <div data-screen-label="Feature: Compliance Report">

      <section className="page-hero">
        <div className="hero-bg" />
        <div className="container" style={{position:"relative"}}>
          <span className="section-label">CAPABILITY 03 · 컴플라이언스 리포트</span>
          <h1>익스플로잇 PoC부터<br/>법적 근거까지,<br/>한 번에.</h1>
          <p>K-AgentSec의 리포트는 발견된 취약점을 ISMS-P·개인정보보호법·금융 AI 가이드라인 등 8개 기준에 자동 매핑합니다. 보안팀은 PoC로 재현하고, 법무·컴플라이언스팀은 법적 근거와 조치 기한을 확인할 수 있습니다.</p>
          <div className="hero-cta" style={{marginTop:36}}>
            <button className="btn btn-accent" onClick={goContact}>리포트 샘플 요청 <span className="arrow">→</span></button>
            <button className="btn btn-ghost" onClick={() => { setRoute("product"); window.scrollTo({ top: 0 }); }}>
              여울 전체 보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 왜 이 리포트가 필요한가 */}
      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="section-label">THE GAP</span>
            <h2>보안 결과물이<br/>법무팀에 닿지 않는 문제.</h2>
            <p>기존 모의해킹 리포트는 CVSS 점수와 기술적 재현 방법만 담겨있어, 법무·컴플라이언스팀이 이를 법적 의무 이행에 활용하기 어렵습니다. K-AgentSec은 동일한 취약점 데이터를 기술적 PoC와 법적 매핑 두 형태로 동시에 산출합니다.</p>
          </div>
          <div className="stats">
            <div className="item">
              <div className="v">8<span className="unit">개</span></div>
              <div className="k">컴플라이언스 매핑 기준</div>
            </div>
            <div className="item">
              <div className="v">100<span className="unit">%</span></div>
              <div className="k">한국어 리포트 제공</div>
            </div>
            <div className="item">
              <div className="v">2<span className="unit">포맷</span></div>
              <div className="k">PDF + 웹 리포트 동시 산출</div>
            </div>
            <div className="item">
              <div className="v">36<span className="unit">분</span></div>
              <div className="k">평균 리포트 생성 시간</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8개 프레임워크 */}
      <section className="block" style={{paddingTop:0, borderTop:"none"}}>
        <div className="container">
          <div className="section-head">
            <span className="section-label">SUPPORTED FRAMEWORKS · 08</span>
            <h2>매핑 지원 기준 8종.</h2>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16}}>
            {FRAMEWORKS.map(f => (
              <div key={f.id} style={{
                background:"var(--card-bg)", border:"1px solid var(--border)",
                borderRadius:12, padding:"20px 24px", display:"flex", flexDirection:"column", gap:6
              }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{fontFamily:'"JetBrains Mono",monospace', fontSize:11, color:"var(--accent)", letterSpacing:"0.1em"}}>{f.id}</span>
                  <span style={{fontFamily:'"JetBrains Mono",monospace', fontSize:10, color:"var(--text-2)", letterSpacing:"0.05em", textTransform:"uppercase", padding:"3px 8px", border:"1px solid var(--border)", borderRadius:999}}>{f.scope}</span>
                </div>
                <strong style={{fontSize:15, color:"var(--text)", fontWeight:600}}>{f.name}</strong>
                <span style={{fontSize:13, color:"var(--text-2)", lineHeight:1.6}}>{f.full}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 리포트 구성 */}
      <section className="block" id="report-structure">
        <div className="container">
          <div className="section-head">
            <span className="section-label">REPORT STRUCTURE</span>
            <h2>리포트 안에 담기는 것들.</h2>
            <p>기술팀과 경영진이 같은 리포트로 서로 다른 맥락에서 필요한 정보를 얻을 수 있도록 구성됩니다.</p>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step-num">SECTION A</span>
              <h4>익스플로잇 PoC</h4>
              <p>발견된 취약점을 실제로 재현할 수 있는 PoC 코드·프롬프트·API 요청을 제공합니다. 보안팀이 경영진에게 위험을 직접 시연할 수 있습니다.</p>
              <div className="terminal">poc_prompt · api_request · replay_steps</div>
            </div>
            <div className="flow-step">
              <span className="step-num">SECTION B</span>
              <h4>법령 매핑 및 위반 항목</h4>
              <p>각 취약점이 ISMS-P·개인정보보호법 등 어떤 조항에 해당하는지, 과태료·행정처분 기준과 함께 정리합니다. 법무팀이 즉시 활용 가능합니다.</p>
              <div className="terminal">isms_p_ctrl · pipa_article · penalty_ref</div>
            </div>
            <div className="flow-step">
              <span className="step-num">SECTION C</span>
              <h4>우선순위 조치 로드맵</h4>
              <p>위험도·피해 규모·조치 난이도를 기반으로 단기·중기·장기 조치 항목을 우선순위화하여 실행 가능한 체크리스트로 제공합니다.</p>
              <div className="terminal">priority_high · action_plan · timeline</div>
            </div>
          </div>
          <div style={{marginTop:56, display:"flex", justifyContent:"center"}}>
            <button className="btn btn-accent" onClick={goContact}>리포트 샘플 받아보기 <span className="arrow">→</span></button>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

Object.assign(window, { FeatureShadowPage, FeaturePiiPage, FeatureReportPage });
