"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { createArtwork, uploadMedia } from "@/lib/queries";
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
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediumTypeCode, setMediumTypeCode] = useState("");
  const [size, setSize] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [price, setPrice] = useState(0);
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const previewUrls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadStatus(`이미지 업로드 중... (${i + 1}/${files.length})`);
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `artworks/${artistId}/${crypto.randomUUID()}.${ext}`;
        const url = await uploadMedia(path, file);
        imageUrls.push(url);
      }
      setUploadStatus("");
      await createArtwork({
        artistId,
        title,
        description,
        mediumTypeCode,
        size,
        year,
        price,
        hue: artistHue,
        imageUrls,
      });
      setPosted(true);
      setTitle("");
      setDescription("");
      setMediumTypeCode("");
      setSize("");
      setPrice(0);
      setFiles([]);
    } catch {
      setError("작품 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploadStatus("");
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
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0
            ? `이미지 ${files.length}장 선택됨`
            : "작품 이미지를 여러 장 드래그하거나 클릭하여 업로드"}
        </label>

        {files.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-ink-faint">
              첫 번째 사진이 대표 이미지로 사용됩니다. 화살표로 순서를 바꿀 수 있어요.
            </p>
            <div className="flex flex-wrap gap-3">
              {files.map((file, i) => (
                // eslint-disable-next-line react/no-array-index-key -- files can share a name; position is the stable identity here
                <div key={i} className="relative h-24 w-24 overflow-hidden border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrls[i]} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-ink px-1.5 py-0.5 text-[9px] font-semibold text-paper">
                      대표
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label="이미지 삭제"
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-ink/70 text-xs text-paper"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-1 left-1 flex gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => moveFile(i, -1)}
                      aria-label="앞으로 이동"
                      className="flex h-5 w-5 items-center justify-center bg-ink/70 text-xs text-paper disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={i === files.length - 1}
                      onClick={() => moveFile(i, 1)}
                      aria-label="뒤로 이동"
                      className="flex h-5 w-5 items-center justify-center bg-ink/70 text-xs text-paper disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              placeholder="작품을 한 줄로 소개해주세요"
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
        </div>

        <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
          {uploadStatus || (submitting ? "등록 중..." : "게시하기")}
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
