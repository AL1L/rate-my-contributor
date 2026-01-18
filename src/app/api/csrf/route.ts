import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfToken = generateCsrfToken(session.user.id);
  
  return NextResponse.json({ csrfToken });
}
