import { NextResponse, type NextRequest } from "next/server";
import { invalid, resolveWorkspaceId, readBody } from "../utils";

export async function GET(request: NextRequest) {
  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams);
  const { listOrphanedAssets } = await import("@neobuilder/db");
  const assets = await listOrphanedAssets(workspaceId);
  return NextResponse.json({ assets });
}

export async function DELETE(request: NextRequest) {
  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams);
  const { listOrphanedAssets, deleteMediaAssets } = await import("@neobuilder/db");
  const body = await readBody(request);
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  const targetIds = ids.length ? ids : (await listOrphanedAssets(workspaceId)).map((asset) => asset.id);
  if (!targetIds.length) return invalid("No orphaned assets found");
  await deleteMediaAssets(targetIds);
  return NextResponse.json({ deleted: targetIds.length });
}
