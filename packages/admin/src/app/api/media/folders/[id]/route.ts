import { NextResponse, type NextRequest } from "next/server";
import { invalid, readBody } from "../../utils";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await readBody(request);
  try {
    const { updateMediaFolder } = await import("@neobuilder/db");
    const folder = await updateMediaFolder({ folderId: params.id, name: body.name ?? undefined, parentId: body.parentId ?? undefined });
    return NextResponse.json({ folder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update folder";
    return invalid(message, 400);
  }
}
