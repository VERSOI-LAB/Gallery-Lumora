"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleOAuthLogin(provider: "kakao" | "google") {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("소셜 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 md:px-0">
      <h1 className="mb-2 font-display text-2xl">로그인</h1>
      <p className="mb-8 text-sm text-ink-faint">Gallery Lumora 계정으로 로그인하세요.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="이메일">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="비밀번호">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>

        <div className="text-right">
          <Link href="/reset-password" className="text-xs text-ink-faint hover:text-ink">
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      <div className="my-6 flex items-center gap-3 text-[11px] text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        또는
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleOAuthLogin("kakao")}
          className="flex h-10 w-full items-center justify-center gap-2 bg-[#FEE500] text-sm font-medium text-[#191600]"
        >
          카카오로 로그인
        </button>
        <button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          className="flex h-10 w-full items-center justify-center gap-2 border border-line-strong bg-paper text-sm text-ink"
        >
          Google로 로그인
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-ink-faint">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="text-patina hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  );
}
