const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

// Upstash Redis 기반 rate limiter.
// Vercel 서버리스 함수는 stateless라 인메모리 카운터가 인스턴스 간 공유되지 않으므로,
// 외부 Redis(Upstash)에 카운터를 두어 전 인스턴스에 걸쳐 일관된 제한을 적용한다.
//
// 필요한 환경변수 (Vercel Project Settings → Environment Variables, 로컬은 .env):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
// 둘 다 설정되지 않으면 rate limit은 비활성화된다(경고 로그 후 통과). 폼이 막히지 않도록 한 안전장치.

let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    // 10분당 5회 — server.js의 기존 apiLimiter 정책과 동일
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "saegyeol_rl",
    analytics: false,
  });
} else {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN 미설정 — rate limit 비활성화됨. " +
    "운영 배포 전 Upstash 환경변수를 설정하세요."
  );
}

// 클라이언트 IP 추출 (Vercel은 x-forwarded-for로 실제 IP를 전달)
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

// 제한 초과 시 에러 메시지 문자열을, 통과 시 null을 반환한다.
async function checkRateLimit(req) {
  if (!ratelimit) return null; // 미구성 시 통과
  try {
    const { success } = await ratelimit.limit(getClientIp(req));
    return success ? null : "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  } catch (err) {
    // Redis 장애 시 폼을 막지 않도록 fail-open (로그만 남김)
    console.error("[rate-limit] Upstash 오류, 요청 통과 처리:", err.message);
    return null;
  }
}

module.exports = { checkRateLimit };
