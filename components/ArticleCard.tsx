import Link from "next/link";
import Image from "next/image";
import PlaceholderArt from "./PlaceholderArt";
import { formatDate } from "@/lib/format";
import { getJournalCategoryLabel } from "@/lib/journalTaxonomy";
import type { JournalPost } from "@/lib/types";

export default function ArticleCard({ post }: { post: JournalPost }) {
  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderArt
            hue={post.coverHue}
            variant={post.coverVariant}
            seed={post.slug}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="pt-2.5">
        <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
          {getJournalCategoryLabel(post.category)}
        </span>
        <h3 className="mt-1.5 text-sm leading-snug font-semibold text-ink">{post.title}</h3>
        <div className="mt-1 text-xs text-ink-faint">{formatDate(post.publishedAt)}</div>
      </div>
    </Link>
  );
}
