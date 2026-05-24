/* ---------------- Terms of Service Page ---------------- */
function TermsPage() {
  return (
    <main className="privacy-page">
      <div className="container">
        <div className="privacy-header">
          <span className="label">LEGAL</span>
          <h1>이용약관</h1>
          <p className="privacy-meta">시행일: 2026년 5월 24일</p>
        </div>

        <div className="privacy-body">

          <section className="privacy-section">
            <p>
              본 약관은 새결(Saegyeol, 이하 "회사")이 운영하는 웹사이트(이하 "사이트")를 이용함에 있어 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제1조 용어 정의</h2>
            <ul>
              <li><strong>회사:</strong> 새결(Saegyeol)</li>
              <li><strong>사이트:</strong> 회사가 운영하는 홈페이지</li>
              <li><strong>이용자:</strong> 사이트에 접속하여 본 약관에 따라 서비스를 이용하는 모든 자</li>
              <li><strong>서비스:</strong> 회사가 사이트를 통해 제공하는 제품 소개, 문의 접수, 채용 지원 등 일체의 기능</li>
              <li><strong>문의자:</strong> 사이트 내 문의 폼을 통해 서비스 도입 문의를 제출한 자</li>
              <li><strong>지원자:</strong> 사이트 내 채용 지원 폼을 통해 지원서를 제출한 자</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제2조 약관의 효력 및 변경</h2>
            <ul>
              <li>본 약관은 사이트에 게시함으로써 효력이 발생합니다.</li>
              <li>이용자가 사이트를 이용함으로써 본 약관에 동의한 것으로 간주합니다.</li>
              <li>회사는 「약관의 규제에 관한 법률」 등 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
              <li>약관 변경 시 시행 7일 전 사이트 공지사항을 통해 고지하며, 변경 후 계속 이용 시 변경된 약관에 동의한 것으로 봅니다.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제3조 서비스 제공</h2>
            <p>회사는 다음의 서비스를 제공합니다.</p>
            <ul>
              <li>K-AgentSec 제품 소개 및 관련 정보 제공</li>
              <li>서비스 도입 문의 접수 및 CS 응대</li>
              <li>채용 지원 접수 및 전형 진행</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·장애·천재지변 등의 사유로 일시 중단될 수 있으며, 이 경우 사전 또는 사후에 공지합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제4조 이용자의 의무</h2>
            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul>
              <li>문의 폼 또는 채용 지원 폼에 허위 정보를 입력하는 행위</li>
              <li>회사 또는 제3자의 지식재산권·명예·신용을 침해하는 행위</li>
              <li>사이트의 정상적인 운영을 방해하거나 서버에 과부하를 주는 행위</li>
              <li>악성코드·바이러스를 유포하거나 해킹을 시도하는 행위</li>
              <li>기타 관련 법령 또는 공공질서를 위반하는 행위</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제5조 회사의 의무</h2>
            <ul>
              <li>회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
              <li>회사는 이용자의 개인정보를 개인정보처리방침에 따라 보호합니다.</li>
              <li>회사는 이용자로부터 제기된 의견이나 불만이 정당하다고 인정될 경우 이를 처리하며, 처리 결과를 이메일 등을 통해 안내합니다.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제6조 지식재산권</h2>
            <ul>
              <li>사이트에 게시된 모든 콘텐츠(텍스트, 이미지, 로고, 디자인, 코드 등)의 지식재산권은 회사에 귀속됩니다.</li>
              <li>이용자는 회사의 사전 서면 동의 없이 이를 복제·배포·수정·전송하거나 상업적으로 이용할 수 없습니다.</li>
              <li>이용자가 사이트에 제출한 문의 내용 및 포트폴리오의 저작권은 해당 이용자에게 귀속됩니다. 다만 회사는 CS 응대 및 채용 전형 목적으로 이를 열람·활용할 수 있습니다.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제7조 면책 조항</h2>
            <p>회사는 다음의 경우 서비스 제공에 관한 책임을 지지 않습니다.</p>
            <ul>
              <li>천재지변, 전쟁, 해킹 등 불가항력적 사유로 인한 서비스 중단</li>
              <li>이용자의 귀책사유로 인한 서비스 이용 장애</li>
              <li>이용자가 사이트를 통해 취득한 정보를 기반으로 한 투자·계약 등의 결과</li>
            </ul>
            <ul style={{ marginTop: 12 }}>
              <li>회사는 이용자가 사이트에 게시한 정보의 정확성에 대해 책임을 지지 않습니다.</li>
              <li>회사는 이용자 간 또는 이용자와 제3자 간에 사이트를 매개로 발생한 분쟁에 대해 개입하거나 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제8조 준거법 및 관할법원</h2>
            <ul>
              <li>본 약관은 대한민국 법률에 따라 해석됩니다.</li>
              <li>서비스 이용과 관련하여 분쟁이 발생한 경우 부산지방법원 동부지원을 전속 관할법원으로 합니다.</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}
