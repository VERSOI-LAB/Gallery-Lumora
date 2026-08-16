"use client";

import { useState } from "react";
import { tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import type { ArtworkOrder, MerchOrder } from "@/lib/types";

export default function AdminOrdersBrowser({
  artworkOrders,
  merchOrders,
}: {
  artworkOrders: ArtworkOrder[];
  merchOrders: MerchOrder[];
}) {
  const [tab, setTab] = useState<"artwork" | "merch">("artwork");

  return (
    <div>
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
          <p className="text-sm text-ink-faint">접수된 작품 주문이 없습니다.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {artworkOrders.map((order) => (
              <div key={order.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{order.artworkTitle}</span>
                  <span className="text-sm">{formatKRW(order.amount)}</span>
                </div>
                <div className="mt-1 text-xs text-ink-faint">
                  {order.artistName} · 주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                </div>
                <div className="mt-1 text-xs text-ink-soft">
                  {order.name} · {order.phone} · {order.email}
                </div>
                <div className="mt-1 text-xs text-ink-soft">
                  {order.shippingAddress} · {order.paymentMethod}
                  {order.insured && " · 보험 가입"}
                </div>
              </div>
            ))}
          </div>
        )
      ) : merchOrders.length === 0 ? (
        <p className="text-sm text-ink-faint">접수된 굿즈 주문이 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {merchOrders.map((order) => (
            <div key={order.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold">
                  {order.productTitle}
                  {order.variantLabel && ` · ${order.variantLabel}`}
                  {order.editionNumber != null && ` · #${order.editionNumber}`}
                </span>
                <span className="text-sm">{formatKRW(order.amount)}</span>
              </div>
              <div className="mt-1 text-xs text-ink-faint">
                수량 {order.quantity} · 주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
              </div>
              <div className="mt-1 text-xs text-ink-soft">
                {order.name} · {order.phone} · {order.email}
              </div>
              <div className="mt-1 text-xs text-ink-soft">
                {order.shippingAddress} · {order.paymentMethod}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
