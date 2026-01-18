import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCSCS, recalculateAllCSCS } from "@/lib/cscs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { githubProfileId } = body;

  try {
    if (githubProfileId) {
      // Recalculate for specific profile
      const cscs = await updateCSCS(githubProfileId);
      return NextResponse.json({ success: true, cscs });
    } else {
      // Recalculate all
      await recalculateAllCSCS();
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error recalculating CSCS:", error);
    return NextResponse.json(
      { error: "Failed to recalculate CSCS" },
      { status: 500 }
    );
  }
}
