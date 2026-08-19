"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArtworkCard from "./ArtworkCard";
import { buttonClasses, tabClasses } from "@/lib/ui";
import { MEDIUM_CATEGORIES, getMediumType, getMediumTypeLabel } from "@/lib/mediumTaxonomy";
import type { Artist, Artwork } from "@/lib/types";

const TABS = ["작품", "소개", "수상", "경력", "전시", "커미션 조건"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_ORDER = Object.fromEntries(MEDIUM_CATEGORIES.map((c, i) => [c.code, i]));

/** Groups works by their medium's category (회화, 공예, ... in taxonomy
 * order) before recency, so e.g. paintings consistently lead craft pieces
 * on an artist's profile even when the craft pieces were uploaded more
 * recently. Stable sort keeps each category's existing created_at order. */
function sortByMediumCategory(works: Artwork[]): Artwork[] {
  return [...works].sort((a, b) => {
    const orderA = CATEGORY_ORDER[getMediumType(a.mediumTypeCode)?.categoryCode ?? ""] ?? Infinity;
    const orderB = CATEGORY_ORDER[getMediumType(b.mediumTypeCode)?.categoryCode ?? ""] ?? Infinity;
    return orderA - orderB;
  });
}

export default function ArtistProfileTabs({
  artist,
  works,
}: {
  artist: Artist;
  works: Artwork[];
}) {
  const [tab, setTab] = useState<Tab>("작품");
  const sortedWorks = useMemo(() => sortByMediumCategory(works), [works]);

  return (
    <div className="pb-16">
      <div className="mb-8 flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`-mb-px shrink-0 ${tabClasses(tab === t)}`}>
            {t}
            {t === "작품" ? ` (${works.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "작품" && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {sortedWorks.map((w) => (
            <ArtworkCard key={w.slug} artwork={w} />
          ))}
        </div>
      )}

      {tab === "소개" && (
        <p className="max-w-2xl text-sm leading-7 text-ink-soft">{artist.bio}</p>
      )}

      {tab === "수상" &&
        (artist.awards ? (
          <p className="max-w-2xl text-sm leading-7 whitespace-pre-line text-ink-soft">{artist.awards}</p>
        ) : (
          <p className="text-sm text-ink-faint">등록된 수상 내역이 없습니다.</p>
        ))}

      {tab === "경력" &&
        (artist.career ? (
          <p className="max-w-2xl text-sm leading-7 whitespace-pre-line text-ink-soft">{artist.career}</p>
        ) : (
          <p className="text-sm text-ink-faint">등록된 경력이 없습니다.</p>
        ))}

      {tab === "전시" &&
        (artist.exhibitions ? (
          <p className="max-w-2xl text-sm leading-7 whitespace-pre-line text-ink-soft">{artist.exhibitions}</p>
        ) : (
          <p className="text-sm text-ink-faint">등록된 전시 이력이 없습니다.</p>
        ))}

      {tab === "커미션 조건" && (
        <div>
          {!artist.commission.accepting && (
            <p className="mb-6 border border-line bg-paper-raised px-4 py-3 text-sm text-ink-soft">
              현재 {artist.name} 작가는 신규 커미션을 받지 않고 있습니다. 대기 등록은 가능합니다.
            </p>
          )}
          <dl className="mb-8">
            {[
              { label: "가능 매체", value: artist.commission.media.map(getMediumTypeLabel).join(" · ") },
              { label: "평균 제작 기간", value: artist.commission.leadTime },
              { label: "커미션 가격대", value: artist.commission.priceRange },
              { label: "수정 횟수 (시안에 대해 요청할 수 있는 수정 횟수)", value: artist.commission.revisionCount },
              { label: "시안 (최종 작업 전 작가가 보여주는 초안/디자인)", value: artist.commission.draftProcess },
              { label: "최종 납품 형태 (완성작을 전달받는 방식)", value: artist.commission.deliveryFormat },
              { label: "저작권 이용범위 (완성작을 사용할 수 있는 범위)", value: artist.commission.copyrightScope },
              {
                label: "청약철회 제한 여부 (주문 후 법적으로 취소가 제한될 수 있는지)",
                value: artist.commission.withdrawalPolicy,
              },
            ]
              .filter((row) => row.value)
              .map((row, i) => (
                <div
                  key={row.label}
                  className={`flex flex-col gap-1 py-3 sm:flex-row sm:gap-6 ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <dt className="w-full flex-none text-xs tracking-wide text-ink-faint uppercase sm:w-36">
                    {row.label}
                  </dt>
                  <dd className="text-sm font-semibold">{row.value}</dd>
                </div>
              ))}
          </dl>
          <Link href={`/artists/${artist.slug}/commission`} className={buttonClasses("primary")}>
            {artist.commission.accepting ? "커미션 의뢰하기" : "대기 등록하기"}
          </Link>
        </div>
      )}
    </div>
  );
}
