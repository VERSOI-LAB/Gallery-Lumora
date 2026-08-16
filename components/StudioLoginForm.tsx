"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";

export default function StudioLoginForm({ redirectTo }: { redirectTo: string }) {
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
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-24 md:px-0">
      <h1 className="mb-2 font-display text-2xl">스튜디오 로그인</h1>
      <p className="mb-8 text-sm text-ink-faint">Gallery Lumora 작가 계정으로 로그인해주세요.</p>

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

        <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      <p className="mt-6 text-center text-xs text-ink-faint">
        아직 작가 지원 전이신가요?{" "}
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
