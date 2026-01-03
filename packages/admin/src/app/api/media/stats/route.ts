import { NextResponse, type NextRequest } from "next/server";
import { resolveWorkspaceId } from "../utils";

export async function GET(request: NextRequest) {
  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams);
  const { listMediaStats } = await import("@neobuilder/db");
  const stats = await listMediaStats(workspaceId);
  return NextResponse.json({ stats });
}
