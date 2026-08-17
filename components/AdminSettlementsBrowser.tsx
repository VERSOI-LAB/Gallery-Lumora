"use client";

import { useMemo, useState } from "react";
import { buttonClasses, tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { adminMarkOrdersSettled } from "@/lib/adminActions";
import type { SettlementOrder } from "@/lib/queries";

export default function AdminSettlementsBrowser({ orders: initial }: { orders: SettlementOrder[] }) {
  const [orders, setOrders] = useState(initial);
  const [tab, setTab] = useState<"artwork" | "merch">("merch");
  const [settledFilter, setSettledFilter] = useState<"all" | "pending" | "settled">("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders
      .filter((o) => o.kind === tab)
      .filter((o) => o.status !== "cancelled")
      .filter((o) => {
        if (settledFilter === "pending") return !o.settledAt;
        if (settledFilter === "settled") return !!o.settledAt;
        return true;
      });
  }, [orders, tab, settledFilter]);

  const merchPendingTotal = useMemo(
    () =>
      orders
        .filter((o) => o.kind === "merch" && o.status !== "cancelled" && !o.settledAt)
        .reduce((sum, o) => sum + (o.payoutAmount ?? 0), 0),
    [orders]
  );
  const merchSettledTotal = useMemo(
    () =>
      orders
        .filter((o) => o.kind === "merch" && o.status !== "cancelled" && o.settledAt)
        .reduce((sum, o) => sum + (o.payoutAmount ?? 0), 0),
    [orders]
  );
  const artworkGrossTotal = useMemo(
    () => orders.filter((o) => o.kind === "artwork" && o.status !== "cancelled").reduce((sum, o) => sum + o.amount, 0),
    [orders]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((o) => o.id))));
  }

  async function applySettled(settled: boolean) {
    if (selected.size === 0) return;
    setPending(true);
    setError(null);
    const ids = Array.from(selected);
    try {
      await adminMarkOrdersSettled(tab, ids, settled);
      const settledAt = settled ? new Date().toISOString() : null;
      setOrders((prev) => prev.map((o) => (ids.includes(o.id) ? { ...o, settledAt } : o)));
      setSelected(new Set());
    } catch {
      setError("처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">굿즈 정산 대기</p>
          <p className="mt-1 text-xl font-semibold">{formatKRW(merchPendingTotal)}</p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">굿즈 정산 완료</p>
          <p className="mt-1 text-xl font-semibold">{formatKRW(merchSettledTotal)}</p>
        </div>
        <div className="border border-line p-4">
          <p className="text-xs text-ink-faint">작품 판매 총액 (수수료 차감 전)</p>
          <p className="mt-1 text-xl font-semibold">{formatKRW(artworkGrossTotal)}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-line">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => {
              setTab("merch");
              setSelected(new Set());
            }}
            className={tabClasses(tab === "merch")}
          >
            굿즈 주문
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("artwork");
              setSelected(new Set());
            }}
            className={tabClasses(tab === "artwork")}
          >
            작품 주문
          </button>
        </div>
        <select
          value={settledFilter}
          onChange={(e) => setSettledFilter(e.target.value as typeof settledFilter)}
          className="h-9 border border-line-strong bg-paper-raised px-2 text-sm outline-patina"
        >
          <option value="pending">정산 대기만</option>
          <option value="settled">정산 완료만</option>
          <option value="all">전체</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={toggleAll}
            className="accent-patina"
          />
          전체 선택 ({selected.size}건)
        </label>
        <button
          type="button"
          disabled={selected.size === 0 || pending}
          onClick={() => applySettled(true)}
          className={`${buttonClasses("primary", "sm")} disabled:opacity-40`}
        >
          정산 완료로 표시
        </button>
        <button
          type="button"
          disabled={selected.size === 0 || pending}
          onClick={() => applySettled(false)}
          className={`${buttonClasses("ghost", "sm")} disabled:opacity-40`}
        >
          정산 대기로 되돌리기
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint">해당 조건의 주문이 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map((order) => (
            <label key={order.id} className="flex cursor-pointer items-start gap-3 py-4">
              <input
                type="checkbox"
                checked={selected.has(order.id)}
                onChange={() => toggle(order.id)}
                className="mt-1 accent-patina"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {order.artistName} · {order.itemTitle}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      {order.payoutAmount != null ? formatKRW(order.payoutAmount) : formatKRW(order.amount)}
                    </span>
                    <span
                      className={`px-2 py-1 text-[11px] ${
                        order.settledAt ? "bg-ink text-paper" : "border border-line-strong text-ink-soft"
                      }`}
                    >
                      {order.settledAt ? "정산완료" : "정산대기"}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-ink-faint">
                  주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                  {order.settledAt && ` · ${formatDate(order.settledAt)} 정산`}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
