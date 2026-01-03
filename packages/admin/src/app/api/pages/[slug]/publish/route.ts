import { NextResponse, type NextRequest } from "next/server";
import { decodeSlugParam, resolveWorkspaceId } from "../../utils";

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  let body: any = {};
  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams, body.workspaceId);
  const slug = decodeSlugParam(params.slug);
  const { findPageBySlug, publishPage } = await import("@neobuilder/db");
  const page = await findPageBySlug({ workspaceId, slug });
  if (!page) return invalid("Page not found", 404);

  const snapshotJson = body.snapshotJson ?? page.draftContent ?? page.publishedContent ?? {};
  const result = await publishPage({ pageId: page.id, snapshotJson, createdBy: body.createdBy });

  return NextResponse.json({ page: result.page, version: result.version });
}
