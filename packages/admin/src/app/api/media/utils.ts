import { NextResponse, type NextRequest } from "next/server";
import { resolveWorkspaceId as resolveWorkspaceIdFromPages } from "../pages/utils";

export const invalid = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function readBody(request: NextRequest) {
  try {
    return await request.json();
  } catch (error) {
    return {} as any;
  }
}

export const resolveWorkspaceId = resolveWorkspaceIdFromPages;
