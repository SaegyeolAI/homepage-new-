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
              새결(Saegyeol, 이하 "회사")은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제1조 개인정보의 처리 목적</h2>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul>
              <li>서비스 도입 문의 접수 및 CS 응대</li>
              <li>채용 지원자 전형 진행 및 결과 안내</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제2조 처리하는 개인정보의 항목</h2>
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <table className="privacy-table">
              <thead>
                <tr>
                  <th>수집 경로</th>
                  <th>수집 항목</th>
                  <th>수집 방법</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>문의 폼</td>
                  <td>이름, 이메일 주소, 문의 내용</td>
                  <td>홈페이지 내 직접 입력</td>
                </tr>
                <tr>
                  <td>채용 지원 폼</td>
                  <td>이름, 이메일 주소, 포트폴리오 파일</td>
                  <td>홈페이지 내 직접 입력 및 파일 업로드</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 12 }}>회사는 서비스 제공에 필요한 최소한의 개인정보만 수집합니다.</p>
          </section>

          <section className="privacy-section">
            <h2>제3조 개인정보의 처리 및 보유 기간</h2>
            <p>회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul>
              <li><strong>문의 접수 및 CS 응대 목적:</strong> 수집일로부터 3년</li>
              <li><strong>채용 지원 목적:</strong> 채용 전형 종료 후 3년</li>
            </ul>
            <p style={{ marginTop: 12 }}>단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          </section>

          <section className="privacy-section">
            <h2>제4조 개인정보의 파기 절차 및 방법</h2>
            <p>회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.</p>
            <ul>
              <li><strong>전자적 파일 형태:</strong> 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
              <li><strong>서면, 출력물 등:</strong> 분쇄 또는 소각</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제5조 개인정보의 제3자 제공</h2>
            <p>
              회사는 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 현재 제3자 제공은 없습니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제6조 개인정보 처리업무의 위탁</h2>
            <p>
              회사는 현재 개인정보 처리업무를 외부에 위탁하지 않습니다. 향후 위탁이 발생하는 경우 위탁받는 자, 위탁하는 업무의 내용을 본 방침을 통해 사전 공개합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제7조 개인정보의 안전성 확보조치</h2>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul>
              <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 개인정보 취급 직원 최소화 및 교육</li>
              <li><strong>기술적 조치:</strong> 개인정보처리시스템 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화</li>
              <li><strong>물리적 조치:</strong> 자료보관실 접근통제</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제8조 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
            <p>회사는 서비스 이용 과정에서 쿠키(Cookie)를 사용할 수 있습니다. 쿠키는 웹사이트 운영에 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며 이용자 컴퓨터의 하드디스크에 저장됩니다.</p>
            <ul>
              <li><strong>사용 목적:</strong> 이용자의 접속 빈도, 방문 시간 분석 및 서비스 개선</li>
              <li><strong>거부 방법:</strong> 웹 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</li>
            </ul>
            <p style={{ marginTop: 12 }}>※ 구글 크롬 기준: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</p>
          </section>

          <section className="privacy-section">
            <h2>제9조 정보주체와 법정대리인의 권리·의무 및 행사방법</h2>
            <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul>
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리정지 요청</li>
              <li>개인정보 처리에 대한 동의 철회</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이 처리합니다. 회사는 정보주체의 권리에 따른 열람, 정정·삭제, 처리정지 요청 시 열람 등을 제한하거나 거절할 수 있는 경우에는 그 사유를 통보합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제10조 자동화된 결정에 관한 사항</h2>
            <p>
              회사의 K-AgentSec 서비스는 AI 기반 자동화된 분석을 활용합니다. 다만 본 홈페이지를 통해 수집되는 문의·채용 지원 정보에 대해서는 자동화된 결정을 적용하지 않으며, 담당자가 직접 검토하여 응대합니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제11조 개인정보 보호책임자</h2>
            <div className="privacy-contact-box">
              <div className="row"><span className="k">성명</span><span>황지후</span></div>
              <div className="row"><span className="k">직책</span><span>대표</span></div>
              <div className="row"><span className="k">이메일</span><span>watson@saegyeol.ai.kr</span></div>
            </div>
            <p style={{ marginTop: 12 }}>
              정보주체는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
            </p>
          </section>

          <section className="privacy-section">
            <h2>제12조 정보주체의 권익침해에 대한 구제방법</h2>
            <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
            <ul>
              <li><strong>개인정보침해신고센터:</strong> (국번없이) 118 / privacy.kisa.or.kr</li>
              <li><strong>개인정보분쟁조정위원회:</strong> 1833-6972 / www.kopico.go.kr</li>
              <li><strong>대검찰청 사이버범죄수사단:</strong> 02-3480-3573 / www.spo.go.kr</li>
              <li><strong>경찰청 사이버안전국:</strong> (국번없이) 182 / cyberbureau.police.go.kr</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>제13조 개인정보 처리방침의 변경</h2>
            <p>
              본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항 시행 7일 전부터 홈페이지 공지사항을 통하여 고지합니다.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
