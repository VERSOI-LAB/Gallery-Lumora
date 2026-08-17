"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ArtworkCard from "./ArtworkCard";
import ArtistCard from "./ArtistCard";
import MerchProductCard from "./MerchProductCard";
import ArticleCard from "./ArticleCard";
import { searchSite, type SearchResults } from "@/lib/search";

export default function SearchBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialQuery) {
      setResults(null);
      return;
    }
    setLoading(true);
    searchSite(initialQuery)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [initialQuery]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const total = results
    ? results.artists.length + results.artworks.length + results.merchProducts.length + results.journalPosts.length
    : 0;

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-10 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="작가, 작품, 굿즈, 저널 검색"
          className="h-11 flex-1 border border-line-strong bg-paper-raised px-4 text-sm outline-patina"
          autoFocus
        />
        <button type="submit" className="border border-ink px-5 text-sm font-medium hover:bg-ink hover:text-paper">
          검색
        </button>
      </form>

      {loading && <p className="text-sm text-ink-faint">검색 중...</p>}

      {!loading && initialQuery && results && total === 0 && (
        <p className="text-sm text-ink-faint">“{initialQuery}”에 대한 검색 결과가 없습니다.</p>
      )}

      {!loading && results && total > 0 && (
        <div className="space-y-12">
          {results.artists.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                작가 ({results.artists.length})
              </h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {results.artists.map((a) => (
                  <ArtistCard key={a.slug} artist={a} />
                ))}
              </div>
            </section>
          )}
          {results.artworks.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                작품 ({results.artworks.length})
              </h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {results.artworks.map((a) => (
                  <ArtworkCard key={a.slug} artwork={a} />
                ))}
              </div>
            </section>
          )}
          {results.merchProducts.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                굿즈 ({results.merchProducts.length})
              </h2>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {results.merchProducts.map((p) => (
                  <MerchProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
          {results.journalPosts.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                저널 ({results.journalPosts.length})
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
                {results.journalPosts.map((p) => (
                  <ArticleCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!initialQuery && (
        <p className="text-sm text-ink-faint">
          검색어를 입력해 작가, 작품, 굿즈, 저널을 한 번에 찾아보세요.{" "}
          <Link href="/works" className="underline">
            전체 작품 보기
          </Link>
        </p>
      )}
    </div>
  );
}
