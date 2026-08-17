import { timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { ADMIN_COOKIE_NAME, sha256Hex } from "@/lib/passwordAuth";
import { clearAttempts, isRateLimited, recordFailedAttempt } from "@/lib/adminLoginRateLimit";

function passwordMatches(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password");
  const redirectTo = (formData.get("redirect") as string) || "/admin";
  const expected = process.env.ADMIN_PASSWORD;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    redirect(`/admin/login?error=rate_limited&redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (!expected || typeof password !== "string" || !passwordMatches(password, expected)) {
    recordFailedAttempt(ip);
    redirect(`/admin/login?error=1&redirect=${encodeURIComponent(redirectTo)}`);
  }

  clearAttempts(ip);
  const token = await sha256Hex(expected);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect(redirectTo);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/admin";

  return (
    <div className="mx-auto max-w-sm px-5 py-24 md:px-0">
      <h1 className="mb-2 font-display text-2xl">어드민 로그인</h1>
      <p className="mb-8 text-sm text-ink-faint">운영팀 비밀번호를 입력해주세요.</p>

      <form action={login} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectTo} />
        <label className="block">
          <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">비밀번호</span>
          <input
            required
            type="password"
            name="password"
            autoFocus
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </label>
        <button type="submit" className={`w-full ${buttonClasses("primary")}`}>
          로그인
        </button>
        {params.error === "rate_limited" && (
          <p className="text-xs text-red-600">로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.</p>
        )}
        {params.error === "1" && <p className="text-xs text-red-600">비밀번호가 올바르지 않습니다.</p>}
      </form>
    </div>
  );
}
