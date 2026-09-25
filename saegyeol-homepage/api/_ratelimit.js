const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");
const { RATE_LIMIT, MESSAGES } = require("./_config");

// Upstash Redis 기반 rate limiter.
// Vercel 서버리스 함수는 stateless라 인메모리 카운터가 인스턴스 간 공유되지 않으므로,
// 외부 Redis에 카운터를 두어 전 인스턴스에 걸쳐 일관된 제한을 적용한다.
//
// 필요한 환경변수 (Vercel Project Settings → Environment Variables, 로컬은 .env):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// 둘이 비어 있으면 운영에서는 _utils.checkConfigured가 폼을 막는다(fail-closed).
// 프리뷰·로컬에서는 아래 인메모리 구현으로 동작한다.

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

function rateLimitConfigured() {
  return hasUpstash;
}

// 문의와 채용은 서로 다른 버킷을 쓴다.
// 예전에는 같은 키를 공유해서, 지원서를 낸 사람이 곧바로 문의를 보내면
// 10분 5회 한도를 둘이 나눠 쓰는 꼴이었다.
const limiters = new Map();

function limiterFor(scope) {
  if (!hasUpstash) return null;
  if (!limiters.has(scope)) {
    limiters.set(scope, new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(RATE_LIMIT.max, RATE_LIMIT.upstashWindow),
      prefix: `saegyeol_rl:${scope}`,
      analytics: false,
    }));
  }
  return limiters.get(scope);
}

/* ---------------- 인메모리 폴백 ---------------- */

// Redis가 일시적으로 죽었을 때 쓰는 대체 카운터(C안).
// 인스턴스마다 따로 세기 때문에 여러 인스턴스로 분산되면 실효 한도가 늘어나지만,
// 장애는 보통 짧고 그 사이 인스턴스당 10분 5회면 스팸으로는 의미가 없다.
// 제한을 통째로 놓는 것(fail-open)보다 낫고, 문의를 막는 것(fail-closed)보다 낫다.
const memory = new Map();
const MEMORY_MAX_KEYS = 5000;

function sweepMemory(now) {
  for (const [key, hits] of memory) {
    const alive = hits.filter((t) => now - t < RATE_LIMIT.windowMs);
    if (alive.length === 0) memory.delete(key);
    else memory.set(key, alive);
  }
}

function memoryLimit(key) {
  const now = Date.now();
  if (memory.size > MEMORY_MAX_KEYS) sweepMemory(now);
  const hits = (memory.get(key) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (hits.length >= RATE_LIMIT.max) {
    memory.set(key, hits);
    return { success: false, reset: hits[0] + RATE_LIMIT.windowMs };
  }
  hits.push(now);
  memory.set(key, hits);
  return { success: true, reset: now + RATE_LIMIT.windowMs };
}

/* ---------------- 클라이언트 IP ---------------- */

// Vercel은 x-forwarded-for를 자기가 덮어쓰고 외부 IP를 전달하지 않는다.
// (https://vercel.com/docs/headers/request-headers — IP 스푸핑 방지 목적)
// 그래서 이 값은 클라이언트가 조작할 수 없다.
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

/* ---------------- 검사 ---------------- */

// 통과 시 null, 초과 시 { message, retryAfter(초) }를 반환한다.
// 안내 문구와 남은 시간을 함께 내려보내는 이유는, 프론트엔드가
// "10분에 5번" 같은 숫자를 따로 적지 않고 서버 설정값만 보게 하려는 것이다.
async function checkRateLimit(req, scope) {
  const key = getClientIp(req);
  const limiter = limiterFor(scope);

  let result;
  if (limiter) {
    try {
      result = await limiter.limit(key);
    } catch (err) {
      // Redis 장애 — 제한을 놓지 않고 인메모리로 강등한다.
      console.error(`[rate-limit] Upstash 오류, 인메모리로 강등: ${err.message}`);
      result = memoryLimit(`${scope}:${key}`);
    }
  } else {
    result = memoryLimit(`${scope}:${key}`);
  }

  if (result.success) return null;
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return { message: MESSAGES.rateLimited, retryAfter };
}

module.exports = { checkRateLimit, rateLimitConfigured, RATE_LIMIT };
