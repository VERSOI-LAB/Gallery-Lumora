"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";
import { isUsernameAvailable } from "@/lib/queries";
import { getRequiredTermsForRole, type LegalDocument } from "@/lib/legalTerms";

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
  const [agreedTerms, setAgreedTerms] = useState<Set<string>>(new Set());
  const [openTermsKey, setOpenTermsKey] = useState<string | null>(null);

  const requiredTerms = getRequiredTermsForRole(role);

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

    if (requiredTerms.some((doc) => !agreedTerms.has(doc.key))) {
      setError("회원가입을 진행하려면 모든 약관에 동의해야 합니다.");
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
      options: {
        data: { role, name, phone, address, username: username.trim() },
      },
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
              작가로 가입하면 Contact 페이지에서 작가/작품 등록을 신청할 수 있습니다. 승인 후
              스튜디오 프로필에서 사업자 정보(*필수)를 등록해주세요.
            </p>
          )}
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

        <div className="space-y-2 border border-line-strong bg-paper-raised p-4">
          <p className="mb-1 text-[11px] tracking-wide text-ink-faint uppercase">약관 동의 (필수)</p>
          {requiredTerms.map((doc) => (
            <div key={doc.key} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={agreedTerms.has(doc.key)}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTermsKey(doc.key);
                }}
                readOnly
                className="accent-patina"
              />
              <button
                type="button"
                onClick={() => setOpenTermsKey(doc.key)}
                className="flex-1 text-left hover:underline"
              >
                [필수] {doc.title}
              </button>
              <span className="text-xs text-ink-faint">
                {agreedTerms.has(doc.key) ? "동의완료" : "약관보기"}
              </span>
            </div>
          ))}
          <p className="pt-1 text-[11px] text-ink-faint">
            각 약관을 끝까지 읽고 확인 버튼을 눌러야 동의로 처리됩니다.
          </p>
        </div>

        <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
          {submitting ? "가입 처리 중..." : "회원가입"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      {openTermsKey && (
        <TermsModal
          doc={requiredTerms.find((d) => d.key === openTermsKey)!}
          onConfirm={() => {
            setAgreedTerms((prev) => new Set(prev).add(openTermsKey));
            setOpenTermsKey(null);
          }}
          onClose={() => setOpenTermsKey(null)}
        />
      )}

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

function TermsModal({
  doc,
  onConfirm,
  onClose,
}: {
  doc: LegalDocument;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 8) {
      setScrolledToBottom(true);
    }
  }, []);

  function handleScroll() {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToBottom(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg">{doc.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-ink-faint hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-6 text-ink-soft"
        >
          <p className="mb-4 text-xs text-ink-faint">{doc.subtitle}</p>
          {doc.intro && <p className="mb-4 whitespace-pre-line">{doc.intro}</p>}
          {doc.articles.map((article) => (
            <div key={article.heading} className="mb-4">
              <p className="mb-1 font-semibold text-ink">{article.heading}</p>
              <p className="whitespace-pre-line">{article.body}</p>
            </div>
          ))}
          <p className="pt-2 text-center text-xs text-ink-faint">— 끝 —</p>
        </div>

        <div className="border-t border-line px-5 py-4">
          {!scrolledToBottom && (
            <p className="mb-2 text-xs text-ink-faint">
              약관을 끝까지 스크롤하면 확인 버튼을 누를 수 있습니다.
            </p>
          )}
          <button
            type="button"
            disabled={!scrolledToBottom}
            onClick={onConfirm}
            className={`w-full ${buttonClasses("primary")} disabled:opacity-40`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
