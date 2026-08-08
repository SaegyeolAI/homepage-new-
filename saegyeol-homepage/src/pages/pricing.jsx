function PricingPage({ setRoute }) {
  const goContact = (subject) => {
    setRoute("home");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      const message = document.getElementById("cfv2-msg");
      if (message && subject && !message.value) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        setter?.call(message, `${subject} 요금제 도입을 문의합니다.`);
        message.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 100);
  };

  const plans = [
    {
      id: "free",
      name: "무료",
      price: "0원",
      caption: "첫 점검과 결과 확인",
      features: [
        "전체 탐지 + 형태 변형",
        "Exploit PoC 리포트",
        "remediation 개선 방안",
        "재검사 24시간당 1회",
        "통과 인증 없음",
      ],
      cta: "무료 점검 문의",
    },
    {
      id: "pro",
      name: "프로",
      price: "월 9만원",
      caption: "지속적인 검증 루프",
      featured: true,
      features: [
        "무료 기능 전부 포함",
        "재검증 무제한 (쿨다운 없음)",
        "통과 인증서 발급",
        "컴플라이언스 매핑 옵션",
        "재검증 이력 관리",
      ],
      cta: "프로 도입 문의",
    },
    {
      id: "franchise",
      name: "프랜차이즈",
      price: "상담 후 결정",
      caption: "다중 자산·온프레미스",
      features: [
        "프로 기능 전부 포함",
        "여러 에이전트 자산 단위",
        "온프레미스 배포",
        "전용 지원",
        "규제 감사 통과용 리포트",
      ],
      cta: "기업 견적 문의",
    },
  ];

  const rows = [
    ["탐지 엔진", "동일", "동일", "동일"],
    ["Exploit PoC 리포트", "포함", "포함", "포함"],
    ["재검증", "24시간당 1회", "무제한", "무제한"],
    ["통과 인증서", "미제공", "제공", "제공"],
    ["컴플라이언스 매핑", "미제공", "옵션", "감사 대응형"],
    ["재검증 이력", "미제공", "관리", "자산 단위 관리"],
    ["배포 방식", "클라우드", "클라우드", "온프레미스 지원"],
    ["지원", "기본", "기본", "전용 지원"],
  ];

  return (
    <div data-screen-label="Pricing · 여울">
      <section className="page-hero pricing-hero">
        <div className="hero-bg" />
        <div className="container" style={{ position: "relative" }}>
          <span className="section-label">PRODUCT · 여울 · PRICING</span>
          <h1>뚫는 능력은 같고,<br />검증 루프가 달라집니다.</h1>
          <p>여울은 탐지 정확도로 요금제를 나누지 않습니다. 모든 플랜에 동일한 탐지 엔진을 제공하고, 재검증 접근권·인증·배포 방식에 따라 구분합니다.</p>
          <div className="hero-cta" style={{ marginTop: 36 }}>
            <a className="btn btn-accent" href="#plans" onClick={(e) => { e.preventDefault(); document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" }); }}>
              요금제 비교 <span className="arrow">↓</span>
            </a>
            <button className="btn btn-ghost" onClick={() => goContact("여울")}>도입 문의하기 <span className="arrow">→</span></button>
          </div>
        </div>
      </section>

      <section className="block" id="plans">
        <div className="container">
          <div className="section-head">
            <span className="section-label">PLANS · 03</span>
            <h2>세 플랜, 한눈에.</h2>
            <p>첫 검증은 무료로 시작하고, 반복 검증이나 인증이 필요하면 프로, 다중 에이전트와 온프레미스가 필요하면 프랜차이즈를 선택합니다.</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.id} className={`pricing-card${plan.featured ? " featured" : ""}`}>
                {plan.featured && <span className="pricing-recommend">RECOMMENDED</span>}
                <div className="pricing-card-head">
                  <span className="pricing-plan">{plan.name}</span>
                  <h3>{plan.price}</h3>
                  <p>{plan.caption}</p>
                </div>
                <ul>
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <button className={`btn ${plan.featured ? "btn-accent" : "btn-ghost"}`} onClick={() => goContact(plan.name)}>
                  {plan.cta} <span className="arrow">→</span>
                </button>
              </article>
            ))}
          </div>

          <div className="honesty-note">
            <span className="section-label">HONESTY PRINCIPLE</span>
            <h3>탐지 정확도로 등급을 나누지 않습니다.</h3>
            <p>세 플랜의 차이는 검증 루프 접근권과 배포 형태뿐입니다. 여울의 리포트는 안전 보증서가 아니라, 검사 범위·DB 버전·기준일·증거 유형을 명시한 성적서입니다.</p>
          </div>
        </div>
      </section>

      <section className="block pricing-compare-section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">COMPARE</span>
            <h2>필요한 운영 방식으로 선택하세요.</h2>
            <p>모바일에서는 표를 좌우로 움직여 확인할 수 있습니다.</p>
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

      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="section-label">FAQ</span>
            <h2>요금제에서 자주 묻는 내용.</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>무료 플랜과 프로 플랜의 탐지 성능이 다른가요?</summary>
              <p>아닙니다. 모든 플랜은 동일한 탐지 엔진과 형태 변형 공격 방식을 사용합니다. 차이는 재검증 횟수, 인증서, 이력 관리 등 운영 기능입니다.</p>
            </details>
            <details>
              <summary>무료 플랜에서도 Exploit PoC와 개선 방안을 받을 수 있나요?</summary>
              <p>네. 무료 플랜에도 전체 탐지, 형태 변형, Exploit PoC 리포트와 remediation 개선 방안이 포함됩니다.</p>
            </details>
            <details>
              <summary>프로 플랜의 재검증은 횟수 제한이 있나요?</summary>
              <p>프로 플랜은 쿨다운 없이 재검증할 수 있으며, 재검증 이력을 관리할 수 있습니다.</p>
            </details>
            <details>
              <summary>온프레미스 배포가 필요한 경우 어떤 플랜을 선택하나요?</summary>
              <p>여러 에이전트 자산을 관리하거나 내부망 온프레미스 배포, 전용 지원, 규제 감사 대응 리포트가 필요하면 프랜차이즈 플랜으로 상담합니다.</p>
            </details>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={() => goContact("여울")} />
    </div>
  );
}

window.PricingPage = PricingPage;
