const VomIcon = {
  gesture: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V7a2 2 0 0 0-4 0v4" />
      <path d="M14 9V5a2 2 0 0 0-4 0v6" />
      <path d="M10 11V4a2 2 0 0 0-4 0v12a6 6 0 0 0 12 0v-5a2 2 0 0 0-4 0" />
    </svg>
  ),
  tts: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 4.5a10 10 0 0 1 0 15" />
    </svg>
  ),
  wave: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h-2" />
    </svg>
  ),
};

function VomPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <div data-screen-label="VOM · 봄">
      <section className="page-hero">
        <div className="hero-bg" />
        <div className="container" style={{ position: "relative" }}>
          <div style={{ marginBottom: 16 }}><StatusBadge status="dev" /></div>
          <span className="section-label">PRODUCT · VOM (봄)</span>
          <h1>시각장애인을 위한<br />AI 기반 키오스크<br />접근성 솔루션.</h1>
          <p>VOM(봄)은 하드웨어 교체 없이 소프트웨어만으로 무인 키오스크에 접근성을 더하는 B2B SaaS 오버레이 솔루션입니다. 스트로크 제스처 기반 화면 탐색과 실시간 TTS 음성 안내를 제공합니다.</p>
          <div className="hero-cta" style={{ marginTop: 36 }}>
            <button className="btn btn-accent" onClick={goContact}>사전 문의하기 <span className="arrow">→</span></button>
            <a className="btn btn-ghost" href="#features" onClick={(e) => { e.preventDefault(); document.getElementById("vom-features")?.scrollIntoView({ behavior: "smooth" }); }}>
              기능 살펴보기 <span className="arrow">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section className="block" id="vom-features">
        <div className="container">
          <div className="section-head">
            <span className="section-label">CORE CAPABILITIES · 03</span>
            <h2>핵심 기능 세 가지.</h2>
            <p>전맹 시각장애인이 무인 키오스크를 독립적으로 이용할 수 있도록 설계된 세 가지 기술입니다.</p>
          </div>
          <div className="cards">
            <article className="card">
              <span className="num">01</span>
              <div className="ico"><VomIcon.gesture /></div>
              <h3>스트로크 제스처 내비게이션</h3>
              <p>전맹 시각장애인을 위한 방향 제스처 기반 화면 탐색. 스와이프와 탭 제스처만으로 모든 키오스크 UI를 독립적으로 탐색합니다.</p>
            </article>
            <article className="card">
              <span className="num">02</span>
              <div className="ico"><VomIcon.tts /></div>
              <h3>실시간 TTS 음성 안내</h3>
              <p>화면 내용을 실시간으로 음성 변환하여 안내합니다. 메뉴 선택, 가격 확인, 결제 안내까지 모든 정보를 명확한 음성으로 전달합니다.</p>
            </article>
            <article className="card">
              <span className="num">03</span>
              <div className="ico"><VomIcon.wave /></div>
              <h3>소프트웨어 기반 노이즈 필터링</h3>
              <p>하드웨어 교체 없이 매장 소음을 줄이고 음성 명료도를 높이는 오디오 처리 기술. 시끄러운 매장 환경에서도 명확한 음성 안내를 보장합니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="block" id="vom-how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="section-label">HOW IT WORKS · 03 STEPS</span>
            <h2>키오스크에 연결만 하면<br />바로 접근성이 추가됩니다.</h2>
            <p>기존 키오스크 하드웨어를 교체하지 않아도 됩니다. 소프트웨어 오버레이 설치만으로 즉시 접근성 기능이 활성화됩니다.</p>
          </div>
          <div className="flow">
            <div className="flow-step">
              <span className="step-num">STEP 01</span>
              <h4>키오스크 화면 연동</h4>
              <p>기존 키오스크 시스템에 VOM 소프트웨어를 설치합니다. 별도 하드웨어 없이 기존 기기에 그대로 연동이 완료됩니다.</p>
              <div className="terminal">install vom-overlay · connect</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 02</span>
              <h4>AI 오버레이 적용</h4>
              <p>AI가 키오스크 화면 레이아웃을 분석하고 TTS 텍스트를 자동 추출합니다. 소음 환경에 맞게 오디오 필터도 자동 최적화됩니다.</p>
              <div className="terminal">analyze ui · apply tts · filter noise</div>
            </div>
            <div className="flow-step">
              <span className="step-num">STEP 03</span>
              <h4>제스처·음성 인터랙션</h4>
              <p>사용자는 스트로크 제스처로 화면을 탐색하고, TTS 음성 안내를 들으며 독립적으로 주문과 결제를 완료합니다.</p>
              <div className="terminal">gesture nav · tts guide · complete</div>
            </div>
          </div>
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 20px", borderRadius: 6,
              fontSize: 13, fontWeight: 500,
              background: "rgba(63,255,219,0.06)",
              border: "1px solid rgba(63,255,219,0.2)",
              color: "#3FFFDB",
            }}>✦ 하드웨어 교체 없는 SaaS 구독형 모델</span>
            <button className="btn btn-accent" onClick={goContact}>사전 문의하기 <span className="arrow">→</span></button>
          </div>
        </div>
      </section>

      <ClosingCTA onContact={goContact} />
    </div>
  );
}

window.VomPage = VomPage;
