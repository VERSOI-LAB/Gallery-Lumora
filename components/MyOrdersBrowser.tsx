"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import { buttonClasses } from "@/lib/ui";
import { formatKRW, formatDate } from "@/lib/format";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";
import { getMerchOrdersByPhone } from "@/lib/queries";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import type { MerchOrder } from "@/lib/types";

const LAST_PHONE_KEY = "lumora:mypage:phone";

export default function MyOrdersBrowser() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<MerchOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_PHONE_KEY);
    if (saved) setPhone(saved);
  }, []);

  async function lookup(targetPhone: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await getMerchOrdersByPhone(targetPhone);
      setOrders(result);
      localStorage.setItem(LAST_PHONE_KEY, targetPhone);
    } catch {
      setError("주문내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    lookup(phone.trim());
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="주문 시 입력한 연락처"
          className="h-10 flex-1 border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button type="submit" disabled={loading} className={buttonClasses("primary", "sm")}>
          {loading ? "조회 중..." : "조회"}
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {orders && (
        <div className="mt-8">
          {orders.length === 0 ? (
            <p className="text-sm text-ink-faint">해당 연락처로 조회된 굿즈 주문내역이 없습니다.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="border border-line p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden">
                      <PlaceholderArt
                        hue={order.hue}
                        variant={order.variant}
                        seed={order.productSlug || undefined}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
                            {getMerchCategoryLabel(order.productCategory)}
                          </span>
                          {order.productSlug ? (
                            <Link
                              href={`/shop/${order.productSlug}`}
                              className="mt-0.5 block truncate text-sm font-semibold text-ink hover:underline"
                            >
                              {order.productTitle}
                            </Link>
                          ) : (
                            <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                              {order.productTitle}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-ink-faint">{formatDate(order.createdAt)}</span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                        <span
                          className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}
                        >
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                        {order.variantLabel && <span>옵션 {order.variantLabel}</span>}
                        {order.editionNumber != null && <span>에디션 #{order.editionNumber}</span>}
                        <span>수량 {order.quantity}개</span>
                        <span>{order.paymentMethod}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-ink-faint">주문번호 {order.orderNumber}</span>
                        <span className="text-sm font-semibold text-ink">{formatKRW(order.amount)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
