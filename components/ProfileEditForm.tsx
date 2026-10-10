"use client";

import { useEffect, useState, type FormEvent } from "react";
import PhoneInput from "./PhoneInput";
import AddressSearchField from "./AddressSearchField";
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
  // 저장된 주소가 있으면 그대로 보여주고, "주소 변경"을 누를 때만 주소 찾기 입력을 엽니다.
  const [editingAddress, setEditingAddress] = useState(!profile.address);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      setError("주소 찾기로 주소를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile({ name, phone, address });
      setEditingAddress(false);
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
        <PhoneInput
          required
          value={phone}
          onChange={setPhone}
        />
      </Field>
      {/* 주소 찾기 버튼이 들어가므로 <label> 대신 <div>로 감쌉니다. */}
      <div>
        <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">주소</span>
        {editingAddress ? (
          <>
            <AddressSearchField onChange={setAddress} />
            {profile.address && (
              <button
                type="button"
                onClick={() => {
                  setAddress(profile.address);
                  setEditingAddress(false);
                }}
                className="mt-2 text-xs text-ink-soft hover:text-ink hover:underline"
              >
                취소
              </button>
            )}
          </>
        ) : (
          <div className="flex items-start gap-3">
            <p className="min-h-10 flex-1 border border-line-strong bg-paper-raised px-3 py-2.5 text-sm">{address}</p>
            <button
              type="button"
              onClick={() => {
                setAddress("");
                setSaved(false);
                setEditingAddress(true);
              }}
              className="h-10 shrink-0 border border-line-strong px-4 text-sm text-ink hover:bg-paper-raised"
            >
              주소 변경
            </button>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-faint">결제할 때 &quot;등록된 주소와 동일&quot;을 선택하면 이 주소로 배송됩니다.</p>
      </div>

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
