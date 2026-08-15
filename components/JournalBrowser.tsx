"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import PlaceholderArt from "@/components/PlaceholderArt";
import { formatDate } from "@/lib/format";
import { JOURNAL_CATEGORIES, getJournalCategoryLabel } from "@/lib/journalTaxonomy";
import type { JournalPost } from "@/lib/types";

export default function JournalBrowser({ posts }: { posts: JournalPost[] }) {
  const [category, setCategory] = useState<string | null>(null);

  const featured = posts[0];
  const rest = posts.slice(1);

  const filtered = useMemo(() => {
    if (!category) return rest;
    return posts.filter((p) => p.category === category);
  }, [posts, rest, category]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={`border px-3 py-1.5 text-xs ${
            category === null ? "border-patina text-patina font-semibold" : "border-line text-ink-soft"
          }`}
        >
          전체
        </button>
        {JOURNAL_CATEGORIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setCategory(c.code)}
            className={`border px-3 py-1.5 text-xs ${
              category === c.code ? "border-patina text-patina font-semibold" : "border-line text-ink-soft"
            }`}
          >
            {c.nameKo}
          </button>
        ))}
      </div>

      {category === null && featured && (
        <Link
          href={`/journal/${featured.slug}`}
          className="group mb-10 grid grid-cols-1 gap-0 border border-line md:grid-cols-[1.1fr_1fr]"
        >
          <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
            <PlaceholderArt
              hue={featured.coverHue}
              variant={featured.coverVariant}
              className="h-full w-full min-h-[200px] transition-transform duration-500 group-hover:scale-105"
            />
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
        <p className="py-16 text-center text-sm text-ink-faint">아직 이 카테고리의 글이 없습니다.</p>
      )}
    </div>
  );
}
