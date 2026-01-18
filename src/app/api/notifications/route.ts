import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's GitHub profile ID
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { githubProfileId: true },
  });

  if (!user?.githubProfileId) {
    return NextResponse.json([]);
  }

  const notifications = await prisma.notification.findMany({
    where: { githubProfileId: user.githubProfileId },
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

  // Get user's GitHub profile ID
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { githubProfileId: true },
  });

  if (!user?.githubProfileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if notification exists and belongs to user's GitHub profile
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { githubProfileId: true },
  });

  if (!notification || notification.githubProfileId !== user.githubProfileId) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
