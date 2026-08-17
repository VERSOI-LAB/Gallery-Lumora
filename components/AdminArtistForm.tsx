"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { adminCreateArtist, adminUpdateArtist } from "@/lib/adminActions";
import type { ArtistInput } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import type { Artist } from "@/lib/types";

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "artist"}-${suffix}`;
}

export default function AdminArtistForm({ artist }: { artist?: Artist }) {
  const router = useRouter();
  const [slug, setSlug] = useState(artist?.slug ?? "");
  const [name, setName] = useState(artist?.name ?? "");
  const [nameEn, setNameEn] = useState(artist?.nameEn ?? "");
  const [tagline, setTagline] = useState(artist?.tagline ?? "");
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [hue, setHue] = useState(artist?.hue ?? 90);
  const [styleTags, setStyleTags] = useState(artist?.styleTags.join(", ") ?? "");
  const [commissionAccepting, setCommissionAccepting] = useState(
    artist?.commission.accepting ?? true
  );
  const [commissionMedia, setCommissionMedia] = useState<string[]>(artist?.commission.media ?? []);
  const [commissionLeadTime, setCommissionLeadTime] = useState(artist?.commission.leadTime ?? "");
  const [commissionPriceRange, setCommissionPriceRange] = useState(
    artist?.commission.priceRange ?? ""
  );
  const [artistSplitRate, setArtistSplitRate] = useState(artist?.artistSplitRate ?? 0.7);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMedia(code: string) {
    setCommissionMedia((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input: ArtistInput = {
      slug: slug || slugify(name),
      name,
      nameEn,
      tagline,
      bio,
      hue,
      avatarUrl: artist?.avatarUrl ?? null,
      styleTags: styleTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      artistSplitRate,
      commissionAccepting,
      commissionMedia,
      commissionLeadTime,
      commissionPriceRange,
    };
    try {
      if (artist) {
        await adminUpdateArtist(artist.id, input);
      } else {
        await adminCreateArtist(input);
      }
      router.push("/admin/artists");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="작가명">
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
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
        <Field label="슬러그 (비워두면 자동 생성)">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-에-쓰일-slug"
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="색상 (hue, 0~360)">
          <input
            type="number"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
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
        <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">정산 비율</p>
        <Field label="작가 정산 비율 (0~1, 예: 0.7 = 작가 70% / 갤러리 30%)">
          <input
            required
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={artistSplitRate}
            onChange={(e) => setArtistSplitRate(Number(e.target.value))}
            className="h-10 w-full max-w-xs border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <p className="mt-2 text-xs text-ink-faint">
          작품 판매 시 이 비율로 작가 정산액이 자동 계산됩니다 (작가 {Math.round(artistSplitRate * 100)}% /
          갤러리 {Math.round((1 - artistSplitRate) * 100)}%).
        </p>
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
        {submitting ? "저장 중..." : artist ? "수정 완료" : "작가 등록"}
      </button>
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
