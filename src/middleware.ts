import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/api/auth/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin routes - check role from token
  // Note: This is preliminary check, API routes still verify from database
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect API routes
  if (pathname.startsWith("/api")) {
    // Allow auth routes
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Require authentication for other API routes except public ones
    const publicApiRoutes = ["/api/users"];
    const isPublicRoute = publicApiRoutes.some(route => pathname === route);

    if (!isPublicRoute && !token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin routes
    if (pathname.startsWith("/api/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
