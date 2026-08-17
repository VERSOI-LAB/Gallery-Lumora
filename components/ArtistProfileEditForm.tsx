"use client";

import { useState, type FormEvent } from "react";
import ArtistAvatar from "./ArtistAvatar";
import { buttonClasses } from "@/lib/ui";
import { updateArtist, uploadMedia, type ArtistInput } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import type { Artist } from "@/lib/types";

export default function ArtistProfileEditForm({ artist }: { artist: Artist }) {
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [nameEn, setNameEn] = useState(artist.nameEn);
  const [tagline, setTagline] = useState(artist.tagline);
  const [bio, setBio] = useState(artist.bio);
  const [styleTags, setStyleTags] = useState(artist.styleTags.join(", "));
  const [commissionAccepting, setCommissionAccepting] = useState(artist.commission.accepting);
  const [commissionMedia, setCommissionMedia] = useState<string[]>(artist.commission.media);
  const [commissionLeadTime, setCommissionLeadTime] = useState(artist.commission.leadTime);
  const [commissionPriceRange, setCommissionPriceRange] = useState(artist.commission.priceRange);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMedia(code: string) {
    setCommissionMedia((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleAvatarUpload(file: File) {
    setAvatarUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadMedia(`artists/${artist.id}/avatar.${ext}`, file);
      setAvatarUrl(url);
    } catch {
      setError("사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    setError(null);
    const input: ArtistInput = {
      slug: artist.slug,
      name: artist.name,
      nameEn,
      tagline,
      bio,
      hue: artist.hue,
      artistSplitRate: artist.artistSplitRate,
      avatarUrl,
      styleTags: styleTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      commissionAccepting,
      commissionMedia,
      commissionLeadTime,
      commissionPriceRange,
    };
    try {
      await updateArtist(artist.id, input);
      setSaved(true);
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">프로필 사진</span>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 flex-none overflow-hidden border border-line">
            <ArtistAvatar avatarUrl={avatarUrl} hue={artist.hue} seed={artist.slug} className="h-full w-full" />
          </div>
          <label className="cursor-pointer text-xs text-ink-soft hover:text-ink hover:underline">
            {avatarUploading ? "업로드 중..." : "사진 변경"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={avatarUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="작가명">
          <input
            value={artist.name}
            disabled
            className="h-10 w-full border border-line bg-paper-raised px-3 text-sm text-ink-faint"
          />
        </Field>
        <Field label="영문명">
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
      </div>

      <Field label="한 줄 소개">
        <input
          required
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <Field label="작가 소개">
        <textarea
          required
          rows={5}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
      </Field>

      <Field label="화풍 태그 (쉼표로 구분)">
        <input
          type="text"
          placeholder="예: 인물, 추상, 풍경"
          value={styleTags}
          onChange={(e) => setStyleTags(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <div className="border-t border-line pt-5">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">정산 비율</p>
        <p className="text-sm text-ink-soft">
          작가 {Math.round(artist.artistSplitRate * 100)}% / 갤러리 {Math.round((1 - artist.artistSplitRate) * 100)}%
        </p>
        <p className="mt-1 text-xs text-ink-faint">운영팀이 설정하는 값으로, 작품 판매 정산에 적용됩니다.</p>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">커미션 설정</p>

        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={commissionAccepting}
            onChange={() => setCommissionAccepting((v) => !v)}
            className="accent-patina"
          />
          커미션 접수 중
        </label>

        <Field label="커미션 가능 매체 (복수 선택)">
          <div className="flex flex-wrap gap-2">
            {MEDIUM_CATEGORIES.flatMap((c) => c.types).map((t) => (
              <button
                key={t.code}
                type="button"
                onClick={() => toggleMedia(t.code)}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  commissionMedia.includes(t.code)
                    ? "border-patina bg-patina text-paper"
                    : "border-line-strong bg-paper-raised text-ink-soft hover:text-ink"
                }`}
              >
                {t.nameKo}
              </button>
            ))}
          </div>
        </Field>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="예상 소요 기간">
            <input
              type="text"
              placeholder="예: 4~6주"
              value={commissionLeadTime}
              onChange={(e) => setCommissionLeadTime(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="가격대">
            <input
              type="text"
              placeholder="예: 50만원~200만원"
              value={commissionPriceRange}
              onChange={(e) => setCommissionPriceRange(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
        </div>
      </div>

      <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
        {submitting ? "저장 중..." : "저장하기"}
      </button>
      {saved && <p className="text-sm text-patina">저장되었습니다.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
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
