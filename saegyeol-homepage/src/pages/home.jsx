function HomePage({ setRoute }) {
  const goContact = createContactNav(setRoute);
  const openRoute = (route) => { setRoute(route); window.scrollTo({ top: 0, behavior: "auto" }); };
  const cardKey = (event, route) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRoute(route);
    }
  };

  // 섹션 순서는 디자인 시스템 6.3을 따른다.
  //   히어로 → 새결이 하는 일 → 여울 → 진행 방식 → 팀 → 문의
  // 구분은 배경색 교대(물보라 ↔ 흰색). 문서가 "배경색 교대 또는 물결선"이라
  // 했으므로 둘을 겹쳐 쓰지 않고, 물결선은 히어로 끝에 한 번만 둔다.
  return (
    <div data-screen-label="01 Home">
      {/* 회사 소개 — 여울 이야기를 꺼내기 전에 새결이 어떤 회사인지 먼저 말한다.
          모토·비전은 회사가 정한 문구라 해요체로 바꾸지 않는다 (디자인 시스템 7장 예외). */}
      <section className="block" data-section-label="새결">
        <div className="container">
          <div className="section-head">
            <span className="section-label">새결</span>
            <h2>보안을 더 쉽게,<br className="wide-only" />{" "}안전한 디지털 세상을 위하여.</h2>
            <p>보안은 원래 어렵고 겁주는 분야예요. 새결은 그 반대로 가요.
              어려운 말을 덜어내고, 무엇이 위험한지와 무엇을 고치면 되는지만 남겨 드려요.</p>
          </div>

          <div className="motto-row">
            <p className="motto">Think Better Act Smarter</p>
            <p className="motto-ko">더 좋은 생각으로, 똑똑하게 행동하는 것.</p>
          </div>

          <div className="about-grid">
            <div className="about-item">
              <span className="k">비전</span>
              <strong>정보보안의 단순화·간편화·보편화</strong>
              <p>쉽게 보이고, 바로 쓸 수 있고, 누구나 이해하게.</p>
            </div>
            <div className="about-item">
              <span className="k">하는 일</span>
              <strong>레드티밍 및 모의해킹</strong>
              <p>지금은 AI 에이전트 점검(여울)부터 해 드려요.</p>
            </div>
            <div className="about-item">
              <span className="k">목표</span>
              <strong>안전하고 편리한 정보사회</strong>
              <p>만드는 데 기여하고 앞장서는 것.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 히어로 — 물보라 면, 왼쪽 정렬, 큰 문장 한 줄 + 짧은 설명 + 버튼 두 개 */}
      <section className="hero" data-section-label="인트로">
        <div className="hero-inner">
          <span className="hero-tag">한국어 AI 에이전트 보안</span>
          <h1>내보내도 되는 상태인지,<br className="wide-only" />{" "}내보내기 전에 확인해요.</h1>
          <p className="hero-sub">
            여울이 출시 직전의 한국어 AI&nbsp;에이전트에 실제 공격을 넣어보고, 배포해도 되는지 알려드려요.
            확인한 범위와 확인하지 못한 범위를 같이 적어 드려요.
          </p>
          <div className="hero-cta">
            <button className="btn btn-accent" onClick={goContact}>
              점검 문의하기 <span className="arrow">→</span>
            </button>
            <button className="btn btn-ghost" onClick={() => openRoute("product")}>
              여울 알아보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 새결이 하는 일 — 주 업은 레드티밍·모의해킹. 지금 할 수 있는 것부터 적는다. */}
      <section className="block" id="what-we-do" data-section-label="하는 일">
        <div className="container">
          <div className="section-head">
            <span className="section-label">하는 일</span>
            <h2>공격자 쪽에서 먼저 두드려 봐요.</h2>
            <p>새결은 실제 공격자처럼 먼저 공격해 보고, 막아야 할 곳을 찾아 드려요.
              지금은 AI&nbsp;에이전트 점검부터 해 드리고, 회사 전체를 대상으로 하는 점검은 준비하고 있어요.</p>
          </div>

          <div className="cards">
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("product")} onKeyDown={(e) => cardKey(e, "product")}>
              <span className="num">01</span>
              <div className="ico"><Icon.inject /></div>
              <h3>AI 에이전트 점검 — 여울</h3>
              <p>내보내기 전의 AI&nbsp;에이전트에 한국어로 공격을 넣어보고, 배포해도 되는지 알려드려요.
                지금 바로 맡기실 수 있어요.</p>
              <span className="more">자세히 보기</span>
            </article>
            <article className="card card-soon">
              <span className="num">02</span>
              <h3>레드티밍 <span className="soon">준비 중</span></h3>
              <p>실제 공격자처럼 목표를 하나 정하고, 회사 전체를 대상으로 끝까지 공격해 보는 훈련이에요.
                준비가 끝나면 알려드릴게요.</p>
            </article>
            <article className="card card-soon">
              <span className="num">03</span>
              <h3>모의해킹 <span className="soon">준비 중</span></h3>
              <p>홈페이지·앱·서버에 직접 침투해 보고, 뚫린 곳과 고치는 방법을 적어 드리는 점검이에요.
                준비가 끝나면 알려드릴게요.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 여울 — 기존 세 기능과 지표를 그대로 쓴다 */}
      <section className="block" data-section-label="여울">
        <div className="container">
          <div className="section-head">
            <span className="section-label">여울</span>
            <h2>한국어로 공격해야<br className="wide-only" />{" "}보이는 구멍이 있어요.</h2>
            <p>한국어는 조사와 어미가 붙어 같은 뜻을 수없이 다르게 쓸 수 있어요.
              영어를 기준으로 만든 필터는 이 변형을 대부분 놓쳐요.
              여울은 그 형태 변형을 공격 방법으로 삼아 에이전트를 두드려 봐요.</p>
          </div>

          <div className="cards">
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-shadow")} onKeyDown={(e) => cardKey(e, "feature-shadow")}>
              <span className="num">01</span>
              <div className="ico"><Icon.shadow /></div>
              <h3>숨은 에이전트 찾기</h3>
              <p>임직원이 사내 데이터로 만든 개인 AI&nbsp;에이전트가 만드는 사각지대를 자동으로 찾고 위험도를 매겨요.</p>
              <span className="more">자세히 보기</span>
            </article>
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-pii")} onKeyDown={(e) => cardKey(e, "feature-pii")}>
              <span className="num">02</span>
              <div className="ico"><Icon.pii /></div>
              <h3>한국식 개인정보 차단</h3>
              <p>주민번호·사업자번호·한국식 주소·계좌·운전면허 등 한국식 개인정보 14종을 전용 탐지기로 찾아 막아요.</p>
              <span className="more">자세히 보기</span>
            </article>
            <article className="card card-link" role="link" tabIndex={0}
              onClick={() => openRoute("feature-report")} onKeyDown={(e) => cardKey(e, "feature-report")}>
              <span className="num">03</span>
              <div className="ico"><Icon.report /></div>
              <h3>증거가 들어간 리포트</h3>
              <p>취약점마다 그대로 다시 해 볼 수 있는 증거를 담아 드려요. 표지에는 이번 검사가 어디까지 다뤘는지 적어요.</p>
              <span className="more">자세히 보기</span>
            </article>
          </div>

          <div className="stats" style={{ marginTop: 48 }}>
            <div className="item">
              <div className="v">154<span className="unit">종</span></div>
              <div className="k">형태 변형 공격 유형</div>
            </div>
            <div className="item">
              <div className="v">97.4<span className="unit">%</span></div>
              <div className="k">찾아낸 비율</div>
            </div>
            <div className="item">
              <div className="v">5.3<span className="unit">%</span></div>
              <div className="k">잘못 짚은 비율</div>
            </div>
            <div className="item">
              <div className="v">4<span className="unit">단계</span></div>
              <div className="k">판정 구분 (확정·의심·통과·미검사)</div>
            </div>
          </div>
          <p className="stats-basis">찾아낸 비율과 잘못 짚은 비율은 자체 테스트 기준이에요.</p>
        </div>
      </section>

      {/* 진행 방식 — 실제 순서가 있는 과정이라 번호를 쓴다 (6.3) */}
      <section className="block" data-section-label="진행 방식">
        <div className="container">
          <div className="section-head">
            <span className="section-label">진행 방식</span>
            <h2>권한을 확인하고, 공격하고,<br className="wide-only" />{" "}다시 확인해요.</h2>
            <p>점검은 실제 공격을 보내는 일이에요. 그래서 검사할 권한을 먼저 확인하고,
              남의 서비스를 함부로 두드리지 않아요.</p>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step-num">1단계</span>
              <h4>권한 확인</h4>
              <p>도메인 소유권을 확인한 뒤에만 검사할 수 있어요. 범위와 일정을 같이 적어 두고 시작해요.</p>
            </div>
            <div className="flow-step">
              <span className="step-num">2단계</span>
              <h4>형태 변형 공격</h4>
              <p>조사·어미·동의어를 바꿔가며 같은 공격을 다시 넣어 봐요. 영어 기준 필터가 놓치는 자리가 여기서 드러나요.</p>
            </div>
            <div className="flow-step">
              <span className="step-num">3단계</span>
              <h4>판정과 리포트</h4>
              <p>결과를 확정·의심·통과·미검사 네 단계로 나눠 드려요. 고치는 방법을 항목마다 같이 적어요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 팀 */}
      <section className="block" data-section-label="팀">
        <div className="container">
          <div className="banner" role="button" tabIndex={0}
            onClick={() => openRoute("team")}
            onKeyDown={(e) => { if (e.key === "Enter") openRoute("team"); }}>
            <div>
              <span className="section-label">새결을 만드는 사람들</span>
              <h3>한국 AI 보안을 가장 가까이서<br className="wide-only" />{" "}다뤄온 사람들.</h3>
              <p>공격 쪽 보안, AI 성능 평가, 한국형 컴플라이언스. 이 세 가지를 다뤄온 사람들이 새결의 기술을 만들어요.</p>
              <div className="av-stack">
                <span className="av">JH</span>
                <span className="av">YS</span>
              </div>
            </div>
            <button className="btn btn-accent"
              onClick={(e) => { e.stopPropagation(); openRoute("team"); }}>
              팀 보기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 문의 */}
      <section className="block" id="contact" data-section-label="문의">
        <div className="container">
          <div className="contact-grid">
            <div>
              <span className="section-label">바로 문의</span>
              <h2>새결 팀에<br className="wide-only" />{" "}직접 문의해 주세요.</h2>
              <p className="lead" style={{ margin: "0", color: "var(--text-2)", maxWidth: "34em" }}>
                내보내기 전에 점검받고 싶으시거나, 여울이 어디까지 검사하는지 궁금하시면 아래로 보내주세요.
                영업일 기준 1일 안에 회신드려요.
              </p>
              <div className="contact-meta">
                <div className="row"><span className="k">이메일</span><span className="mono">contact@saegyeol.ai.kr</span></div>
                <div className="row"><span className="k">회신</span><span>영업일 기준 1일 안에</span></div>
                <div className="row"><span className="k">분야</span><span>도입 문의 · 보안 점검 · 보안 자문 · 채용</span></div>
                <div className="row"><span className="k">비밀 유지</span><span>요청하시면 NDA를 맺고 진행해요</span></div>
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
