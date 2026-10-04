// 테스트가 때릴 대상 주소를 정한다.
//
// 기본은 언제나 로컬이다. 운영(saegyeol.ai.kr)을 대상으로 돌리면
// 요청 한도를 실제로 소진하고, 폼 테스트는 진짜 메일함에 메일을 넣는다.
// 그래서 로컬이 아닌 주소는 --allow-remote 를 명시해야만 통과시킨다.
//
//   node tests/ui/theme.js                          로컬(기본)
//   node tests/ui/theme.js http://127.0.0.1:3210    로컬 명시
//   node tests/ui/theme.js https://preview.vercel.app --allow-remote
//
// 운영 도메인은 플래그가 있어도 막는다. 점검은 프리뷰 배포에서 한다.

const BLOCKED_HOSTS = [
  "saegyeol.ai.kr",
  "www.saegyeol.ai.kr",
];

const LOCAL_HOSTS = ["127.0.0.1", "localhost", "[::1]", "::1", "0.0.0.0"];

function resolveTarget(fallback) {
  const argv = process.argv.slice(2);
  const allowRemote = argv.includes("--allow-remote");
  const url = argv.find((a) => /^https?:\/\//.test(a)) || fallback;

  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    console.error(`[대상] 주소를 해석하지 못했습니다: ${url}`);
    process.exit(2);
  }

  if (BLOCKED_HOSTS.includes(host)) {
    console.error(
      `\n[대상] ${host} 은 운영 도메인입니다. 테스트를 돌리지 않습니다.\n` +
      `       요청 한도를 소진하고, 폼 테스트는 실제 메일함에 메일을 넣습니다.\n` +
      `       점검이 필요하면 프리뷰 배포 주소를 쓰세요.\n`);
    process.exit(2);
  }

  if (!LOCAL_HOSTS.includes(host) && !allowRemote) {
    console.error(
      `\n[대상] ${host} 은 로컬이 아닙니다.\n` +
      `       원격 대상으로 돌리려면 --allow-remote 를 붙이세요.\n` +
      `       예: node ${process.argv[1]} ${url} --allow-remote\n`);
    process.exit(2);
  }

  if (!LOCAL_HOSTS.includes(host)) {
    console.warn(`[대상] 원격: ${url} (--allow-remote)`);
  }
  return url;
}

module.exports = { resolveTarget, BLOCKED_HOSTS, LOCAL_HOSTS };
