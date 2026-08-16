import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, STUDIO_COOKIE_NAME, sha256Hex } from "@/lib/passwordAuth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/logout"];
const PUBLIC_STUDIO_PATHS = ["/studio/login", "/studio/logout"];

async function isAuthenticated(
  request: NextRequest,
  cookieName: string,
  password: string | undefined
): Promise<boolean> {
  if (!password) return false;
  const expected = await sha256Hex(password);
  const token = request.cookies.get(cookieName)?.value;
  return token === expected;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();
    const ok = await isAuthenticated(request, ADMIN_COOKIE_NAME, process.env.ADMIN_PASSWORD);
    if (!ok) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/studio")) {
    if (PUBLIC_STUDIO_PATHS.includes(pathname)) return NextResponse.next();
    const ok = await isAuthenticated(request, STUDIO_COOKIE_NAME, process.env.STUDIO_PASSWORD);
    if (!ok) {
      const loginUrl = new URL("/studio/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*"],
};
