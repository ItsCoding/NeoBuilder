import { NextResponse } from "next/server";
import Redis from "ioredis";
import { applyRateLimit } from "@neobuilder/core";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rate = await applyRateLimit({ redis, key: `admin-health:${ip}`, windowMs: 60_000, limit: 30 });
  if (!rate.allowed) {
    return NextResponse.json({ status: "rate_limited", resetMs: rate.resetMs }, { status: 429 });
  }

  return NextResponse.json({ status: "ok", remaining: rate.remaining });
}
