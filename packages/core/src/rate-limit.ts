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

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (Array.isArray(value)) {
    const [, result] = value as [unknown, unknown];
    return typeof result === "number" ? result : Number(result ?? 0);
  }
  return Number((value as number | string | null | undefined) ?? 0);
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
  const current = toNumber(count);
  const ttlMs = toNumber(expire) || windowMs;

  const allowed = current <= limit;
  const resetMs = Math.max(0, ttlMs);
  const remaining = Math.max(0, limit - current);

  return { allowed, remaining, resetMs } as RateLimitResult;
}
