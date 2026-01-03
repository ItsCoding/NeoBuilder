import { NextResponse, type NextRequest } from "next/server";
import { invalid, resolveWorkspaceId, readBody } from "../utils";

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams);
    const { listMediaFolders } = await import("@neobuilder/db");
    const folders = await listMediaFolders(workspaceId);
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("/api/media/folders GET failed", error);
    const message = error instanceof Error ? error.message : "Unable to load folders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams, body.workspaceId);
  if (!body.name) return invalid("Folder name required");
  try {
    const { createMediaFolder } = await import("@neobuilder/db");
    const folder = await createMediaFolder({ workspaceId, name: body.name, parentId: body.parentId ?? null });
    return NextResponse.json({ folder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create folder";
    return invalid(message, 400);
  }
}
