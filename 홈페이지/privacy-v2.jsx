/* ---------------- Privacy Policy Page ---------------- */
function PrivacyPage() {
  return (
    <main className="privacy-page">
      <div className="container">
        <div className="privacy-header">
          <span className="label">LEGAL</span>
          <h1>개인정보처리방침</h1>
          <p className="privacy-meta">시행일: 2026년 5월 24일</p>
        </div>

        <div className="privacy-body">

          <section className="privacy-section">
            <p>
              새결(Saegyeol, 이하 "회사")은 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제1조 수집하는 개인정보 항목 및 수집 방법</h2>
            <p>회사는 다음의 개인정보를 수집합니다.</p>
            <ul>
              <li><strong>문의 접수 시:</strong> 이름, 이메일 주소, 문의 내용</li>
              <li><strong>채용 지원 시:</strong> 이름, 이메일 주소, 포트폴리오 파일</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              <strong>수집 방법:</strong> 홈페이지 내 문의 폼 및 채용 지원 폼을 통한 직접 입력
            </p>
          </section>

          <section className="privacy-section">
            <h2>제2조 개인정보의 수집 및 이용 목적</h2>
            <ul>
              <li>고객 문의 응대 및 CS 처리</li>
              <li>채용 지원자 전형 진행 및 결과 안내</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제3조 개인정보의 보유 및 이용 기간</h2>
            <p>
              수집된 개인정보는 수집 목적 달성 후 3년간 보유 후 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제4조 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령의 규정에 의한 경우는 예외로 합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제5조 개인정보 처리 위탁</h2>
            <p>
              회사는 현재 개인정보 처리를 외부에 위탁하지 않습니다. 향후 위탁이 발생할 경우 본 방침을 통해 공개합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제6조 정보주체의 권리·의무 및 행사 방법</h2>
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul>
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이 처리합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제7조 개인정보의 파기</h2>
            <p>보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 복구 불가능한 방법으로 즉시 파기합니다.</p>
            <ul>
              <li><strong>전자적 파일:</strong> 복구 불가능한 방식으로 영구 삭제</li>
              <li><strong>서면 자료:</strong> 분쇄 또는 소각</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제8조 개인정보 보호책임자</h2>
            <div className="privacy-contact-box">
              <div className="row"><span className="k">성명</span><span>황지후</span></div>
              <div className="row"><span className="k">직책</span><span>대표</span></div>
              <div className="row"><span className="k">이메일</span><span>watson@saegyeol.ai.kr</span></div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>제9조 개인정보처리방침의 변경</h2>
            <p>
              본 방침은 법령·정책 변경 또는 회사 내부 방침에 따라 변경될 수 있으며, 변경 시 홈페이지를 통해 공지합니다.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
