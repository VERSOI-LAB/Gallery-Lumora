"use client";

import { useEffect, useMemo, useState } from "react";
import { tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import { getArtworkOrdersForCurrentArtist, getMerchOrdersForCurrentArtist } from "@/lib/queries";
import type { ArtworkOrder, MerchOrder } from "@/lib/types";

// Fetches client-side (not passed as server-rendered props): the RLS check
// behind these queries relies on the browser Supabase client's session, the
// same as MyOrdersBrowser's logged-in view.
export default function ArtistSalesBrowser() {
  const [tab, setTab] = useState<"artwork" | "merch">("artwork");
  const [artworkOrders, setArtworkOrders] = useState<ArtworkOrder[] | null>(null);
  const [merchOrders, setMerchOrders] = useState<MerchOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getArtworkOrdersForCurrentArtist(), getMerchOrdersForCurrentArtist()])
      .then(([a, m]) => {
        setArtworkOrders(a);
        setMerchOrders(m);
      })
      .catch(() => setError("매출 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
  }, []);

  const artworkTotal = useMemo(
    () => (artworkOrders ?? []).filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.amount, 0),
    [artworkOrders]
  );
  const merchRoyaltyTotal = useMemo(
    () =>
      (merchOrders ?? [])
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.royaltyAmount, 0),
    [merchOrders]
  );

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (artworkOrders === null || merchOrders === null) {
    return <p className="text-sm text-ink-faint">불러오는 중...</p>;
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">작품 판매 총액</p>
          <p className="mt-1 text-xl font-semibold">{formatKRW(artworkTotal)}</p>
          <p className="mt-1 text-[11px] text-ink-faint">
            갤러리 수수료 차감 전 금액이며, 실제 정산액은 운영팀 안내를 따릅니다.
          </p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">굿즈 정산 예정액</p>
          <p className="mt-1 text-xl font-semibold">{formatKRW(merchRoyaltyTotal)}</p>
        </div>
      </div>

      <div className="mb-6 flex gap-6 border-b border-line">
        <button type="button" onClick={() => setTab("artwork")} className={tabClasses(tab === "artwork")}>
          작품 주문 ({artworkOrders.length})
        </button>
        <button type="button" onClick={() => setTab("merch")} className={tabClasses(tab === "merch")}>
          굿즈 주문 ({merchOrders.length})
        </button>
      </div>

      {tab === "artwork" ? (
        artworkOrders.length === 0 ? (
          <p className="text-sm text-ink-faint">아직 판매된 작품이 없습니다.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {artworkOrders.map((order) => (
              <div key={order.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{order.artworkTitle}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatKRW(order.amount)}</span>
                    <span
                      className={`border px-2 py-1 text-[11px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-ink-faint">
                  주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )
      ) : merchOrders.length === 0 ? (
        <p className="text-sm text-ink-faint">아직 판매된 굿즈가 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {merchOrders.map((order) => (
            <div key={order.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {order.productTitle}
                  {order.variantLabel && ` · ${order.variantLabel}`}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{formatKRW(order.amount)}</span>
                  <span className={`border px-2 py-1 text-[11px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-xs text-ink-faint">
                수량 {order.quantity} · 주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
