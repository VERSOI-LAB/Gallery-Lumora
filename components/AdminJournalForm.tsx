"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { adminCreateJournalPost, adminUpdateJournalPost } from "@/lib/adminActions";
import { uploadMedia, type JournalPostInput } from "@/lib/queries";
import { JOURNAL_CATEGORIES } from "@/lib/journalTaxonomy";
import type { JournalPost } from "@/lib/types";

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "post"}-${suffix}`;
}

export default function AdminJournalForm({ post }: { post?: JournalPost }) {
  const router = useRouter();
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState<JournalPostInput["category"]>(post?.category ?? "news");
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body.join("\n\n") ?? "");
  const [author, setAuthor] = useState(post?.author ?? "Lumora 편집팀");
  const [readMinutes, setReadMinutes] = useState(post?.readMinutes ?? 5);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.coverImageUrl ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCoverChange(file: File | null) {
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : (post?.coverImageUrl ?? null));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const finalSlug = slug || slugify(title);
    try {
      let coverImageUrl = post?.coverImageUrl ?? null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "jpg";
        coverImageUrl = await uploadMedia(`journal/${finalSlug}.${ext}`, coverFile);
      }
      const input: JournalPostInput = {
        slug: finalSlug,
        category,
        title,
        excerpt,
        body,
        author,
        readMinutes,
        coverHue: post?.coverHue ?? Math.floor(Math.random() * 360),
        coverVariant: post?.coverVariant ?? Math.floor(Math.random() * 3),
        coverImageUrl,
      };
      if (post) {
        await adminUpdateJournalPost(post.id, input);
      } else {
        await adminCreateJournalPost(input);
      }
      router.push("/admin/journal");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="커버 이미지">
        {coverPreview && (
          <div className="relative mb-3 aspect-[3/1] w-full overflow-hidden border border-line">
            <Image src={coverPreview} alt="" fill unoptimized className="object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink-soft file:mr-3 file:border file:border-line-strong file:bg-paper-raised file:px-3 file:py-2 file:text-sm file:text-ink"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="제목">
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
        <Field label="카테고리">
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as JournalPostInput["category"])}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          >
            {JOURNAL_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.nameKo}
              </option>
            ))}
          </select>
        </Field>
        <Field label="작성자">
          <input
            required
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="예상 읽기 시간(분)">
          <input
            required
            type="number"
            min={1}
            value={readMinutes}
            onChange={(e) => setReadMinutes(Number(e.target.value))}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
      </div>

      <Field label="요약">
        <input
          required
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="목록에 노출될 한 줄 요약"
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <Field label="본문 (빈 줄로 문단 구분)">
        <textarea
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
      </Field>

      <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
        {submitting ? "저장 중..." : post ? "수정 완료" : "게시하기"}
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
