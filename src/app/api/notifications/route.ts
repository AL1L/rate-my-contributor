import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  // Check if notification exists and belongs to user
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
