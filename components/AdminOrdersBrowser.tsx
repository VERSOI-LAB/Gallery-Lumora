"use client";

import { useState } from "react";
import { tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { updateArtworkOrderStatus, updateMerchOrderStatus } from "@/lib/queries";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import type { ArtworkOrder, MerchOrder, OrderStatus } from "@/lib/types";

function StatusSelect({
  status,
  pending,
  onChange,
}: {
  status: OrderStatus;
  pending: boolean;
  onChange: (status: OrderStatus) => void;
}) {
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className={`border px-2 py-1 text-[11px] outline-none disabled:opacity-50 ${ORDER_STATUS_BADGE_STYLE[status]}`}
    >
      {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export default function AdminOrdersBrowser({
  artworkOrders: initialArtworkOrders,
  merchOrders: initialMerchOrders,
}: {
  artworkOrders: ArtworkOrder[];
  merchOrders: MerchOrder[];
}) {
  const [tab, setTab] = useState<"artwork" | "merch">("artwork");
  const [artworkOrders, setArtworkOrders] = useState(initialArtworkOrders);
  const [merchOrders, setMerchOrders] = useState(initialMerchOrders);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function changeArtworkStatus(id: string, status: OrderStatus) {
    setPendingId(id);
    const prev = artworkOrders;
    setArtworkOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateArtworkOrderStatus(id, status);
    } catch {
      setArtworkOrders(prev);
    } finally {
      setPendingId(null);
    }
  }

  async function changeMerchStatus(id: string, status: OrderStatus) {
    setPendingId(id);
    const prev = merchOrders;
    setMerchOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateMerchOrderStatus(id, status);
    } catch {
      setMerchOrders(prev);
    } finally {
      setPendingId(null);
    }
  }

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
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatKRW(order.amount)}</span>
                    <StatusSelect
                      status={order.status}
                      pending={pendingId === order.id}
                      onChange={(status) => changeArtworkStatus(order.id, status)}
                    />
                  </div>
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
                <div className="flex items-center gap-3">
                  <span className="text-sm">{formatKRW(order.amount)}</span>
                  <StatusSelect
                    status={order.status}
                    pending={pendingId === order.id}
                    onChange={(status) => changeMerchStatus(order.id, status)}
                  />
                </div>
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
