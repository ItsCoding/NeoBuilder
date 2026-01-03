import { NextRequest, NextResponse } from "next/server";
import { ensureRateLimit, rateLimitHeaders, resolveWorkspace } from "../../shared";

export async function GET(request: NextRequest) {
  const limit = await ensureRateLimit(request, "public:calendar");
  if (limit.blocked) return limit.response;

  const url = new URL(request.url);
  const start = url.searchParams.get("start") ?? new Date().toISOString().slice(0, 10);
  const days = Number(url.searchParams.get("days") ?? 7);
  const workspace = await resolveWorkspace(request);

  const dates = Array.from({ length: Math.max(1, Math.min(days, 31)) }).map((_, idx) => {
    const date = new Date(start);
    date.setDate(date.getDate() + idx);
    return {
      date: date.toISOString().slice(0, 10),
      slots: [
        { time: "10:00", available: idx % 3 !== 0, capacity: 4 },
        { time: "14:00", available: true, capacity: 4 },
      ],
      status: idx % 5 === 0 ? "unavailable" : "open",
    };
  });

  return NextResponse.json(
    {
      workspaceId: workspace?.workspace.id ?? null,
      locale: workspace?.locale ?? "en",
      dates,
    },
    { headers: rateLimitHeaders(limit.remaining, limit.resetMs) },
  );
}
