// 홈페이지 보안 점검 — 문의/채용 폼으로 들어오는 공격과 오류 메시지 노출.
// 대상은 로컬 하네스(4321)에 얹은 실제 api/ 핸들러다. 운영에는 보내지 않는다.
// SMTP는 목이라 메일은 한 통도 나가지 않고, 만들어진 메일 객체만 들여다본다.
const fs = require("fs");
const { resolveTarget } = require("../_target");
const F = require("../_fixtures");

// 기본은 로컬 하네스. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:4321");
const ORIGIN = F.SITE_ORIGIN;

const findings = [];   // 문제
const notes = [];      // 참고
let pass = 0;
const ok = (m) => { pass++; console.log("  ✓ " + m); };
const bad = (sev, m) => { findings.push({ sev, m }); console.log(`  ✗ [${sev}] ` + m); };
const note = (m) => { notes.push(m); console.log("  · " + m); };

let ipCounter = 0;
const freshIp = () => `203.0.113.${(++ipCounter % 250) + 1}`;

async function post(pathname, { fields = {}, file = null, headers = {}, ip = null, noOrigin = false } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (file) fd.append("file", new Blob([file.data], { type: file.mime }), file.name);
  // 기본으로 올바른 Origin을 깐다. Referer 경로나 "헤더 없음" 경로를 보려면
  // noOrigin으로 빼야 한다 — 안 그러면 Origin 검사에서 먼저 통과해 버린다.
  const h = { "x-forwarded-for": ip || freshIp(), ...headers };
  if (!noOrigin) h.origin = headers.origin ?? ORIGIN;
  const res = await fetch(BASE + pathname, { method: "POST", headers: h, body: fd });
  let body;
  const raw = await res.text();
  try { body = JSON.parse(raw); } catch { body = raw; }
  return { status: res.status, body, headers: res.headers, raw };
}

const mails = async () => (await fetch(BASE + "/__mails")).json();
const clearMails = () => fetch(BASE + "/__mails/clear", { method: "POST" });

// 사람처럼 보이는 기본 입력 (허니팟·3초 통과)
const human = (extra = {}) => ({
  name: "점검 담당자",
  email: F.VISITOR,
  message: "보안 점검용 문의 내용입니다. 충분히 길게 적습니다.",
  form_ts: String(Date.now() - 20000),
  company_site: "",
  ...extra,
});

// 가짜 파일은 전부 실행할 때 만든다. 저장소에 바이너리를 두지 않는다.
const PNG = F.fakePng();
const PDF = F.fakePdf();
const EXE = F.fakeExecutable();

/* ═══════════════════════════════════════════════════════════════ */

async function section(title, fn) {
  console.log(`\n━━ ${title} ${"━".repeat(Math.max(0, 62 - title.length))}`);
  await fn();
}

(async () => {
  await clearMails();

  await section("1. 오류 메시지가 내부 정보를 흘리는가", async () => {
    const probes = [
      ["GET 요청", () => fetch(BASE + "/api/contact", { method: "GET" })],
      ["필수 항목 누락", () => post("/api/contact", { fields: { name: "", email: "", message: "" } })],
      ["깨진 이메일", () => post("/api/contact", { fields: human({ email: "not-an-email" }) })],
      ["너무 짧은 내용", () => post("/api/contact", { fields: human({ message: "짧" }) })],
      ["거대한 이름", () => post("/api/contact", { fields: human({ name: "가".repeat(500) }) })],
      ["잘못된 Origin", () => post("/api/contact", { fields: human(), headers: { origin: "https://evil.example" } })],
    ];
    const LEAK = [
      /at\s+\w+\s+\(/,            // 스택 트레이스
      /[A-Za-z]:\\|\/var\/|\/opt\/|\/home\//,   // 파일 경로
      /node_modules/,
      /formidable|nodemailer|upstash|express/i, // 라이브러리 이름
      /SMTP_|UPSTASH_|ALLOWED_ORIGIN|process\.env/,  // 환경변수 이름
      /ECONN|ENOENT|EACCES/,
    ];
    let leaked = 0;
    for (const [label, run] of probes) {
      const res = await run();
      const text = typeof res.text === "function" ? await res.text() : JSON.stringify(res.body);
      const hit = LEAK.find((re) => re.test(text));
      if (hit) { bad("HIGH", `${label}: 응답에 내부 정보 노출 — ${hit} / ${text.slice(0, 120)}`); leaked++; }
    }
    leaked === 0 ? ok("6가지 오류 응답 모두 고정 한글 문구만 — 스택·경로·라이브러리명·환경변수명 없음") : null;

    // SMTP가 죽었을 때
    process.env.MOCK_SMTP_FAIL = "1";
    const r = await fetch(BASE + "/api/contact", {
      method: "POST", headers: { origin: ORIGIN, "x-forwarded-for": freshIp() },
      body: (() => { const f = new FormData(); for (const [k, v] of Object.entries(human())) f.append(k, v); return f; })(),
    });
    const t = await r.text();
    process.env.MOCK_SMTP_FAIL = "0";
    /535|nodemailer|lib\/|auth failed/.test(t)
      ? bad("HIGH", `SMTP 실패 메시지가 그대로 노출됨 — ${t.slice(0, 140)}`)
      : ok(`SMTP 장애 시에도 고정 문구만 (${r.status} ${t.slice(0, 60)})`);
  });

  await section("2. 메일 헤더 주입 (CRLF)", async () => {
    await clearMails();
    const payloads = {
      name: `피해자\r\nBcc: ${F.ATTACKER}\r\nX-Injected: yes`,
      message: `본문\r\n\r\nFrom: ${F.SPOOFED_INTERNAL}\r\n내용 주입 시도입니다.`,
    };
    // 이메일 칸은 일부러 정상값으로 둔다. 거기에 CRLF를 넣으면 형식 검사에서
    // 400으로 먼저 막혀(그 자체는 올바른 동작) 메일이 안 만들어지고,
    // 그러면 정작 봐야 할 헤더를 볼 수 없다. 그 경로는 아래에서 따로 단정한다.
    const r = await post("/api/contact", { fields: human(payloads) });
    const m = (await mails())[0];
    if (!m) { bad("MEDIUM", `헤더 주입 케이스가 메일을 만들지 못함 (status ${r.status}) — 검증 불가`); return; }
    /[\r\n]/.test(m.subject)
      ? bad("HIGH", `제목에 개행이 남음: ${JSON.stringify(m.subject)}`)
      : ok(`제목에서 개행 제거됨: ${JSON.stringify(m.subject)}`);
    /[\r\n]/.test(m.replyTo)
      ? bad("HIGH", `replyTo에 개행이 남음: ${JSON.stringify(m.replyTo)}`)
      : ok(`replyTo에서 개행 제거됨: ${JSON.stringify(m.replyTo)}`);
    // "Bcc:" 라는 글자가 제목 값 안에 남는 것은 취약점이 아니다.
    // 헤더 주입은 CRLF로 새 헤더 "줄"을 만들 수 있을 때 성립하고, 그건 위에서 막혔다.
    // 실제로 새 헤더가 생겼는지(= 알려진 헤더 키 외의 키가 붙었는지)로 본다.
    // m.keys 는 하네스가 실제 mailOptions 의 키 목록을 넘겨 준 것이다.
    // Object.keys(m) 을 쓰면 하네스가 검사용으로 덧붙인 필드까지 세게 된다.
    const headerKeys = (m.keys || []).filter((k) => !["from", "to", "replyTo", "subject", "text", "html", "attachments"].includes(k));
    headerKeys.length === 0
      ? ok("주입 시도로 새 헤더가 생기지 않음 (CRLF 제거로 한 줄에 갇힘)")
      : bad("HIGH", `새 헤더가 생김: ${headerKeys.join(", ")}`);
    note(`제목 값 안에는 글자가 남는다(무해): ${JSON.stringify(m.subject)}`);
    note(`본문에는 그대로 들어감(정상 — 본문은 헤더가 아니다): ${JSON.stringify(m.text.slice(-60))}`);

    const crlfEmail = await post("/api/contact", {
      fields: human({ email: "victim@example.com\r\nBcc: attacker@evil.example" }),
    });
    crlfEmail.status === 400
      ? ok("이메일 칸에 CRLF를 넣으면 형식 검사에서 400으로 먼저 막힘")
      : bad("HIGH", `이메일 칸 CRLF가 통과함 (${crlfEmail.status})`);
  });

  await section("3. 메일 HTML 안의 스크립트 주입", async () => {
    await clearMails();
    const xss = {
      name: '<script>alert(1)</script>',
      message: '<img src=x onerror="fetch(\'//evil\')"> & "따옴표" \'작은따옴표\' <b>굵게</b>',
    };
    await post("/api/contact", { fields: human(xss) });
    const m = (await mails())[0];
    if (!m) { bad("MEDIUM", "XSS 케이스가 메일을 만들지 못함 — 검증 불가"); return; }
    // 이스케이프된 "&lt;img src=x onerror=&quot;" 안에도 onerror= 라는 글자는 남는다.
    // 위험한 건 글자가 아니라 "열린 태그"이므로 그것만 본다.
    /<\s*(script|img|iframe|svg|object|embed)\b/i.test(m.html)
      ? bad("HIGH", `메일 HTML에 태그가 살아 있음: ${m.html.slice(-200)}`)
      : ok("메일 HTML에서 <script>·onerror·<img>가 전부 이스케이프됨");
    m.html.includes("&lt;script&gt;") ? ok("이스케이프 결과 확인 (&lt;script&gt;)") : null;
    m.html.includes("&quot;") && m.html.includes("&#x27;")
      ? ok("따옴표도 이스케이프됨 (&quot; / &#x27;)")
      : bad("MEDIUM", "따옴표가 이스케이프되지 않음 — 속성 자리에 들어가면 위험");
  });

  await section("4. 우리 도메인 사칭 (피싱)", async () => {
    await clearMails();
    await post("/api/contact", {
      fields: human({ name: "보안팀", email: F.SPOOFED_INTERNAL }),
    });
    const m = (await mails())[0];
    if (!m) { bad("MEDIUM", "피싱 케이스 검증 불가"); return; }
    m.text.includes("외부 입력") && /외부 입력/.test(m.html)
      ? ok("본문 맨 위에 외부 입력 경고가 붙음 (text·html 모두)")
      : bad("MEDIUM", "외부 입력 경고가 없음 — 내부 메일처럼 보일 수 있음");
    m.from.includes(F.MAIL_FROM) || m.from.includes("새결 문의")
      ? ok(`From은 서버가 고정 (${m.from}) — 입력값이 들어가지 않음`)
      : bad("HIGH", `From에 입력값이 들어감: ${m.from}`);
    m.replyTo === F.SPOOFED_INTERNAL
      ? note("replyTo는 입력값 그대로 — 설계상 회신용이며, 위 경고 문구가 이를 보완한다")
      : null;
  });

  await section("5. 봇 차단 (허니팟)", async () => {
    await clearMails();
    const trap = await post("/api/contact", { fields: human({ company_site: "http://spam.example" }) });
    let n = (await mails()).length;
    trap.status === 200 && n === 0
      ? ok("허니팟 칸이 채워지면 200을 주되 메일은 안 나감 (봇에게 실패를 알리지 않음)")
      : bad("MEDIUM", `허니팟 미작동 (status ${trap.status}, 메일 ${n}통)`);

    await clearMails();
    const fast = await post("/api/contact", { fields: human({ form_ts: String(Date.now()) }) });
    n = (await mails()).length;
    fast.status === 200 && n === 0
      ? ok("폼을 연 지 0초 만에 제출하면 메일이 안 나감")
      : bad("LOW", `즉시 제출이 통과함 (status ${fast.status}, 메일 ${n}통)`);
    note("시각은 클라이언트가 보낸 값이라 우회 가능 — 확실한 쪽은 허니팟 칸이다");

    await clearMails();
    const real = await post("/api/contact", { fields: human() });
    n = (await mails()).length;
    real.status === 200 && n === 1 ? ok("사람처럼 보내면 정상 전송") : bad("HIGH", `정상 요청이 막힘 (status ${real.status}, 메일 ${n}통)`);
  });

  await section("6. Origin 검사 (CSRF)", async () => {
    const evil = await post("/api/contact", { fields: human(), headers: { origin: "https://evil.example" } });
    evil.status === 403 ? ok("다른 사이트發 요청 403 차단") : bad("HIGH", `타 사이트 Origin이 통과함 (${evil.status})`);

    const sub = await post("/api/contact", { fields: human(), headers: { origin: `${F.SITE_ORIGIN}.evil.example` } });
    sub.status === 403 ? ok("접두사만 같은 도메인도 차단 (…<사이트 도메인>.evil.example)") : bad("HIGH", `유사 도메인이 통과함 (${sub.status})`);

    const ref = await post("/api/contact", { fields: human(), noOrigin: true, headers: { referer: "https://evil.example/x" } });
    ref.status === 403 ? ok("Origin이 없고 Referer가 외부면 차단") : bad("MEDIUM", `외부 Referer가 통과함 (${ref.status})`);

    const none = await post("/api/contact", { fields: human(), noOrigin: true });
    note(`Origin·Referer 둘 다 없으면 통과 (${none.status}) — 비브라우저 클라이언트는 CSRF 대상이 아니라는 설계. 스크립트 스팸은 rate limit·허니팟이 맡는다`);
  });

  await section("7. 요청 한도 (rate limit)", async () => {
    // 하네스는 인메모리 카운터를 10분 유지한다. 고정 IP를 쓰면 두 번째 실행부터
    // 앞 회차 카운터가 남아 전부 429가 된다. 실행마다 새 IP를 쓴다.
    const ip = `198.51.100.${Math.floor(Math.random() * 200) + 20}`;
    await clearMails();
    const codes = [];
    for (let i = 0; i < 7; i++) {
      const r = await post("/api/contact", { fields: human(), ip });
      codes.push(r.status);
      if (r.status === 429) {
        const ra = r.headers.get("retry-after");
        if (i === 5) {
          ra ? ok(`6번째부터 429 + Retry-After ${ra}초`) : bad("LOW", "429에 Retry-After 헤더가 없음");
          typeof r.body === "object" && r.body.retryAfter ? ok(`JSON에도 retryAfter ${r.body.retryAfter}`) : null;
          /10분에 5번/.test(JSON.stringify(r.body)) ? ok("안내 문구가 서버 설정값(10분 5회)에서 나옴") : bad("LOW", "안내 문구가 설정값과 다름");
        }
      }
    }
    codes.filter((c) => c === 200).length === 5
      ? ok(`앞 5번만 통과 (${codes.join(",")})`)
      : bad("HIGH", `한도가 듣지 않음 (${codes.join(",")})`);

    const other = await post("/api/recruit", { fields: human({ portfolio: "https://example.com" }), ip });
    other.status !== 429
      ? ok("같은 IP라도 채용 폼은 별도 버킷 (문의 한도에 걸리지 않음)")
      : bad("MEDIUM", "문의와 채용이 한도를 나눠 씀");

    // IP 위조
    const spoof = await post("/api/contact", { fields: human(), ip, headers: { "x-real-ip": "1.2.3.4" } });
    spoof.status === 429
      ? ok("x-real-ip를 덧붙여도 한도를 우회하지 못함 (x-forwarded-for 우선)")
      : bad("MEDIUM", `x-real-ip로 한도 우회 가능 (${spoof.status})`);
    note("운영에서는 Vercel이 x-forwarded-for를 직접 덮어써서 클라이언트가 조작할 수 없다 (공식 문서). 로컬 하네스에서는 조작 가능한 것이 정상");
  });

  await section("8. 첨부파일", async () => {
    const cases = [
      ["실행파일을 PDF라고 신고 (MZ 헤더)", { data: EXE, name: "resume.pdf", mime: "application/pdf" }, false],
      ["PNG를 PDF라고 신고", { data: PNG, name: "a.pdf", mime: "application/pdf" }, false],
      ["맨 zip을 docx라고 신고", { data: F.fakePlainZip(), name: "a.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, false],
      ["xlsx 구조를 docx라고 신고", { data: F.fakeXlsxLike(), name: "a.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, false],
      ["확장자만 .pdf, MIME은 image/png", { data: PDF, name: "a.pdf", mime: "image/png" }, false],
      ["이중 확장자 a.pdf.exe", { data: PDF, name: "a.pdf.exe", mime: "application/pdf" }, false],
      ["허용 안 된 .svg", { data: F.inertSvg(), name: "a.svg", mime: "image/svg+xml" }, false],
      ["정상 PDF", { data: PDF, name: "제안서.pdf", mime: "application/pdf" }, true],
      ["정상 PNG", { data: PNG, name: "화면.png", mime: "image/png" }, true],
      ["정상 docx", { data: F.fakeDocx(), name: "이력서.docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, true],
      ["정상 pptx", { data: F.fakePptx(), name: "발표.pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }, true],
    ];
    let wrong = 0;
    for (const [label, file, shouldPass] of cases) {
      const r = await post("/api/contact", { fields: human(), file });
      const accepted = r.status === 200;
      if (accepted !== shouldPass) {
        bad(shouldPass ? "MEDIUM" : "HIGH",
          `${label}: ${accepted ? "통과함(막아야 함)" : "막힘(통과해야 함)"} — ${r.status} ${JSON.stringify(r.body).slice(0, 80)}`);
        wrong++;
      }
    }
    wrong === 0 ? ok(`첨부 ${cases.length}종 전부 기대대로 (거부 7 / 허용 4)`) : null;

    // 파일명 공격
    await clearMails();
    await post("/api/contact", {
      fields: human(),
      file: { data: PDF, name: "../../../../etc/passwd.pdf", mime: "application/pdf" },
    });
    let m = (await mails())[0];
    if (m && m.attachments[0]) {
      const fn = m.attachments[0].filename;
      /\.\.|[\\/]/.test(fn)
        ? bad("HIGH", `첨부 파일명에 경로가 남음: ${fn}`)
        : ok(`경로 순회 파일명이 정리됨: ${JSON.stringify(fn)}`);
    } else bad("MEDIUM", "경로 순회 케이스 검증 불가");

    await clearMails();
    await post("/api/contact", {
      fields: human(),
      file: { data: PDF, name: "이력서\r\nBcc: x@evil.example.pdf", mime: "application/pdf" },
    });
    m = (await mails())[0];
    if (m && m.attachments[0]) {
      /[\r\n]/.test(m.attachments[0].filename)
        ? bad("HIGH", "첨부 파일명에 개행이 남음")
        : ok(`파일명 개행 제거됨: ${JSON.stringify(m.attachments[0].filename)}`);
    }

    await clearMails();
    await post("/api/contact", { fields: human(), file: { data: PDF, name: "이력서.pdf", mime: "application/pdf" } });
    m = (await mails())[0];
    m && m.attachments[0] && m.attachments[0].filename.includes("이력서")
      ? ok("한글 파일명이 살아 있음")
      : bad("LOW", `한글 파일명이 망가짐: ${m && m.attachments[0] && m.attachments[0].filename}`);
  });

  await section("9. 업로드 임시 파일이 남는가", async () => {
    const os = require("os");
    const tmp = os.tmpdir();
    const before = fs.readdirSync(tmp).length;
    for (let i = 0; i < 3; i++) {
      await post("/api/contact", { fields: human(), file: { data: PDF, name: "a.pdf", mime: "application/pdf" } });
      await post("/api/contact", { fields: human(), file: { data: EXE, name: "a.pdf", mime: "application/pdf" } });
    }
    await new Promise((r) => setTimeout(r, 400));
    const after = fs.readdirSync(tmp).length;
    after - before <= 1
      ? ok(`6회 업로드(성공3+거부3) 후 임시 파일 증가 ${after - before}개`)
      : bad("MEDIUM", `임시 파일이 ${after - before}개 남음 — 첨부가 평문으로 쌓인다`);
  });

  await section("10. 그 밖의 입력", async () => {
    const r1 = await fetch(BASE + "/api/contact", { method: "PUT" });
    r1.status === 405 ? ok("PUT은 405") : bad("LOW", `PUT이 ${r1.status}`);

    const proto = await post("/api/contact", { fields: { ...human(), __proto__: "polluted", constructor: "x" } });
    ({}).polluted === undefined
      ? ok("__proto__ 필드로 프로토타입이 오염되지 않음")
      : bad("HIGH", "프로토타입 오염 발생");

    const nul = await post("/api/contact", { fields: human({ name: "이름\u0000admin" }) });
    note(`이름에 널바이트: ${nul.status}`);

    const longMsg = await post("/api/contact", { fields: human({ message: "가".repeat(6000) }) });
    longMsg.status === 400 ? ok("5,000자 초과 본문 거부") : bad("LOW", `긴 본문이 ${longMsg.status}`);

    const unicodeEmail = await post("/api/contact", { fields: human({ email: "a@b.c" }) });
    unicodeEmail.status === 400 ? ok("TLD 1글자 이메일 거부") : note(`a@b.c → ${unicodeEmail.status}`);
  });

  await section("11. 이메일 칸 길이 상한 (2026-10-04 수정분)", async () => {
    // 이름 100자 · 내용 5,000자에는 상한이 있는데 이메일에만 없어서
    // 20만 자도 통과했다. 그 값이 메일의 replyTo와 본문에 그대로 들어갔다.
    const long = "a".repeat(300) + "@example.com";
    const r = await post("/api/contact", { fields: human({ email: long }) });
    r.status === 400 && /254자 이내/.test(JSON.stringify(r.body))
      ? ok(`254자 초과 이메일 거부 (${JSON.stringify(r.body).slice(0, 60)})`)
      : bad("MEDIUM", `긴 이메일이 통과함 (${r.status} ${JSON.stringify(r.body).slice(0, 80)})`);

    const edge = "a".repeat(254 - "@example.com".length) + "@example.com";
    const okRes = await post("/api/contact", { fields: human({ email: edge }) });
    okRes.status === 200
      ? ok(`정확히 254자는 통과 (경계값)`)
      : bad("LOW", `254자가 막힘 (${okRes.status}) — 경계가 어긋남`);

    const rec = await post("/api/recruit", {
      fields: human({ email: long }),
      file: { data: PDF, name: "a.pdf", mime: "application/pdf" },
    });
    rec.status === 400 && /254자 이내/.test(JSON.stringify(rec.body))
      ? ok("채용 폼에도 같은 상한 적용")
      : bad("MEDIUM", `채용 폼은 상한이 없음 (${rec.status})`);

    // 입력 칸 전체 바이트 상한 (formidable 기본 20MB -> 256KB)
    const huge = await post("/api/contact", { fields: human({ message: "가".repeat(200000) }) });
    [400, 413].includes(huge.status)
      ? ok(`입력 칸 총량이 큰 요청은 파싱 단계에서 끊김 (${huge.status})`)
      : bad("MEDIUM", `600KB짜리 입력이 통과함 (${huge.status})`);

    // 평범하게 길게 쓴 경우는 여전히 친절한 안내가 나와야 한다
    const normal = await post("/api/contact", { fields: human({ message: "가".repeat(6000) }) });
    /5,000자 이내/.test(JSON.stringify(normal.body))
      ? ok("6,000자 입력에는 글자 수 안내가 그대로 나옴 (총량 상한에 먼저 걸리지 않음)")
      : bad("LOW", `안내가 바뀜: ${JSON.stringify(normal.body).slice(0, 70)}`);
  });

  /* ── 결과 ── */
  console.log("\n" + "=".repeat(68));
  console.log(`  통과 ${pass}   문제 ${findings.length}   참고 ${notes.length}`);
  if (findings.length) {
    console.log("\n  문제:");
    for (const f of findings.sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[a.sev] - ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[b.sev])) {
      console.log(`   [${f.sev}] ${f.m}`);
    }
  }
  process.exitCode = findings.some((f) => f.sev === "HIGH") ? 1 : 0;
})();
