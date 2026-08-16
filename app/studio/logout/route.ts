import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { STUDIO_COOKIE_NAME } from "@/lib/passwordAuth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(STUDIO_COOKIE_NAME);
  return NextResponse.redirect(new URL("/studio/login", request.url));
}
