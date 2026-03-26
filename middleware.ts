import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;

  // www → non-www redirect
  if (hostname === "www.utvecklare.ai") {
    const url = new URL(`https://utvecklare.ai${pathname}${search}`);
    return NextResponse.redirect(url, 301);
  }

  // Remove trailing slash (except root)
  if (pathname !== "/" && pathname.endsWith("/")) {
    const url = new URL(
      `https://utvecklare.ai${pathname.slice(0, -1)}${search}`,
    );
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)",
  ],
};
