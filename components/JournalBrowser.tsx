"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ArticleCard from "@/components/ArticleCard";
import PlaceholderArt from "@/components/PlaceholderArt";
import { tabClasses } from "@/lib/ui";
import { formatDate } from "@/lib/format";
import { JOURNAL_CATEGORIES, getJournalCategoryLabel } from "@/lib/journalTaxonomy";
import type { JournalPost } from "@/lib/types";

export default function JournalBrowser({ posts }: { posts: JournalPost[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const featured = posts[0];
  const showFeatured = category === null && keyword.trim() === "";

  const filtered = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    let list = category === null ? posts : posts.filter((p) => p.category === category);
    if (term) {
      list = list.filter(
        (p) => p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term)
      );
    }
    if (showFeatured) {
      list = list.filter((p) => p.slug !== featured?.slug);
    }
    return list;
  }, [posts, category, keyword, showFeatured, featured]);

  return (
    <div>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="제목, 내용으로 검색"
        className="mb-6 h-10 w-full max-w-sm border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
      />

      <div className="mb-6 flex flex-wrap gap-6 border-b border-line">
        <button type="button" onClick={() => setCategory(null)} className={tabClasses(category === null, "sm")}>
          전체
        </button>
        {JOURNAL_CATEGORIES.map((c) => (
          <button key={c.code} type="button" onClick={() => setCategory(c.code)} className={tabClasses(category === c.code, "sm")}>
            {c.nameKo}
          </button>
        ))}
      </div>

      {showFeatured && featured && (
        <Link
          href={`/journal/${featured.slug}`}
          className="group mb-10 grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10"
        >
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
            {featured.coverImageUrl ? (
              <Image
                src={featured.coverImageUrl}
                alt={featured.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <PlaceholderArt
                hue={featured.coverHue}
                variant={featured.coverVariant}
                seed={featured.slug}
                className="h-full w-full min-h-[200px] transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
              {getJournalCategoryLabel(featured.category)}
            </span>
            <h2 className="mt-2 font-display text-xl leading-snug md:text-2xl">{featured.title}</h2>
            <p className="mt-3 text-sm text-ink-soft">{featured.excerpt}</p>
            <div className="mt-4 text-xs text-ink-faint">
              {formatDate(featured.publishedAt)} · {featured.readMinutes}분 읽기
            </div>
          </div>
        </Link>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {filtered.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-ink-faint">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
