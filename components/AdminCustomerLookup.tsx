"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { getMerchOrdersByPhone } from "@/lib/queries";
import { adminGetArtworkOrdersByPhone } from "@/lib/adminActions";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import type { ArtworkOrder, MerchOrder } from "@/lib/types";

export default function AdminCustomerLookup() {
  const [phone, setPhone] = useState("");
  const [artworkOrders, setArtworkOrders] = useState<ArtworkOrder[] | null>(null);
  const [merchOrders, setMerchOrders] = useState<MerchOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [aOrders, mOrders] = await Promise.all([
        adminGetArtworkOrdersByPhone(phone.trim()),
        getMerchOrdersByPhone(phone.trim()),
      ]);
      setArtworkOrders(aOrders);
      setMerchOrders(mOrders);
    } catch {
      setError("주문내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  const totalOrders = (artworkOrders?.length ?? 0) + (merchOrders?.length ?? 0);
  const totalSpent =
    (artworkOrders?.reduce((sum, o) => sum + o.amount, 0) ?? 0) +
    (merchOrders?.reduce((sum, o) => sum + o.amount, 0) ?? 0);
  const searched = artworkOrders !== null && merchOrders !== null;

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex max-w-md gap-2">
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="고객 연락처 (주문 시 입력한 번호)"
          className="h-10 flex-1 border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button type="submit" disabled={loading} className={buttonClasses("primary", "sm")}>
          {loading ? "조회 중..." : "조회"}
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {searched && (
        <div className="mt-8">
          {totalOrders === 0 ? (
            <p className="text-sm text-ink-faint">해당 연락처로 조회된 주문이 없습니다.</p>
          ) : (
            <>
              <p className="mb-5 text-sm text-ink-soft">
                총 <span className="font-semibold text-ink">{totalOrders}건</span> 주문 ·{" "}
                <span className="font-semibold text-ink">{formatKRW(totalSpent)}</span> 누적 구매
              </p>

              {artworkOrders && artworkOrders.length > 0 && (
                <div className="mb-8">
                  <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    작품 주문 ({artworkOrders.length})
                  </p>
                  <div className="divide-y divide-line border-y border-line">
                    {artworkOrders.map((order) => (
                      <div key={order.id} className="py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{order.artworkTitle}</span>
                          <span className="text-sm">{formatKRW(order.amount)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-ink-faint">
                          <span
                            className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}
                          >
                            {ORDER_STATUS_LABEL[order.status]}
                          </span>
                          <span>
                            {order.artistName} · 주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {merchOrders && merchOrders.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    굿즈 주문 ({merchOrders.length})
                  </p>
                  <div className="divide-y divide-line border-y border-line">
                    {merchOrders.map((order) => (
                      <div key={order.id} className="py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {order.productTitle}
                            {order.variantLabel && ` · ${order.variantLabel}`}
                          </span>
                          <span className="text-sm">{formatKRW(order.amount)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-ink-faint">
                          <span
                            className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}
                          >
                            {ORDER_STATUS_LABEL[order.status]}
                          </span>
                          <span>
                            수량 {order.quantity} · 주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
