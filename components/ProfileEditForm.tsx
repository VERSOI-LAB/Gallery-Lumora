"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { getMyProfile, updateMyPassword, updateMyProfile } from "@/lib/queries";
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile({ name, phone });
      setSaved(true);
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="이메일">
        <input
          disabled
          value={profile.email}
          className="h-10 w-full border border-line bg-paper px-3 text-sm text-ink-faint"
        />
      </Field>
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

      <button type="submit" disabled={submitting} className={buttonClasses("primary", "sm")}>
        {submitting ? "저장 중..." : "저장"}
      </button>
      {saved && <p className="text-xs text-patina">저장되었습니다.</p>}
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
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">비밀번호</h2>
        <PasswordFields />
      </section>
    </div>
  );
}
