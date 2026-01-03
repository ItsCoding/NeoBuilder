import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { requirePermission } from "../../../../lib/authz";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    requirePermission((session.user as { role: "admin" | "editor" | "viewer" }).role, "read", "settings");
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 403 });
  }

  return NextResponse.json({ status: "ok", user: session.user });
}
