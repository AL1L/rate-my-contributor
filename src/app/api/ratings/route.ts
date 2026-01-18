import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/sanitize";
import { verifyCsrfToken } from "@/lib/csrf";
import { updateCSCS } from "@/lib/cscs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify CSRF token
  const csrfValid = await verifyCsrfToken(session.user.id);
  if (!csrfValid) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { githubProfileId, score, comment } = await req.json();

  if (!githubProfileId || !score || score < 1 || score > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Sanitize comment to prevent XSS
  const sanitizedComment = comment ? sanitizeInput(comment) : null;

  // Prevent self-rating
  const targetProfile = await prisma.gitHubProfile.findUnique({
    where: { id: githubProfileId },
    include: { user: true },
  });

  if (targetProfile?.user?.email === session.user.email) {
    return NextResponse.json({ error: "You cannot rate yourself" }, { status: 400 });
  }

  // Check if user already has a rating for this profile
  const existingRating = await prisma.rating.findFirst({
    where: {
      userId: session.user.id,
      githubProfileId,
    },
  });

  let rating;
  if (existingRating) {
    rating = await prisma.rating.update({
      where: { id: existingRating.id },
      data: {
        score,
        comment: sanitizedComment,
      },
    });
  } else {
    rating = await prisma.rating.create({
      data: {
        score,
        comment: sanitizedComment,
        userId: session.user.id,
        userEmail: session.user.email,
        githubProfileId,
      },
    });
  }

  // Create notification only for new ratings
  if (!existingRating) {
    await prisma.notification.create({
      data: {
        githubProfileId,
        message: `${session.user.username || 'Someone'} rated you ${score} stars`,
      },
    });
  }

  // Update CSCS for the rated user
  await updateCSCS(githubProfileId);

  return NextResponse.json(rating);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify CSRF token
  const csrfValid = await verifyCsrfToken(session.user.id);
  if (!csrfValid) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const githubProfileId = searchParams.get("githubProfileId");

  if (!githubProfileId) {
    return NextResponse.json({ error: "GitHub Profile ID required" }, { status: 400 });
  }

  await prisma.rating.deleteMany({
    where: {
      userId: session.user.id,
      githubProfileId,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const githubProfileId = searchParams.get("githubProfileId");

  if (!githubProfileId) {
    return NextResponse.json({ error: "GitHub Profile ID required" }, { status: 400 });
  }

  const ratings = await prisma.rating.findMany({
    where: { githubProfileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      score: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      githubProfileId: true,
    },
  });

  const average = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    : 0;

  return NextResponse.json({ ratings, average, count: ratings.length });
}
