"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { createArtwork } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";

const PROGRESS = [
  { label: "1. 프로필 등록", done: true },
  { label: "2. 작품 3점 이상 업로드", done: true },
  { label: "3. 심사 대기", done: false },
];

export default function NewArtworkForm({
  artistId,
  artistHue,
}: {
  artistId: string;
  artistHue: number;
}) {
  const [fileCount, setFileCount] = useState(0);
  const [title, setTitle] = useState("");
  const [mediumTypeCode, setMediumTypeCode] = useState("");
  const [size, setSize] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [price, setPrice] = useState(0);
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createArtwork({ artistId, title, mediumTypeCode, size, year, price, hue: artistHue });
      setPosted(true);
      setTitle("");
      setMediumTypeCode("");
      setSize("");
      setPrice(0);
      setFileCount(0);
    } catch {
      setError("작품 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">작품 등록</h1>

      <div className="mb-8 flex flex-wrap gap-3">
        {PROGRESS.map((p) => (
          <div
            key={p.label}
            className={`border px-3 py-2 text-xs ${
              p.done ? "border-patina font-medium text-patina" : "border-line text-ink-faint"
            }`}
          >
            {p.label}
          </div>
        ))}
      </div>

      {posted && (
        <p className="mb-6 border border-patina bg-patina-soft px-4 py-3 text-sm text-ink">
          작품이 등록되었습니다. 운영팀 심사 후 게시됩니다.
        </p>
      )}
      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-line-strong text-center text-sm text-ink-faint">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
          />
          {fileCount > 0
            ? `이미지 ${fileCount}장 선택됨`
            : "작품 이미지를 여러 장 드래그하거나 클릭하여 업로드"}
        </label>

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
          <Field label="매체">
            <select
              required
              value={mediumTypeCode}
              onChange={(e) => setMediumTypeCode(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            >
              <option value="">선택해주세요</option>
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
              placeholder="예: 72.7 × 60.6 cm"
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
              placeholder="1200000"
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="화풍 태그">
            <input
              type="text"
              placeholder="예: 인물, 유화, 빛"
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
        </div>

        <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
          {submitting ? "등록 중..." : "게시하기"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
