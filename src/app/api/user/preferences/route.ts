import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify CSRF token
  const csrfValid = await verifyCsrfToken(session.user.id);
  if (!csrfValid) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { darkMode } = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { darkMode },
  });

  return NextResponse.json({ success: true });
}
