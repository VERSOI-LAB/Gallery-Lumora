import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { STUDIO_COOKIE_NAME, sha256Hex } from "@/lib/passwordAuth";

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password");
  const redirectTo = (formData.get("redirect") as string) || "/studio/works";
  const expected = process.env.STUDIO_PASSWORD;

  if (!expected || typeof password !== "string" || password !== expected) {
    redirect(`/studio/login?error=1&redirect=${encodeURIComponent(redirectTo)}`);
  }

  const token = await sha256Hex(expected);
  const cookieStore = await cookies();
  cookieStore.set(STUDIO_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect(redirectTo);
}

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/studio/works";

  return (
    <div className="mx-auto max-w-sm px-5 py-24 md:px-0">
      <h1 className="mb-2 font-display text-2xl">스튜디오 로그인</h1>
      <p className="mb-8 text-sm text-ink-faint">작가 스튜디오 비밀번호를 입력해주세요.</p>

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
        {params.error && <p className="text-xs text-red-600">비밀번호가 올바르지 않습니다.</p>}
      </form>
    </div>
  );
}
