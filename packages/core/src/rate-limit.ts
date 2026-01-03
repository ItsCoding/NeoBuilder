import Redis from "ioredis";

export interface RateLimitOptions {
  redis: Redis;
  key: string;
  windowMs: number;
  limit: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

// Sliding window counter for per-IP and per-workspace limits
export async function applyRateLimit({ redis, key, windowMs, limit }: RateLimitOptions) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `rl:${key}`;

  const multi = redis.multi();
  multi.zremrangebyscore(redisKey, 0, windowStart);
  multi.zadd(redisKey, now, `${key}:${now}`);
  multi.zcard(redisKey);
  multi.pexpire(redisKey, windowMs);

  const [, , count, expire] = (await multi.exec()) ?? [];
  const current = typeof count === "number" ? count : Array.isArray(count) ? count[1] : 0;
  const ttlMs = typeof expire === "number" ? expire : windowMs;

  const allowed = current <= limit;
  const resetMs = Math.max(0, ttlMs);
  const remaining = Math.max(0, limit - current);

  return { allowed, remaining, resetMs } as RateLimitResult;
}
