import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session-constants";

const PROTECTED_PATHS = ["/dashboard", "/progress", "/coach", "/team", "/onboarding", "/session", "/billing", "/now", "/reminders"];
const AUTH_PATHS = ["/login", "/signup"];

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await isAuthenticated(request);

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (isProtected && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthPath = AUTH_PATHS.some((path) => pathname === path);
  if (isAuthPath && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/progress/:path*",
    "/coach/:path*",
    "/team/:path*",
    "/onboarding/:path*",
    "/session/:path*",
    "/billing/:path*",
    "/now/:path*",
    "/reminders/:path*",
    "/login",
    "/signup",
  ],
};
