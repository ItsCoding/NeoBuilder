import { NextRequest, NextResponse } from "next/server";
import { ensureRateLimit, rateLimitHeaders, resolveWorkspace } from "../../shared";

export async function POST(request: NextRequest) {
  const limit = await ensureRateLimit(request, "public:forms");
  if (limit.blocked) return limit.response;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.honeypot || body.trap) {
    return NextResponse.json({ error: "Spam detected" }, { status: 400 });
  }

  const workspace = await resolveWorkspace(request);
  const submissionId = crypto.randomUUID();

  return NextResponse.json(
    {
      submissionId,
      workspaceId: workspace?.workspace.id ?? null,
      receivedAt: new Date().toISOString(),
      status: "accepted",
    },
    { headers: rateLimitHeaders(limit.remaining, limit.resetMs) },
  );
}
