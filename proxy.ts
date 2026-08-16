import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, sha256Hex } from "@/lib/adminAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/admin/logout") {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expected = password ? await sha256Hex(password) : null;

  if (!expected || token !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
