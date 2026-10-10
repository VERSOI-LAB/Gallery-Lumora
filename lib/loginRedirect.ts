/** 로그인 후 돌아갈 경로 — 외부 사이트로 보내는 데 악용되지 않도록 사이트 내부 경로("/...")만
 * 허용하고, 그 외에는 홈으로 보냅니다. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}

export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
