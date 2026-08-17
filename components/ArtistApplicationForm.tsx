"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";
import { getMyProfile, submitArtistApplication, uploadMedia } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import type { Profile } from "@/lib/types";

type GateState = "loading" | "guest" | "not-artist" | "ready";

export default function ArtistApplicationForm() {
  const [gate, setGate] = useState<GateState>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (active) setGate("guest");
        return;
      }
      const p = await getMyProfile();
      if (!active) return;
      if (!p || p.role !== "artist") {
        setGate("not-artist");
      } else {
        setProfile(p);
        setGate("ready");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (gate === "loading") {
    return <p className="text-center text-sm text-ink-faint">확인 중...</p>;
  }

  if (gate === "guest") {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm leading-7 text-ink-soft">
          작가/작품 등록은 작가 회원으로 로그인한 경우에만 신청할 수 있습니다.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className={buttonClasses("ghost", "sm")}>
            로그인
          </Link>
          <Link href="/signup" className={buttonClasses("primary", "sm")}>
            작가로 회원가입
          </Link>
        </div>
      </div>
    );
  }

  if (gate === "not-artist") {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm leading-7 text-ink-soft">
          작가/작품 등록은 작가 회원만 신청할 수 있습니다. 작가로 별도 가입 후 이용해주세요.
        </p>
        <Link href="/signup" className={buttonClasses("primary", "sm")}>
          작가로 회원가입
        </Link>
      </div>
    );
  }

  return <ArtistApplicationFields profile={profile!} />;
}

const MIN_ARTWORK_IMAGES = 3;

function ArtistApplicationFields({ profile }: { profile: Profile }) {
  const [artistName, setArtistName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [sampleArtworkTitle, setSampleArtworkTitle] = useState("");
  const [sampleArtworkNote, setSampleArtworkNote] = useState("");
  const [artworkFiles, setArtworkFiles] = useState<File[]>([]);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(code: string) {
    setStyleTags((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (artworkFiles.length < MIN_ARTWORK_IMAGES) {
      setError(`작품 이미지를 최소 ${MIN_ARTWORK_IMAGES}장 업로드해주세요.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const artworkImageUrls: string[] = [];
      for (let i = 0; i < artworkFiles.length; i++) {
        setUploadStatus(`이미지 업로드 중... (${i + 1}/${artworkFiles.length})`);
        const file = artworkFiles[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `application-artworks/${profile.id}/${crypto.randomUUID()}.${ext}`;
        const url = await uploadMedia(path, file);
        artworkImageUrls.push(url);
      }
      setUploadStatus("");
      await submitArtistApplication({
        artistName,
        nameEn,
        tagline,
        bio,
        styleTags,
        commissionMedia: styleTags,
        portfolioUrl,
        sampleArtworkTitle,
        sampleArtworkNote,
        artworkImageUrls,
        name,
        phone,
        email,
        message,
      });
      setSubmitted(true);
    } catch {
      setError("신청 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploadStatus("");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">신청 접수 완료</p>
        <h2 className="mb-4 font-display text-xl">감사합니다, {artistName || name}님</h2>
        <p className="text-sm leading-7 text-ink-soft">
          작가/작품 등록 신청이 Lumora 운영팀에 전달되었습니다. 내용을 확인한 뒤 1~3영업일 내
          연락드립니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-[11px] tracking-wide text-ink-faint uppercase">1. 작가 기본 정보</p>
      <Field label="작가명 (활동명)">
        <input
          required
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="영문명 (선택)">
        <input
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="한 줄 소개">
        <input
          required
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="작가 소개 (약력, 작업 철학 등)">
        <textarea
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="h-28 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
        />
      </Field>
      <Field label="활동 매체 (복수 선택 가능)">
        <div className="flex flex-wrap gap-2">
          {MEDIUM_CATEGORIES.flatMap((c) => c.types).map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => toggleTag(t.code)}
              className={`border px-3 py-1.5 text-xs transition-colors ${
                styleTags.includes(t.code)
                  ? "border-patina bg-patina text-paper"
                  : "border-line-strong bg-paper-raised text-ink-soft hover:text-ink"
              }`}
            >
              {t.nameKo}
            </button>
          ))}
        </div>
      </Field>
      <Field label="포트폴리오 링크 (선택)">
        <input
          type="url"
          placeholder="https://"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <p className="pt-2 text-[11px] tracking-wide text-ink-faint uppercase">
        2. 대표 작품 (필수, 이미지 최소 {MIN_ARTWORK_IMAGES}장)
      </p>
      <Field label="작품명">
        <input
          type="text"
          value={sampleArtworkTitle}
          onChange={(e) => setSampleArtworkTitle(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>
      <Field label="작품 설명 / 사이즈 / 연도 등">
        <textarea
          value={sampleArtworkNote}
          onChange={(e) => setSampleArtworkNote(e.target.value)}
          className="h-24 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
        />
      </Field>
      <Field label={`작품 이미지 (최소 ${MIN_ARTWORK_IMAGES}장)`}>
        <label className="flex h-24 cursor-pointer flex-col items-center justify-center border border-dashed border-line-strong text-center text-sm text-ink-faint">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setArtworkFiles(Array.from(e.target.files ?? []))}
          />
          {artworkFiles.length > 0
            ? `이미지 ${artworkFiles.length}장 선택됨`
            : "작품 이미지를 여러 장 드래그하거나 클릭하여 업로드"}
        </label>
        {artworkFiles.length > 0 && artworkFiles.length < MIN_ARTWORK_IMAGES && (
          <p className="mt-2 text-xs text-red-600">
            이미지를 최소 {MIN_ARTWORK_IMAGES}장 업로드해야 신청할 수 있습니다. (현재 {artworkFiles.length}장)
          </p>
        )}
      </Field>

      <p className="pt-2 text-[11px] tracking-wide text-ink-faint uppercase">3. 연락처</p>
      <Field label="이름">
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
      <Field label="추가 메모 (선택)">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-20 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
        />
      </Field>

      <button
        type="submit"
        disabled={submitting || artworkFiles.length < MIN_ARTWORK_IMAGES}
        className={`w-full ${buttonClasses("primary")} disabled:opacity-40`}
      >
        {uploadStatus || (submitting ? "제출 중..." : "작가/작품 등록 신청하기")}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <p className="border border-patina bg-patina-soft px-4 py-3 text-xs leading-6 text-ink">
        신청이 접수되면 Lumora 운영팀이 내용을 확인한 뒤 1~3영업일 내 연락드립니다.
      </p>
    </form>
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
