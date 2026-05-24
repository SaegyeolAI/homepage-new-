function HomePage({ setRoute }) {
  return (
    <div data-screen-label="01 Home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">SAEGYEOL · AI AGENT SECURITY</span>
            <h1>
              한국어 AI 에이전트를<br />
              <span className="strike">공격자의 관점</span>으로<br />
              먼저 점검합니다.
            </h1>
            <p className="lede">
              새결은 한국 기업의 AI 에이전트 시스템(LLM · MCP 서버 · 사용자 플로우)을
              한국어 위협 관점에서 자동 침투 테스트하고, 익스플로잇 PoC와
              한국형 컴플라이언스 리포트를 제공합니다.
            </p>
            <div className="hero-cta">
              <button className="btn btn-accent" onClick={() => { setRoute("product"); window.scrollTo({ top: 0 }); }}>
                K-AgentSec 알아보기 <span className="arrow">→</span>
              </button>
              <a className="btn btn-ghost" href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}>
                도입 문의 <span className="arrow">↓</span>
              </a>
            </div>
          </div>

          <div className="scope-card" aria-hidden="true">
            <div className="scope-head">
              <span className="scope-head-title">// THREAT_SCOPE.LIVE</span>
              <span className="scope-dot" />
            </div>
            <div className="scope-row"><span className="k">target</span><span className="v">/agent/v3.mcp.kr</span></div>
            <div className="scope-row"><span className="k">language</span><span className="v">ko_KR</span></div>
            <div className="scope-row"><span className="k">prompts_run</span><span className="v">12,840</span></div>
            <div className="scope-row"><span className="k">attack_vectors</span><span className="v">217</span></div>
            <div className="scope-row"><span className="k">PII_leaks</span><span className="v ok">0 ← blocked</span></div>
            <div className="scope-row"><span className="k">jailbreaks</span><span className="v">3 → PoC</span></div>
            <div className="scope-row"><span className="k">shadow_agents</span><span className="v">7 detected</span></div>
            <div className="scope-row"><span className="k">compliance</span><span className="v ok">ISMS-P · K-ISA</span></div>
            <div className="scope-row" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
              <span className="k">status</span><span className="v ok">▮▮▮▮▮▮▮▮▯▯ 84%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shortcut → Team */}
      <section className="block">
        <div className="container">
          <div className="shortcut" role="button" tabIndex={0}
            onClick={() => { setRoute("team"); window.scrollTo({ top: 0 }); }}
            onKeyDown={(e) => { if (e.key === "Enter") { setRoute("team"); window.scrollTo({ top: 0 }); } }}>
            <div>
              <span className="eyebrow">TEAM · 03</span>
              <h3 style={{ marginTop: 12 }}>한국 AI 보안을 가장 가까이서 다뤄온 사람들.</h3>
              <p>오펜시브 시큐리티, LLM 평가, 한국형 컴플라이언스. 세 영역에서 실전 경험을 쌓은 팀을 만나보세요.</p>
              <div className="avatar-stack" style={{ marginTop: 18 }}>
                <span className="av">JM</span>
                <span className="av">HS</span>
                <span className="av">YK</span>
                <span className="av">DJ</span>
                <span className="av" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>+5</span>
              </div>
            </div>
            <div className="shortcut-arrow">↗</div>
          </div>
        </div>
      </section>

      {/* Inline contact form */}
      <section className="block" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="info">
              <span className="eyebrow">CONTACT · INLINE</span>
              <h2>새결 팀에 직접<br />문의를 보내보세요.</h2>
              <p style={{ marginTop: 18, color: "var(--text-2)" }}>
                우리와 함께 하고 싶으시거나, K-AgentSec PoC가 필요하다면
                아래 양식으로 직접 문의해 주세요. 24시간 내 회신드립니다.
              </p>
              <div className="contact-meta">
                <div className="row"><span className="k">EMAIL</span><span className="mono">customerservice@saegyeol.ai.kr</span></div>
                <div className="row"><span className="k">RESPONSE</span><span className="mono">24시간 이내 (연중무휴)</span></div>
                <div className="row"><span className="k">FOR</span><span>도입 문의 · PoC 요청 · 보안 자문 · 채용 문의</span></div>
                <div className="row"><span className="k">NDA</span><span>요청 시 체결 가능</span></div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

window.HomePage = HomePage;
