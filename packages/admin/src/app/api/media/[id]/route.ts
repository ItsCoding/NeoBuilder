import { NextResponse, type NextRequest } from "next/server";
import { invalid, readBody } from "../utils";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { getDataSource, MediaAsset } = await import("@neobuilder/db");
  const ds = await getDataSource();
  const repo = ds.getRepository(MediaAsset);
  const asset = await repo.findOne({ where: { id: params.id }, relations: ["variants", "tagRefs", "tagRefs.tag", "folder"] });
  if (!asset) return invalid("Asset not found", 404);
  return NextResponse.json({ asset });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await readBody(request);
  try {
    const { updateMediaAsset } = await import("@neobuilder/db");
    const asset = await updateMediaAsset({ assetId: params.id, alt: body.alt ?? undefined, folderId: body.folderId, tags: Array.isArray(body.tags) ? body.tags : undefined });
    return NextResponse.json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update asset";
    return invalid(message, 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { deleteMediaAssets } = await import("@neobuilder/db");
  await deleteMediaAssets([params.id]);
  return NextResponse.json({ deleted: 1 });
}
