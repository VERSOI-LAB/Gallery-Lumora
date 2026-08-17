"use client";

import { useState } from "react";
import Link from "next/link";
import ArtworkThumbnail from "./ArtworkThumbnail";
import MerchThumbnail from "./MerchThumbnail";
import { formatDate, formatKRW } from "@/lib/format";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import { adminUpdateCustomerMarketingOptIn } from "@/lib/adminActions";
import type { CustomerDetail } from "@/lib/queries";

export default function AdminCustomerDetail({ detail }: { detail: CustomerDetail }) {
  const { customer, artworkOrders, merchOrders, notifications } = detail;
  const [optIn, setOptIn] = useState(customer.marketingOptIn);
  const [pending, setPending] = useState(false);

  async function toggleOptIn() {
    const next = !optIn;
    setPending(true);
    setOptIn(next);
    try {
      await adminUpdateCustomerMarketingOptIn(customer.id, next);
    } catch {
      setOptIn(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 inline-block text-xs text-ink-soft hover:underline">
        ← 고객 관리로
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">{customer.name || "이름 미입력"}</h1>
          <p className="text-sm text-ink-soft">
            {customer.phone} · {customer.email || "이메일 미입력"}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={optIn} disabled={pending} onChange={toggleOptIn} className="accent-patina" />
          마케팅 이메일 수신 동의
        </label>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">누적 주문</p>
          <p className="mt-1 text-lg font-semibold">{customer.orderCount}건</p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">누적 구매액</p>
          <p className="mt-1 text-lg font-semibold">{formatKRW(customer.totalSpent)}</p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">취향 태그</p>
          <p className="mt-1 text-sm font-medium">
            {customer.preferenceTags.length > 0 ? customer.preferenceTags.join(", ") : "데이터 부족"}
          </p>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="mb-8 border-t border-line pt-5">
          <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">알림 발송 이력</p>
          <ul className="space-y-1 text-sm text-ink-soft">
            {notifications.map((n) => (
              <li key={n.id}>
                {formatDate(n.sentAt)} · {n.subject}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-line pt-5">
        <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          주문 내역 ({artworkOrders.length + merchOrders.length}건)
        </p>
        {artworkOrders.length === 0 && merchOrders.length === 0 ? (
          <p className="text-sm text-ink-faint">주문 내역이 없습니다.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {artworkOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/artwork/${o.id}`}
                className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-paper-raised"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden">
                    <ArtworkThumbnail imageUrls={o.imageUrls} hue={o.hue} variant={o.variant} seed={o.id} className="h-full w-full" />
                  </span>
                  <span className="truncate">
                    {o.artworkTitle} · {formatDate(o.createdAt)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span>{formatKRW(o.amount)}</span>
                  <span className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[o.status]}`}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </span>
              </Link>
            ))}
            {merchOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/merch/${o.id}`}
                className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-paper-raised"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden">
                    <MerchThumbnail imageUrls={o.imageUrls} hue={o.hue} variant={o.variant} seed={o.id} className="h-full w-full" />
                  </span>
                  <span className="truncate">
                    {o.productTitle} · {formatDate(o.createdAt)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span>{formatKRW(o.amount)}</span>
                  <span className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[o.status]}`}>
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
