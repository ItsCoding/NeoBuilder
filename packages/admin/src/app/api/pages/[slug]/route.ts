import { NextResponse, type NextRequest } from "next/server";
import { findPageWithVersions, upsertPageDraft, type PageStatus } from "@neobuilder/db";
import { decodeSlugParam, resolveWorkspaceId } from "../utils";

const allowedStatus: PageStatus[] = ["draft", "scheduled", "published"];

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function parseDateLike(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams);
  const slug = decodeSlugParam(params.slug);
  const result = await findPageWithVersions({ workspaceId, slug });
  if (!result) return invalid("Page not found", 404);
  return NextResponse.json({ page: result.page, versions: result.versions });
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  let body: any = {};
  try {
    body = await request.json();
  } catch (error) {
    body = {};
  }

  const workspaceId = await resolveWorkspaceId(request.nextUrl.searchParams, body.workspaceId);
  const slug = decodeSlugParam(params.slug);
  const status = body.status as PageStatus | undefined;

  if (status && !allowedStatus.includes(status)) {
    return invalid("Invalid status value");
  }

  let scheduledPublishAt: Date | null | undefined;
  let scheduledUnpublishAt: Date | null | undefined;
  try {
    scheduledPublishAt = parseDateLike(body.scheduledPublishAt);
    scheduledUnpublishAt = parseDateLike(body.scheduledUnpublishAt);
  } catch (error) {
    return invalid((error as Error).message);
  }

  const page = await upsertPageDraft({
    workspaceId,
    slug,
    title: body.title,
    draftContent: body.draftContent,
    status,
    scheduledPublishAt,
    scheduledUnpublishAt,
  });

  return NextResponse.json({ page });
}
