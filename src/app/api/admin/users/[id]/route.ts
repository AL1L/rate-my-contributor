import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserAdmin } from "@/lib/auth-helpers";
import { verifyCsrfToken } from "@/lib/csrf";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin status from database
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify CSRF token
  const csrfValid = await verifyCsrfToken(session.user.id);
  if (!csrfValid) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { id } = await params;

  // Don't allow deleting admin users
  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (user?.role === "admin") {
    return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 });
  }

  // Delete user and all related data
  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
