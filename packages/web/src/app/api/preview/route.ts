import { NextResponse } from "next/server";
import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const slug = searchParams.get("slug") ?? "/";
  const secret = process.env.PREVIEW_SECRET ?? "preview-secret";

  if (token !== secret) {
    return NextResponse.json({ error: "Invalid preview token" }, { status: 401 });
  }

  draftMode().enable();
  return NextResponse.redirect(new URL(slug, request.url));
}
