function CloversPage({ setRoute }) {
  const goContact = () => {
    setRoute("home");
    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <div data-screen-label="클로버스 (Clovers)">
      <section className="page-hero" style={{ minHeight: "100svh" }}>
        <div className="hero-bg" />
        <div className="container" style={{ position: "relative" }}>
          <div style={{ marginBottom: 16 }}><StatusBadge status="coming_soon" /></div>
          <span className="section-label">PRODUCT · 클로버스 (Clovers)</span>
          <h1>고등학생을 위한<br />온·오프라인 통합<br />소셜 네트워크.</h1>
          <p style={{ maxWidth: 520 }}>
            학생들이 온라인과 오프라인 정보를 한 곳에서 통합적으로 관리하고 공유할 수 있는 플랫폼입니다.
            학교 공지, 동아리 활동, 친구들과의 일상까지 — 파편화된 정보를 하나의 공간에서 다룹니다.
            현재 정식 출시를 준비 중입니다.
          </p>
          <div style={{ marginTop: 48 }}>
            <p style={{ marginBottom: 12, fontSize: 14, color: "var(--text-2)", margin: "0 0 16px" }}>
              출시 소식을 받고 싶다면
            </p>
            <button className="btn btn-accent" onClick={goContact}>
              출시 알림 신청하기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

window.CloversPage = CloversPage;
