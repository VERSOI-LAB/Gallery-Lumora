"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { getMyProfile, updateMyEmail, updateMyPassword, updateMyProfile } from "@/lib/queries";
import type { Profile } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  );
}

function ProfileFields({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile({ name, phone, address });
      setSaved(true);
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="이름">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="연락처">
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="주소">
        <input
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="배송지로 사용할 주소를 입력해주세요"
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <button type="submit" disabled={submitting} className={buttonClasses("primary", "sm")}>
        {submitting ? "저장 중..." : "저장"}
      </button>
      {saved && <p className="text-xs text-patina">저장되었습니다.</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

function EmailFields({ profile }: { profile: Profile }) {
  const [email, setEmail] = useState(profile.email);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSent(false);
    try {
      await updateMyEmail(email);
      setSent(true);
    } catch {
      setError("변경하지 못했습니다. 이미 사용 중인 이메일일 수 있습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="이메일">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSent(false);
          }}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <button
        type="submit"
        disabled={submitting || email === profile.email}
        className={buttonClasses("ghost", "sm")}
      >
        {submitting ? "처리 중..." : "이메일 변경"}
      </button>
      {sent && (
        <p className="text-xs text-patina">
          새 이메일 주소로 확인 메일을 보냈습니다. 메일함에서 링크를 눌러야 변경이 완료됩니다.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

function PasswordFields() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyPassword(password);
      setPassword("");
      setSaved(true);
    } catch {
      setError("변경하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="새 비밀번호">
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <button type="submit" disabled={submitting} className={buttonClasses("ghost", "sm")}>
        {submitting ? "변경 중..." : "비밀번호 변경"}
      </button>
      {saved && <p className="text-xs text-patina">비밀번호가 변경되었습니다.</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

export default function ProfileEditForm() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  if (profile === undefined) return <p className="text-sm text-ink-faint">불러오는 중...</p>;
  if (profile === null) {
    return <p className="text-sm text-ink-faint">로그인 후 이용할 수 있습니다.</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">기본 정보</h2>
        <ProfileFields profile={profile} />
      </section>
      <section className="border-t border-line pt-8">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">이메일</h2>
        <EmailFields profile={profile} />
      </section>
      <section className="border-t border-line pt-8">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">비밀번호</h2>
        <PasswordFields />
      </section>
    </div>
  );
}
