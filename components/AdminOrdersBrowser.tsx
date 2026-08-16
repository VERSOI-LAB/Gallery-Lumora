"use client";

import { useMemo, useState } from "react";
import { buttonClasses, tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { adminUpdateArtworkOrderStatus, adminUpdateMerchOrderStatus } from "@/lib/adminActions";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import { downloadCsv } from "@/lib/csv";
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
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  async function changeArtworkStatus(id: string, status: OrderStatus) {
    setPendingId(id);
    const prev = artworkOrders;
    setArtworkOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await adminUpdateArtworkOrderStatus(id, status);
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
      await adminUpdateMerchOrderStatus(id, status);
    } catch {
      setMerchOrders(prev);
    } finally {
      setPendingId(null);
    }
  }

  const term = keyword.trim().toLowerCase();

  const filteredArtworkOrders = useMemo(() => {
    return artworkOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!term) return true;
      return (
        o.artworkTitle.toLowerCase().includes(term) ||
        o.artistName.toLowerCase().includes(term) ||
        o.name.toLowerCase().includes(term) ||
        o.phone.includes(term) ||
        o.email.toLowerCase().includes(term) ||
        o.orderNumber.toLowerCase().includes(term)
      );
    });
  }, [artworkOrders, statusFilter, term]);

  const filteredMerchOrders = useMemo(() => {
    return merchOrders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!term) return true;
      return (
        o.productTitle.toLowerCase().includes(term) ||
        o.name.toLowerCase().includes(term) ||
        o.phone.includes(term) ||
        o.email.toLowerCase().includes(term) ||
        o.orderNumber.toLowerCase().includes(term)
      );
    });
  }, [merchOrders, statusFilter, term]);

  function exportCsv() {
    const today = new Date().toISOString().slice(0, 10);
    if (tab === "artwork") {
      downloadCsv(
        `lumora-artwork-orders-${today}.csv`,
        filteredArtworkOrders.map((o) => ({
          주문번호: o.orderNumber,
          작품명: o.artworkTitle,
          작가: o.artistName,
          금액: o.amount,
          상태: ORDER_STATUS_LABEL[o.status],
          이름: o.name,
          연락처: o.phone,
          이메일: o.email,
          배송지: o.shippingAddress,
          결제수단: o.paymentMethod,
          주문일: formatDate(o.createdAt),
        }))
      );
    } else {
      downloadCsv(
        `lumora-merch-orders-${today}.csv`,
        filteredMerchOrders.map((o) => ({
          주문번호: o.orderNumber,
          상품명: o.productTitle,
          옵션: o.variantLabel ?? "",
          수량: o.quantity,
          금액: o.amount,
          상태: ORDER_STATUS_LABEL[o.status],
          이름: o.name,
          연락처: o.phone,
          이메일: o.email,
          배송지: o.shippingAddress,
          결제수단: o.paymentMethod,
          주문일: formatDate(o.createdAt),
        }))
      );
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line">
        <div className="flex gap-6">
          <button type="button" onClick={() => setTab("artwork")} className={tabClasses(tab === "artwork")}>
            작품 주문 ({artworkOrders.length})
          </button>
          <button type="button" onClick={() => setTab("merch")} className={tabClasses(tab === "merch")}>
            굿즈 주문 ({merchOrders.length})
          </button>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={(tab === "artwork" ? filteredArtworkOrders : filteredMerchOrders).length === 0}
          className={`${buttonClasses("ghost", "sm")} mb-2 disabled:opacity-40`}
        >
          CSV 내보내기
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이름, 연락처, 이메일, 주문번호로 검색"
          className="h-9 flex-1 min-w-[200px] border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        >
          <option value="all">모든 상태</option>
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {tab === "artwork" ? (
        filteredArtworkOrders.length === 0 ? (
          <p className="text-sm text-ink-faint">
            {artworkOrders.length === 0 ? "접수된 작품 주문이 없습니다." : "검색 결과가 없습니다."}
          </p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {filteredArtworkOrders.map((order) => (
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
      ) : filteredMerchOrders.length === 0 ? (
        <p className="text-sm text-ink-faint">
          {merchOrders.length === 0 ? "접수된 굿즈 주문이 없습니다." : "검색 결과가 없습니다."}
        </p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filteredMerchOrders.map((order) => (
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
