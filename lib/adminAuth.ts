import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, sha256Hex } from "./passwordAuth";

// proxy.ts already gates page navigation to /admin, but Server Actions are
// invoked directly and can bypass a proxy matcher, so each admin action must
// re-check the session cookie itself.
export async function assertAdminSession(): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("관리자 인증이 설정되지 않았습니다.");

  const expected = await sha256Hex(password);
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== expected) throw new Error("관리자 로그인이 필요합니다.");
}
