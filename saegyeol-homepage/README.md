# 새결 공식 홈페이지

[saegyeol.ai.kr](https://www.saegyeol.ai.kr) 에 배포되는 정적 사이트와 문의 API.

번들러 없이 React 18 UMD를 CDN에서 받아 쓰고, 라우팅은 해시 기반 자체 구현이다.

---

## ⚠️ public/app.js 를 직접 수정하지 마세요

**`src/*.jsx` 를 고친 뒤 반드시 `npm run build` 를 돌려야 합니다.**

```bash
npm install     # 최초 1회
npm run build   # src/*.jsx  ->  public/app.js
```

`public/app.js` 는 `build.js` 가 생성하는 산출물입니다. 직접 고치면 다음 빌드에서
그대로 덮어써지고, 그 사이 배포된 내용과 `src/` 가 어긋납니다.

예전에는 이 파일을 손으로 편집했고, 괄호 하나가 어긋나 사이트가 백지가 된 적이
있습니다(`fcb238b Fix unbalanced parens in app.js causing blank page`). 그래서
JSX 변환만 esbuild로 자동화했습니다.

### 빌드 구조

번들링이 아니라 **파일별 JSX 변환 후 이어붙이기**입니다. 각 파일은 ES 모듈이 아니라
전역 스크립트이며 `window.X` 할당으로 서로를 참조합니다.

- `import` / `export` 를 쓰면 빌드가 막습니다.
- 파일 순서 = 의존 순서입니다. 새 페이지를 추가하면 `build.js` 의 `FILES` 배열에
  올바른 위치로 넣어야 합니다. `src/components/chrome.jsx` 는 React 구조분해와
  공통 상수·컴포넌트를 선언하므로 항상 맨 앞입니다.
- 출력은 결정적입니다. 같은 입력이면 같은 바이트가 나옵니다.

---

## 배포 (Vercel)

`vercel.json` 에 `buildCommand` 가 없어서 Vercel 자동 감지로 동작합니다.

- **Build Command**: `package.json` 에 `build` 스크립트가 있으므로 `npm run build` 가 실행됩니다.
- **Output Directory**: `public/`
- `api/*.js` 는 서버리스 함수로 자동 인식됩니다.
- `server.js` 는 **로컬 개발 전용**이며 `.vercelignore` 로 제외됩니다.

빌드 산출물인 `public/app.js` 는 저장소에도 커밋합니다. Vercel에서 빌드가 돌아도
같은 결과가 나오므로, 빌드가 돌든 안 돌든 배포 내용은 같습니다.

> ⚠️ `.vercelignore` 에 `src/` 를 추가하지 마세요. 빌드 입력이라 제외하면
> `npm run build` 가 ENOENT로 실패해 **배포 자체가 깨집니다.** 서빙되는 것은
> Output Directory인 `public/` 뿐이라 `src/` 가 업로드되어도 외부에 노출되지 않습니다.

---

## 로컬 실행

```bash
npm install
cp .env.example .env    # SMTP_PASS 등 채우기
npm run dev             # 빌드 후 server.js 를 --watch 로 실행
```

`.env` 없이도 서버는 뜨고 화면은 정상 동작합니다. 다만 문의 폼 전송은 SMTP 단계에서
500으로 끝납니다. Origin 검사·rate limit·입력 검증까지는 모두 통과한 것이므로
**이 500은 정상 신호**입니다.

서버를 다시 띄울 때는 이전 프로세스를 먼저 종료하세요. 살아 있으면 새 프로세스만
`EADDRINUSE` 로 죽고 옛 것이 계속 응답합니다.

```bash
netstat -ano | grep ":3000.*LISTENING"
```

---

## 건드릴 때 주의할 것

### 보안

- **CSRF는 토큰이 아니라 Origin/Referer 허용목록 대조**입니다(`api/_utils.js` 의
  `checkOrigin`). 클라이언트가 보낼 토큰이 없습니다. 폼 `fetch` 에 커스텀 헤더를
  추가하면 preflight가 생기니 `FormData` 를 그대로 보내세요.
- rate limit은 Upstash Redis 기반(10분 5회, fail-open)입니다. 환경변수가 없으면
  비활성화되니 운영 배포 전 `UPSTASH_REDIS_REST_URL` / `_TOKEN` 을 확인하세요.
- 보안 헤더는 **운영에서는 `vercel.json`, 로컬에서는 `server.js` 의 helmet** 이
  각각 적용하며 값이 서로 다릅니다. 한쪽만 고치면 환경 간 차이가 생깁니다.
- 업로드 한도 4.5MB는 Vercel 서버리스 request body 한도입니다. 세 곳
  (`src/components/chrome.jsx` 의 `MAX_UPLOAD_BYTES`, `api/_utils.js` 의 `FILE_LIMIT`,
  `server.js` 의 `FILE_LIMIT`)을 반드시 같이 유지하세요.

### CSS

`public/styles.css` 는 **1,287줄 부근부터 v2 오버라이드 레이어**가 시작됩니다.
`:root` 토큰이 재정의되며, 실제 accent는 파일 상단의 민트(`#3FFFDB`)가 아니라
**파랑 `#1769e0`**(다크 `#5b8fff`)입니다. 새 규칙은 파일 끝에 추가하세요.

웹폰트를 추가하려면 CSP `font-src` 를 **`public/index.html` 의 meta와 `vercel.json`
양쪽** 에서 함께 고쳐야 합니다. 한쪽만 고치면 콘솔 에러만 남고 폰트는 로드되지 않습니다.

### 풀페이지 스크롤

`html[data-snap="on"]` 일 때만 동작합니다(`src/components/chrome.jsx` 의 `SNAP_ROUTES`).
개인정보처리방침·이용약관은 제외되어 있습니다. 모바일 해제 기준은 CSS의
`@media (max-width: 800px)` 와 JS의 `SNAP_MIN_WIDTH` 가 **같이 움직여야** 합니다.
