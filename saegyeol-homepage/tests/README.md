# tests

보안·화면 점검 스크립트. 브라우저가 필요한 것은 Playwright(Chromium)를 쓴다.

## ⚠️ 운영 사이트를 대상으로 돌리지 말 것

`saegyeol.ai.kr` / `www.saegyeol.ai.kr` 는 `tests/_target.js` 가 **거부한다.**
플래그를 줘도 막는다. 이유는 두 가지다.

- 요청 한도(10분 5회)를 실제로 소진한다
- 폼 테스트는 진짜 문의 메일함에 메일을 넣는다

점검이 필요하면 **프리뷰 배포 주소**를 쓰고, 원격은 `--allow-remote` 를 명시해야 한다.

```bash
node tests/ui/theme.js                                   # 로컬(기본)
node tests/ui/theme.js https://<preview>.vercel.app --allow-remote
```

실제 메일은 어느 경로로도 나가지 않는다. `tests/servers/_mock-smtp.js` 가
핸들러를 불러오기 **전에** `transporter.sendMail` 을 목으로 바꾸고,
`SMTP_PASS` 등 자격증명 환경변수를 지우고, 교체가 됐는지 확인한 뒤에야 서버를 띄운다.

## 실행

```bash
npm install
npx playwright install chromium     # 처음 한 번
npm test                            # 서버를 띄우고 전부 실행
npm test -- --only=security         # 일부만
```

서버를 직접 띄우고 하나씩 돌릴 수도 있다.

```bash
node tests/servers/static.js        # 3220  public/ 정적
node tests/servers/app.js           # 3210  server.js + 목 SMTP
node tests/servers/api-harness.js   # 4321  api/ 핸들러 직접 + 목 SMTP
```

## 무엇을 검사하는가

| 파일 | 내용 | 필요한 서버 |
|---|---|---|
| `security/forms.js` | 문의·채용 폼 공격. 오류 메시지에 스택·경로·라이브러리명·환경변수명이 새는지, 메일 헤더 주입(CRLF), 메일 HTML 안 스크립트 주입, 우리 도메인 사칭, 허니팟, Origin 검사(CSRF), 요청 한도와 버킷 분리, 첨부 11종(실행파일을 PDF로 신고·이름만 바꾼 zip 등), 업로드 임시 파일 잔존, 이메일 길이 상한 | 4321 |
| `security/frontend.js` | 서버 오류 문구가 DOM에 태그로 들어가는지, 해시 라우팅 주입, 새 창 링크 `rel`, 폼이 실제로 보내는 내용, `vercel.json` 보안 헤더 설정(읽기만) | 3220 |
| `security/nodemailer-exposure.js` | nodemailer 권고가 이 코드에 닿는 경로인지 확인하는 보조 스크립트. 단정이 아니라 측정값을 찍는다 | 4321 |
| `ui/theme.js` | 라이트 기본, 저장된 선택 유지, 토글, OS 설정(`prefers-color-scheme`)을 따르지 않음, localStorage 차단 환경 | 3210 |
| `ui/design-system.js` | `saegyeol_design.md` 9장 출고 전 체크리스트 — 한국어가 고정폭 서체에 들어갔는지, 전부 대문자 영문 라벨, 레드팀 레드가 화면당 1곳 이하, 본문 대비 4.5:1, 평면 카드 그림자 | 3220 |
| `ui/tooltips.js` | 용어 툴팁 — 홈·랜딩에는 없고 상세 페이지에만 2~3개, 호버·클릭·키보드·Esc, 카드 바깥으로 잘리지 않음, `aria-describedby`, 모바일 | 3220 |
| `ui/line-breaks.js` | 어절 중간 분리, 고아 어절, 한 줄 길이, 의미 단위(숫자+단위) 분리, 가로 넘침. 실제 렌더 좌표를 글자 단위로 잰다 | 3220 |
| `ui/contact-form.js` | 문의 폼이 `POST /api/contact` 로 전과 같이 전송되는지 | 3210 |
| `ui/section-fit.js` | 모든 섹션이 네 데스크톱 크기(1366×768 / 1440×900 / 1536×864 / 1920×1080)에서 한 화면에 들어가는지. 그보다 작은 창에서는 잘리지 않고 섹션 안에서 스크롤되는지 | 3220 |

## 공용

| 파일 | 역할 |
|---|---|
| `_target.js` | 대상 주소 결정. 운영 도메인 차단, 원격은 `--allow-remote` 필요 |
| `_fixtures.js` | 가짜 도메인·메일 주소와 가짜 파일. **바이너리를 저장소에 두지 않고 실행할 때 만든다.** `fakeExecutable()` 은 `MZ` + 0 바이트 6개뿐이라 실행되지 않는다(PE 헤더도 진입점도 없다). 서버 판별기가 앞 4바이트만 보므로 그 이상은 필요 없다 |
| `servers/_mock-smtp.js` | SMTP 목 교체. 자격증명 환경변수를 지우고, 교체 확인 후에만 통과 |
| `run.js` | `npm test` 러너 |

## 메모

- 테스트에 쓰는 도메인은 전부 `.test` / `.example` 이다(RFC 2606·6761이 비워 둔 TLD라 실존하지 않는다)
- `security/forms.js` 의 `x-forwarded-for` 는 로컬 하네스에서만 조작 가능하다. 운영에서는 Vercel이 이 헤더를 직접 덮어쓴다
- 섹션 높이·스크린샷용 보조 도구는 포함하지 않았다. 단정이 있는 것만 둔다
