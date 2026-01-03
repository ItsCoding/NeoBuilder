import { NextResponse, type NextRequest } from "next/server";
import { invalid, resolveWorkspaceId, readBody } from "../utils";

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams, body.workspaceId);
  if (!body.fileName || !body.mime || typeof body.sizeBytes !== "number") {
    return invalid("Missing file metadata");
  }

  try {
    const { signMediaUpload } = await import("@neobuilder/db");
    const signed = await signMediaUpload({
      workspaceId,
      fileName: body.fileName,
      mime: body.mime,
      sizeBytes: body.sizeBytes,
      folderId: body.folderId ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    return NextResponse.json(signed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign upload";
    return invalid(message, 400);
  }
}
