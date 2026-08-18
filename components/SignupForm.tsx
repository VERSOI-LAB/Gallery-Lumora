"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";
import { isUsernameAvailable } from "@/lib/queries";

type Role = "individual" | "company" | "artist";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "individual", label: "개인 회원" },
  { value: "company", label: "기업 회원" },
  { value: "artist", label: "작가" },
];

export default function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("individual");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "available" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleUsernameBlur() {
    if (!username.trim()) {
      setUsernameStatus("idle");
      return;
    }
    setCheckingUsername(true);
    try {
      const available = await isUsernameAvailable(username.trim());
      setUsernameStatus(available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    } finally {
      setCheckingUsername(false);
    }
  }

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

    const available = await isUsernameAvailable(username.trim()).catch(() => true);
    if (!available) {
      setSubmitting(false);
      setUsernameStatus("taken");
      setError("이미 사용 중인 아이디입니다.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, name, phone, address, username: username.trim() } },
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

  async function handleOAuthSignup(provider: "kakao" | "google") {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("소셜 회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
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

      <p className="mb-3 text-[11px] tracking-wide text-ink-soft uppercase">간편 회원가입</p>
      <div className="mb-8 space-y-2">
        <button
          type="button"
          onClick={() => handleOAuthSignup("kakao")}
          className="flex h-10 w-full items-center justify-center gap-2 bg-[#FEE500] text-sm font-medium text-[#191600]"
        >
          카카오로 시작하기
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignup("google")}
          className="flex h-10 w-full items-center justify-center gap-2 border border-line-strong bg-paper text-sm text-ink"
        >
          Google로 시작하기
        </button>
      </div>

      <div className="mb-8 flex items-center gap-3 text-[11px] text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        또는 이메일로 가입
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="회원 구분">
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`h-10 flex-1 border text-sm transition-colors ${
                  role === opt.value
                    ? "border-patina bg-patina text-paper"
                    : "border-line-strong bg-paper-raised text-ink-soft hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {role === "artist" && (
            <p className="mt-2 text-xs text-ink-faint">
              작가로 가입하면 Contact 페이지에서 작가/작품 등록을 신청할 수 있습니다.
            </p>
          )}
        </Field>

        <Field label={role === "company" ? "기업명 / 담당자명" : "이름"}>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="연락처">
          <input
            required
            type="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="주소">
          <input
            required
            type="text"
            placeholder="배송지로 사용할 주소를 입력해주세요"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
        <Field label="아이디">
          <input
            required
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameStatus("idle");
            }}
            onBlur={handleUsernameBlur}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
          {checkingUsername && <p className="mt-1 text-xs text-ink-faint">확인 중...</p>}
          {!checkingUsername && usernameStatus === "available" && (
            <p className="mt-1 text-xs text-patina">사용 가능한 아이디입니다.</p>
          )}
          {!checkingUsername && usernameStatus === "taken" && (
            <p className="mt-1 text-xs text-red-600">이미 사용 중인 아이디입니다.</p>
          )}
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
