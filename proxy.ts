import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_COOKIE_NAME, sha256Hex } from "@/lib/passwordAuth";
import type { Database } from "@/lib/database.types";

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

// Optimistic check only (session exists?) — whether the session belongs to an
// approved artist is verified close to the data by getCurrentArtist().
async function hasStudioSession(request: NextRequest): Promise<{ ok: boolean; response: NextResponse }> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { ok: !!user, response };
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
    const { ok, response } = await hasStudioSession(request);
    if (!ok) {
      const loginUrl = new URL("/studio/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*"],
};
