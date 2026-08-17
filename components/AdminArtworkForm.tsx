"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { adminUpdateArtwork } from "@/lib/adminActions";
import { uploadMedia, type ArtworkUpdateInput } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import ArtworkThumbnail from "./ArtworkThumbnail";
import type { Artwork } from "@/lib/types";

export default function AdminArtworkForm({ artwork }: { artwork: Artwork }) {
  const router = useRouter();
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description);
  const [mediumTypeCode, setMediumTypeCode] = useState(artwork.mediumTypeCode);
  const [size, setSize] = useState(artwork.size);
  const [year, setYear] = useState(artwork.year);
  const [price, setPrice] = useState(artwork.price);
  const [sold, setSold] = useState(artwork.sold);
  const [hue, setHue] = useState(artwork.hue);
  const [variant, setVariant] = useState(artwork.variant);
  const [imageUrls, setImageUrls] = useState(artwork.imageUrls);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `artworks/${artwork.artistId}/${crypto.randomUUID()}.${ext}`;
        uploaded.push(await uploadMedia(path, file));
      }
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch {
      setError("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input: ArtworkUpdateInput = {
      title,
      description,
      mediumTypeCode,
      size,
      year,
      price,
      sold,
      hue,
      variant,
      imageUrls,
    };
    try {
      await adminUpdateArtwork(artwork.id, input);
      router.push("/admin/artworks");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <p className="text-xs text-ink-faint">작가: {artwork.artistName}</p>

      <div>
        <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">미리보기</span>
        <div className="mb-4 h-56 w-56 overflow-hidden border border-line">
          <ArtworkThumbnail
            imageUrls={imageUrls}
            hue={hue}
            variant={variant}
            seed={artwork.slug}
            className="h-full w-full"
          />
        </div>

        {imageUrls.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {imageUrls.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden border border-line">
                <ArtworkThumbnail imageUrls={[url]} hue={hue} variant={variant} seed={url} className="h-full w-full" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-0.5 right-0.5 bg-ink px-1.5 py-0.5 text-[10px] text-paper"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex h-16 cursor-pointer items-center justify-center border border-dashed border-line-strong text-center text-xs text-ink-faint">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleAddImages(e.target.files)}
          />
          {uploading ? "업로드 중..." : "이미지 추가"}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="작품명">
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="작품 설명">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="매체">
          <select
            required
            value={mediumTypeCode}
            onChange={(e) => setMediumTypeCode(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          >
            {MEDIUM_CATEGORIES.map((category) => (
              <optgroup key={category.code} label={`${category.number}. ${category.nameKo}`}>
                {category.types.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.nameKo}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="사이즈">
          <input
            required
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="제작연도">
          <input
            required
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="판매가 (원)">
          <input
            required
            type="number"
            step={10000}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
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
        <Field label="이미지 배리에이션 (0~2)">
          <input
            type="number"
            min={0}
            max={2}
            value={variant}
            onChange={(e) => setVariant(Number(e.target.value))}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={sold} onChange={() => setSold((v) => !v)} className="accent-patina" />
        판매완료(SOLD) 처리
      </label>

      <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
        {submitting ? "저장 중..." : "수정 완료"}
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
