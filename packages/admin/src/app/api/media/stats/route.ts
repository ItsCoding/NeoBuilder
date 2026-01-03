import { NextResponse, type NextRequest } from "next/server";
import { resolveWorkspaceId } from "../utils";
import { listMediaStats } from "@neobuilder/db";

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams);
    const stats = await listMediaStats(workspaceId);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("/api/media/stats GET failed", error);
    const message = error instanceof Error ? error.message : "Unable to load media stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
