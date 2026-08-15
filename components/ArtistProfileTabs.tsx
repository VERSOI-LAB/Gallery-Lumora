"use client";

import { useState } from "react";
import Link from "next/link";
import ArtworkCard from "./ArtworkCard";
import { buttonClasses } from "@/lib/ui";
import { getMediumTypeLabel } from "@/lib/mediumTaxonomy";
import type { Artist, Artwork } from "@/lib/types";

const TABS = ["작품", "소개", "커미션 조건"] as const;
type Tab = (typeof TABS)[number];

export default function ArtistProfileTabs({
  artist,
  works,
}: {
  artist: Artist;
  works: Artwork[];
}) {
  const [tab, setTab] = useState<Tab>("작품");

  return (
    <div className="pb-16">
      <div className="mb-8 flex gap-6 overflow-x-auto border-b border-line text-sm text-ink-faint">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px shrink-0 border-b-2 pb-3 ${
              tab === t ? "border-patina text-ink" : "border-transparent hover:text-ink"
            }`}
          >
            {t}
            {t === "작품" ? ` (${works.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "작품" && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {works.map((w) => (
            <ArtworkCard key={w.slug} artwork={w} />
          ))}
        </div>
      )}

      {tab === "소개" && (
        <p className="max-w-2xl text-sm leading-7 text-ink-soft">{artist.bio}</p>
      )}

      {tab === "커미션 조건" && (
        <div>
          {!artist.commission.accepting && (
            <p className="mb-6 border border-line bg-paper-raised px-4 py-3 text-sm text-ink-soft">
              현재 {artist.name} 작가는 신규 커미션을 받지 않고 있습니다. 대기 등록은 가능합니다.
            </p>
          )}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border border-line p-4">
              <div className="mb-1 text-xs text-ink-faint uppercase">가능 매체</div>
              <div className="text-sm font-semibold">
                {artist.commission.media.map(getMediumTypeLabel).join(" · ")}
              </div>
            </div>
            <div className="border border-line p-4">
              <div className="mb-1 text-xs text-ink-faint uppercase">평균 제작 기간</div>
              <div className="text-sm font-semibold">{artist.commission.leadTime}</div>
            </div>
            <div className="border border-line p-4">
              <div className="mb-1 text-xs text-ink-faint uppercase">커미션 가격대</div>
              <div className="text-sm font-semibold">{artist.commission.priceRange}</div>
            </div>
          </div>
          <Link href={`/artists/${artist.slug}/commission`} className={buttonClasses("primary")}>
            {artist.commission.accepting ? "커미션 의뢰하기" : "대기 등록하기"}
          </Link>
        </div>
      )}
    </div>
  );
}
