"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setSubmitting(false);

    if (error) {
      setError(
        error.message.toLowerCase().includes("already registered")
          ? "이미 가입된 이메일입니다."
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setNeedsConfirmation(true);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16 text-center md:px-0">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">가입 확인 필요</p>
        <h1 className="mb-4 font-display text-2xl">{email}로 확인 메일을 보냈습니다</h1>
        <p className="mb-8 text-sm leading-7 text-ink-soft">
          메일함에서 인증 링크를 눌러 가입을 완료해주세요.
        </p>
        <Link href="/login" className={buttonClasses("ghost")}>
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 md:px-0">
      <h1 className="mb-2 font-display text-2xl">회원가입</h1>
      <p className="mb-8 text-sm text-ink-faint">Gallery Lumora의 새 계정을 만드세요.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="이름">
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="비밀번호 확인">
          <input
            required
            type="password"
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>

        <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
          {submitting ? "가입 처리 중..." : "회원가입"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      <p className="mt-6 text-center text-xs text-ink-faint">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-patina hover:underline">
          로그인
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
