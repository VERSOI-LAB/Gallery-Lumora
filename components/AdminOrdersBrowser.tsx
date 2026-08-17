"use client";

import { useMemo, useState } from "react";
import { buttonClasses, tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import {
  adminUpdateArtworkOrderStatus,
  adminUpdateMerchOrderStatus,
  adminBulkUpdateArtworkOrderStatus,
  adminBulkUpdateMerchOrderStatus,
} from "@/lib/adminActions";
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("preparing");
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  function switchTab(next: "artwork" | "merch") {
    setTab(next);
    setSelected(new Set());
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

  const currentFiltered = tab === "artwork" ? filteredArtworkOrders : filteredMerchOrders;

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === currentFiltered.length ? new Set() : new Set(currentFiltered.map((o) => o.id))
    );
  }

  async function applyBulkStatus() {
    if (selected.size === 0) return;
    setBulkPending(true);
    setBulkError(null);
    const ids = Array.from(selected);
    try {
      if (tab === "artwork") {
        await adminBulkUpdateArtworkOrderStatus(ids, bulkStatus);
        setArtworkOrders((list) => list.map((o) => (ids.includes(o.id) ? { ...o, status: bulkStatus } : o)));
      } else {
        await adminBulkUpdateMerchOrderStatus(ids, bulkStatus);
        setMerchOrders((list) => list.map((o) => (ids.includes(o.id) ? { ...o, status: bulkStatus } : o)));
      }
      setSelected(new Set());
    } catch {
      setBulkError("일괄 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBulkPending(false);
    }
  }

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
          <button type="button" onClick={() => switchTab("artwork")} className={tabClasses(tab === "artwork")}>
            작품 주문 ({artworkOrders.length})
          </button>
          <button type="button" onClick={() => switchTab("merch")} className={tabClasses(tab === "merch")}>
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={currentFiltered.length > 0 && selected.size === currentFiltered.length}
            onChange={toggleSelectAll}
            className="accent-patina"
          />
          전체 선택 ({selected.size}건)
        </label>
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        >
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={selected.size === 0 || bulkPending}
          onClick={applyBulkStatus}
          className={`${buttonClasses("primary", "sm")} disabled:opacity-40`}
        >
          선택 항목 상태 일괄 변경
        </button>
        {bulkError && <p className="text-xs text-red-600">{bulkError}</p>}
      </div>

      {tab === "artwork" ? (
        filteredArtworkOrders.length === 0 ? (
          <p className="text-sm text-ink-faint">
            {artworkOrders.length === 0 ? "접수된 작품 주문이 없습니다." : "검색 결과가 없습니다."}
          </p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {filteredArtworkOrders.map((order) => (
              <div key={order.id} className="flex gap-3 py-4">
                <input
                  type="checkbox"
                  checked={selected.has(order.id)}
                  onChange={() => toggleSelected(order.id)}
                  className="mt-1 accent-patina"
                />
                <div className="min-w-0 flex-1">
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
            <div key={order.id} className="flex gap-3 py-4">
              <input
                type="checkbox"
                checked={selected.has(order.id)}
                onChange={() => toggleSelected(order.id)}
                className="mt-1 accent-patina"
              />
              <div className="min-w-0 flex-1">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
