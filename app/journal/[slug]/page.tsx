import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import PlaceholderArt from "@/components/PlaceholderArt";
import {
  getArtistById,
  getArtworkById,
  getJournalPost,
  getJournalPostSlugs,
  getRelatedJournalPosts,
} from "@/lib/queries";
import { formatDate, formatKRW } from "@/lib/format";
import { getJournalCategoryLabel } from "@/lib/journalTaxonomy";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";

export async function generateStaticParams() {
  const slugs = await getJournalPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) notFound();

  const [relatedArtist, relatedArtwork, morePosts] = await Promise.all([
    post.relatedArtistId ? getArtistById(post.relatedArtistId) : null,
    post.relatedArtworkId ? getArtworkById(post.relatedArtworkId) : null,
    getRelatedJournalPosts(post.slug, 3),
  ]);
  const relatedCategory = post.relatedMediumCategoryCode
    ? MEDIUM_CATEGORIES.find((c) => c.code === post.relatedMediumCategoryCode)
    : null;
  const hasRelated = relatedArtist || relatedArtwork || relatedCategory;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <PlaceholderArt
        hue={post.coverHue}
        variant={post.coverVariant}
        seed={post.slug}
        className="mb-8 aspect-[3/1] w-full"
      />

      <div className="mx-auto max-w-2xl">
        <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
          {getJournalCategoryLabel(post.category)}
        </span>
        <h1 className="font-editorial mt-2 mb-3 text-2xl leading-snug italic md:text-3xl">{post.title}</h1>
        <div className="mb-8 text-xs text-ink-faint">
          {formatDate(post.publishedAt)} · {post.readMinutes}분 읽기 · {post.author}
        </div>

        <div className="space-y-5 text-[15px] leading-8 text-ink-soft">
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {hasRelated && (
          <div className="mt-12 border border-patina p-6">
            <p className="mb-4 text-xs font-semibold tracking-wide text-patina uppercase">
              이 글과 연결된 작가·작품
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {relatedArtist && (
                <Link href={`/artists/${relatedArtist.slug}`} className="group block text-center">
                  <div className="mx-auto mb-2 h-20 w-20 overflow-hidden rounded-full border border-line">
                    <PlaceholderArt
                      hue={relatedArtist.hue}
                      seed={relatedArtist.slug}
                      kind="portrait"
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-sm font-medium">{relatedArtist.name}</div>
                  <div className="text-xs text-ink-faint">{relatedArtist.styleTags[0]}</div>
                </Link>
              )}
              {relatedArtwork && (
                <Link href={`/works/${relatedArtwork.slug}`} className="group block text-center">
                  <div className="mx-auto mb-2 aspect-square w-20 overflow-hidden">
                    <PlaceholderArt
                      hue={relatedArtwork.hue}
                      variant={relatedArtwork.variant}
                      seed={relatedArtwork.slug}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-sm font-medium">{relatedArtwork.title}</div>
                  <div className="text-xs text-ink-faint">{formatKRW(relatedArtwork.price)}</div>
                </Link>
              )}
              {relatedCategory && (
                <Link href="/works" className="group flex flex-col items-center justify-center text-center">
                  <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center border border-line text-2xl text-ink-faint transition-colors group-hover:border-patina group-hover:text-patina">
                    →
                  </div>
                  <div className="text-sm font-medium">
                    {relatedCategory.number}. {relatedCategory.nameKo}
                  </div>
                  <div className="text-xs text-ink-faint">매체 카테고리 보기</div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {morePosts.length > 0 && (
        <div className="mt-16">
          <p className="mb-5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            더 읽어보기
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
            {morePosts.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
