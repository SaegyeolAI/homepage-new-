// nodemailer 8.0.10 권고 8건이 이 코드에 실제로 닿는지 확인한다.
// 업그레이드(10.x, breaking)는 하지 않기로 했으므로, 노출 여부를 먼저 가린다.
// 부하 시험은 로컬 하네스에만, 크기를 정해 놓고 몇 번만 보낸다.
const { resolveTarget } = require("../_target");
// 기본은 로컬. 운영 도메인은 _target이 거부한다.
const BASE = resolveTarget("http://127.0.0.1:4321");

const ORIGIN = require("../_fixtures").SITE_ORIGIN;

let ip = 0;
const freshIp = () => `203.0.113.${(++ip % 200) + 30}`;

async function send(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const t0 = Date.now();
  const res = await fetch(BASE + "/api/contact", {
    method: "POST",
    headers: { origin: ORIGIN, "x-forwarded-for": freshIp() },
    body: fd,
  });
  const text = await res.text();
  return { status: res.status, ms: Date.now() - t0, text: text.slice(0, 120) };
}

const human = (extra = {}) => ({
  name: "점검", message: "권고 노출 확인용 내용입니다.",
  email: "a@b.co", form_ts: String(Date.now() - 20000), company_site: "", ...extra,
});

(async () => {
  console.log("\n이 코드가 nodemailer에 넘기는 값");
  console.log("  to      = 설정값 고정 (CONTACT_RECIPIENT)  — 사용자 입력 아님");
  console.log("  from    = 서버가 고정                      — 사용자 입력 아님");
  console.log("  replyTo = 사용자 입력 (이메일 칸)          — 여기만 외부 입력");
  console.log("  raw / resolveContent() / 중첩 배열 수신자  — 쓰지 않음\n");

  console.log("── 이메일 칸 길이 제한이 있는가 (addressparser 2차 복잡도 권고와 직결) ──");
  const base = await send(human());
  console.log(`  기준(정상)            ${base.status}  ${base.ms}ms`);

  for (const n of [1000, 20000, 200000]) {
    // 형식 검사 /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/ 를 통과하는 긴 주소
    const long = "a".repeat(n) + "@example.com";
    const r = await send(human({ email: long }));
    console.log(`  로컬파트 ${String(n).padStart(6)}자   ${r.status}  ${String(r.ms).padStart(6)}ms  ${r.text.slice(0, 60)}`);
  }

  // 코멘트·꺾쇠는 형식 검사에서 걸리는지
  for (const [label, email] of [
    ["꺾쇠 포함", "<a@b.co>"],
    ["쉼표로 수신자 나열", "a@b.co,c@d.co"],
    ["RFC 코멘트", "a(comment)@b.co"],
    ["IDN 유사 도메인", "a@exámple.com"],
    ["공백 포함", "a @b.co"],
  ]) {
    const r = await send(human({ email }));
    console.log(`  ${label.padEnd(18)} ${r.status}  ${r.text.slice(0, 52)}`);
  }
})();
