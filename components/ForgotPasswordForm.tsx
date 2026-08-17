"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    });
    setSubmitting(false);
    if (error) {
      setError("요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 md:px-0">
      <h1 className="mb-2 font-display text-2xl">비밀번호 찾기</h1>
      <p className="mb-8 text-sm text-ink-faint">
        가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.
      </p>

      {sent ? (
        <p className="text-sm text-ink-soft">
          {email} 주소로 재설정 링크를 보냈습니다. 메일함을 확인해주세요.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">
              이메일
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </label>

          <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
            {submitting ? "전송 중..." : "재설정 링크 보내기"}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      )}

      <p className="mt-6 text-center text-xs text-ink-faint">
        <Link href="/login" className="text-patina hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
