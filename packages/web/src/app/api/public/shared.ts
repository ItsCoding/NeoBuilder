import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@neobuilder/core";
import { getRedis } from "../../../lib/redis";
import { resolveWorkspaceContext } from "../../../lib/workspace";

export type RateLimitResult = { blocked: false; remaining: number; resetMs: number } | { blocked: true; response: NextResponse };

export async function ensureRateLimit(request: NextRequest, key: string): Promise<RateLimitResult> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.ip || "anonymous";
  const redis = getRedis();
  const result = await applyRateLimit({ redis, key: `${key}:${ip}`, windowMs: 60_000, limit: 60 });
  if (!result.allowed) {
    return {
      blocked: true,
      response: NextResponse.json({ error: "Too many requests" }, {
        status: 429,
        headers: { "Retry-After": Math.ceil(result.resetMs / 1000).toString() },
      }),
    } as const;
  }
  return { blocked: false, remaining: result.remaining, resetMs: result.resetMs } as const;
}

export function rateLimitHeaders(remaining: number, resetMs: number) {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),
  } as Record<string, string>;
}

export async function resolveWorkspace(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost";
  return resolveWorkspaceContext({ host, slugSegments: [] });
}
