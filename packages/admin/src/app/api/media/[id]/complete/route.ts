import { NextResponse, type NextRequest } from "next/server";
import { invalid, readBody } from "../../utils";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await readBody(request);
  try {
    const { completeMediaUpload } = await import("@neobuilder/db");
    const asset = await completeMediaUpload({
      assetId: params.id,
      width: body.width ?? undefined,
      height: body.height ?? undefined,
      durationMs: body.durationMs ?? undefined,
      alt: body.alt ?? undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
    });
    return NextResponse.json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to finalize upload";
    return invalid(message, 400);
  }
}
