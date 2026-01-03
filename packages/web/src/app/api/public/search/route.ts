import { NextRequest, NextResponse } from "next/server";
import { ensureRateLimit, rateLimitHeaders, resolveWorkspace } from "../shared";

export async function GET(request: NextRequest) {
  const limit = await ensureRateLimit(request, "public:search");
  if (limit.blocked) return limit.response;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const workspace = await resolveWorkspace(request);

  const results = q
    ? [
        { type: "page", title: `Result for ${q}`, slug: `/search/${encodeURIComponent(q)}` },
        { type: "table", title: `Data row containing ${q}`, tableId: "demo_table" },
      ]
    : [];

  return NextResponse.json(
    {
      query: q,
      workspaceId: workspace?.workspace.id ?? null,
      results,
    },
    { headers: rateLimitHeaders(limit.remaining, limit.resetMs) },
  );
}
