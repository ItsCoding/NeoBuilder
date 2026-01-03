import { NextResponse, type NextRequest } from "next/server";
import { invalid, resolveWorkspaceId, readBody } from "./utils";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const workspaceId = await resolveWorkspaceId(params);
  const folderId = params.get("folderId");
  const search = params.get("search") ?? undefined;
  const tagNames = params.get("tags")?.split(",").filter(Boolean);
  const includeOrphans = params.get("orphans") === "true";
  const limit = Number(params.get("limit") ?? 50);

  const { listMediaAssets } = await import("@neobuilder/db");
  const assets = await listMediaAssets({ workspaceId, folderId, search, tagNames, includeOrphans, limit });
  return NextResponse.json({ assets });
}

export async function DELETE(request: NextRequest) {
  const body = await readBody(request);
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  if (!ids.length) return invalid("No asset ids provided");
  const { deleteMediaAssets } = await import("@neobuilder/db");
  await deleteMediaAssets(ids);
  return NextResponse.json({ deleted: ids.length });
}
