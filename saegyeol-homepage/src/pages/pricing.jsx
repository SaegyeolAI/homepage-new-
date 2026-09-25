function PricingPage({ setRoute }) {
  // 예전에는 DOM value setter를 직접 호출해 textarea에 값을 밀어 넣었다.
  // 이제는 ContactForm이 prefill을 받아 자기 상태로 반영한다.
  const goContact = createContactNav(setRoute);
  const askAbout = (subject) => goContact(`${subject} 요금제 도입을 문의합니다.`);

  // 금액은 아직 정해지지 않았다. 플랜 구성만 보여주고 가격은 적지 않는다.
  const plans = [
    {
      id: "free",
      name: "무료",
      caption: "처음 한 번 검사해 볼 때",
      features: [
        "전체 탐지 + 형태 변형 공격",
        "재현 가능한 증거가 담긴 리포트",
        "발견된 문제의 조치 가이드",
        "재검사 24시간당 1회",
        "통과 인증 없음",
      ],
    },
    {
      id: "pro",
      name: "프로",
      caption: "고친 뒤 다시 검사하는 일이 잦을 때",
      featured: true,
      features: [
        "무료 기능 전부 포함",
        "재검사 무제한 (쿨다운 없음)",
        "통과 인증서 발급",
        "관련 기준 참고 자료 옵션",
        "재검사 이력 관리",
      ],
    },
    {
      id: "franchise",
      name: "프랜차이즈",
      caption: "에이전트가 여럿이거나 내부망에 둬야 할 때",
      features: [
        "프로 기능 전부 포함",
        "여러 에이전트 자산 단위",
        "온프레미스 배포",
        "전용 지원",
        "감사 대응용 리포트",
      ],
    },
  ];

  const rows = [
    ["탐지 엔진", "동일", "동일", "동일"],
    ["증거 기반 리포트", "포함", "포함", "포함"],
    ["재검사", "24시간당 1회", "무제한", "무제한"],
    ["통과 인증서", "미제공", "제공", "제공"],
    ["관련 기준 참고 자료", "미제공", "옵션", "감사 대응형"],
    ["재검사 이력", "미제공", "관리", "자산 단위 관리"],
    ["배포 방식", "클라우드", "클라우드", "온프레미스 지원"],
    ["지원", "기본", "기본", "전용 지원"],
  ];

  return (
    <div data-screen-label="Pricing · 여울">
      <section className="page-hero pricing-hero" data-section-label="요금 안내">
        <div className="hero-bg" />
        <div className="container" style={{ position: "relative" }}>
          <span className="section-label">PRODUCT · 여울 · PRICING</span>
          <h1>뚫는 능력은 같고,<br />다시 검사하는 횟수가 다릅니다.</h1>
          <p>비싼 플랜이라고 더 잘 찾아내지는 않습니다. 어느 플랜이든 같은 엔진으로 검사합니다. 갈리는 건 몇 번이나 다시 검사할 수 있는지, 인증서를 받는지, 어디에 설치하는지입니다.</p>
          <p className="pricing-pending">요금제는 출시와 함께 공개합니다.</p>
          <div className="hero-cta" style={{ marginTop: 36 }}>
            <a className="btn btn-accent" href="#plans" onClick={(e) => { e.preventDefault(); document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" }); }}>
              플랜 비교 <span className="arrow">↓</span>
            </a>
            <ContactButton onContact={goContact} prefill="여울 도입을 문의합니다." variant="ghost" />
          </div>
        </div>
      </section>

      <section className="block" id="plans" data-section-label="플랜">
        <div className="container">
          <div className="section-head">
            <span className="section-label">PLANS · 03</span>
            <h2>세 플랜, 한눈에.</h2>
            <p>우선 무료로 한 번 검사해 보세요. 고치고 다시 확인하는 일이 잦아지면 프로입니다. 에이전트가 여럿이거나 내부망에 둬야 한다면 프랜차이즈를 보시면 됩니다.</p>
            <p className="pricing-pending">금액은 아직 정하는 중입니다.</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.id} className={`pricing-card${plan.featured ? " featured" : ""}`}>
                {plan.featured && <span className="pricing-recommend">RECOMMENDED</span>}
                <div className="pricing-card-head">
                  <h3>{plan.name}</h3>
                  <p>{plan.caption}</p>
                </div>
                <ul>
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <ContactButton onContact={() => askAbout(plan.name)}
                  variant={plan.featured ? "accent" : "ghost"} />
              </article>
            ))}
          </div>

          <div className="honesty-note">
            <span className="section-label">HONESTY PRINCIPLE</span>
            <h3>탐지 정확도로 등급을 나누지 않습니다.</h3>
            <p>세 플랜의 차이는 다시 검사할 수 있는 횟수와 설치 위치뿐입니다. 리포트도 안전을 보증하는 문서가 아닙니다. 무엇을 어디까지, 언제 기준으로 검사했는지 적어 둔 성적서에 가깝습니다.</p>
          </div>
        </div>
      </section>

      <section className="block pricing-compare-section" data-section-label="비교">
        <div className="container">
          <div className="section-head">
            <span className="section-label">COMPARE</span>
            <h2>어떻게 운영할지에 맞춰 고르세요.</h2>
            <p>검사 성능은 세 플랜이 같습니다. 표에서 갈리는 건 횟수와 인증서, 설치 위치입니다.</p>
            {/* 좌우 스크롤 안내는 표가 잘리는 좁은 화면에서만 의미가 있다. */}
            <p className="only-mobile">표를 좌우로 밀어서 보세요.</p>
          </div>
          <div className="pricing-table-wrap" role="region" aria-label="여울 요금제 비교표" tabIndex={0}>
            <table className="pricing-table">
              <thead>
                <tr><th>구분</th><th>무료</th><th>프로</th><th>프랜차이즈</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row">{cell}</th> : <td key={`${row[0]}-${cell}`}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="block" data-section-label="자주 묻는 내용">
        <div className="container">
          <div className="section-head">
            <span className="section-label">FAQ</span>
            <h2>요금제에서 자주 묻는 내용.</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>무료 플랜과 프로 플랜의 탐지 성능이 다른가요?</summary>
              <p>아닙니다. 어느 플랜이든 같은 엔진으로, 같은 형태 변형 공격을 넣습니다. 달라지는 건 다시 검사할 수 있는 횟수와 인증서, 이력 관리 같은 운영 쪽입니다.</p>
            </details>
            <details>
              <summary>무료 플랜에서도 증거와 조치 방법을 받을 수 있나요?</summary>
              <p>네. 재현할 수 있는 증거가 담긴 리포트와, 발견된 문제를 어떻게 고치면 되는지가 함께 들어갑니다.</p>
            </details>
            <details>
              <summary>프로 플랜은 몇 번까지 다시 검사할 수 있나요?</summary>
              <p>횟수 제한이 없습니다. 쿨다운 없이 다시 검사할 수 있고, 검사 이력이 남습니다.</p>
            </details>
            <details>
              <summary>내부망에 설치해야 하면 어떤 플랜인가요?</summary>
              <p>프랜차이즈입니다. 관리할 에이전트가 여럿이거나 감사 대응용 리포트가 필요한 경우도 여기에 해당합니다.</p>
            </details>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} prefill="여울 도입을 문의합니다." />
    </div>
  );
}

window.PricingPage = PricingPage;
