import { NextRequest, NextResponse } from "next/server";

const STUDENT_TOKEN_COOKIE = "pp_student_token";

function isStaticPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/student-login") ||
    pathname.startsWith("/student-register") ||
    pathname.startsWith("/admin")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(STUDENT_TOKEN_COOKIE)?.value ?? "";

  if (isPublicPath(pathname)) {
    if (token && (pathname.startsWith("/student-login") || pathname.startsWith("/student-register"))) {
      return NextResponse.redirect(new URL("/student-dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/student-login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
