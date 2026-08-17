"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { buttonClasses } from "@/lib/ui";
import { deleteArtwork, updateArtwork, uploadMedia } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import type { Artwork } from "@/lib/types";

export default function EditArtworkForm({ artwork, artistId }: { artwork: Artwork; artistId: string }) {
  const router = useRouter();
  const [existingImages, setExistingImages] = useState(artwork.imageUrls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description);
  const [mediumTypeCode, setMediumTypeCode] = useState(artwork.mediumTypeCode);
  const [size, setSize] = useState(artwork.size);
  const [year, setYear] = useState(artwork.year);
  const [price, setPrice] = useState(artwork.price);
  const [sold, setSold] = useState(artwork.sold);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  }

  function moveExistingImage(index: number, direction: -1 | 1) {
    setExistingImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        setUploadStatus(`이미지 업로드 중... (${i + 1}/${newFiles.length})`);
        const file = newFiles[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `artworks/${artistId}/${crypto.randomUUID()}.${ext}`;
        const url = await uploadMedia(path, file);
        uploadedUrls.push(url);
      }
      setUploadStatus("");
      await updateArtwork(artwork.id, {
        title,
        description,
        mediumTypeCode,
        size,
        year,
        price,
        sold,
        hue: artwork.hue,
        variant: artwork.variant,
        imageUrls: [...existingImages, ...uploadedUrls],
      });
      router.push("/studio/works");
      router.refresh();
    } catch {
      setError("작품 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setUploadStatus("");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteArtwork(artwork.id);
      router.push("/studio/works");
      router.refresh();
    } catch {
      setDeleteError("삭제하지 못했습니다. 이미 판매되었거나 주문이 연결된 작품은 삭제할 수 없습니다.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">작품 수정</h1>

      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((url, i) => (
              <div key={url} className="relative h-24 w-24 overflow-hidden border border-line">
                <ArtworkThumbnail
                  imageUrls={[url]}
                  hue={artwork.hue}
                  variant={artwork.variant}
                  seed={url}
                  className="h-full w-full"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-ink px-1.5 py-0.5 text-[9px] font-semibold text-paper">
                    대표
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(url)}
                  aria-label="이미지 삭제"
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-ink/70 text-xs text-paper"
                >
                  ✕
                </button>
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveExistingImage(i, -1)}
                    aria-label="앞으로 이동"
                    className="flex h-5 w-5 items-center justify-center bg-ink/70 text-xs text-paper disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={i === existingImages.length - 1}
                    onClick={() => moveExistingImage(i, 1)}
                    aria-label="뒤로 이동"
                    className="flex h-5 w-5 items-center justify-center bg-ink/70 text-xs text-paper disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="flex h-24 cursor-pointer flex-col items-center justify-center border border-dashed border-line-strong text-center text-sm text-ink-faint">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
          />
          {newFiles.length > 0 ? `새 이미지 ${newFiles.length}장 선택됨` : "이미지 추가"}
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
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} />
          오프라인 등에서 이미 판매되어 품절 처리
        </label>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
            {uploadStatus || (submitting ? "저장 중..." : "저장하기")}
          </button>

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-xs text-red-600 hover:underline"
            >
              작품 삭제
            </button>
          ) : (
            <span className="flex items-center gap-2 text-xs">
              정말 삭제하시겠습니까?
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                {deleting ? "삭제 중..." : "삭제 확인"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-ink-faint hover:underline"
              >
                취소
              </button>
            </span>
          )}
        </div>
        {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      </form>
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
