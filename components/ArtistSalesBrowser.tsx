"use client";

import { useEffect, useMemo, useState } from "react";
import { tabClasses } from "@/lib/ui";
import { formatDate, formatKRW } from "@/lib/format";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import {
  getArtworkOrdersForCurrentArtist,
  getMerchOrdersForCurrentArtist,
  updateOrderShippingStatus,
} from "@/lib/queries";
import type { ArtworkOrder, MerchOrder, OrderStatus } from "@/lib/types";

const EDITABLE_STATUSES: OrderStatus[] = ["preparing", "shipped", "delivered", "cancelled"];
const OVERDUE_DAYS = 7;

function isOverdue(order: ArtworkOrder | MerchOrder): boolean {
  if (order.status === "shipped" || order.status === "delivered" || order.status === "cancelled") return false;
  const daysSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceOrder > OVERDUE_DAYS;
}

function OrderStatusEditor({
  order,
  kind,
  onUpdated,
}: {
  order: ArtworkOrder | MerchOrder;
  kind: "artwork" | "merch";
  onUpdated: (next: ArtworkOrder | MerchOrder) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);
  const [shippingMethod, setShippingMethod] = useState<"parcel" | "freight">(
    (order.shippingMethod as "parcel" | "freight" | null) ?? "parcel"
  );
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [courierPhone, setCourierPhone] = useState(order.courierPhone ?? "");
  const [vehicleNumber, setVehicleNumber] = useState(order.vehicleNumber ?? "");
  const [expectedShipDate, setExpectedShipDate] = useState(order.expectedShipDate ?? "");
  const [delayReason, setDelayReason] = useState(order.delayReason ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overdue = isOverdue(order);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await updateOrderShippingStatus(kind, order.id, {
        status: nextStatus,
        shippingMethod: nextStatus === "shipped" ? shippingMethod : undefined,
        trackingNumber: nextStatus === "shipped" && shippingMethod === "parcel" ? trackingNumber : undefined,
        courierPhone: nextStatus === "shipped" && shippingMethod === "freight" ? courierPhone : undefined,
        vehicleNumber: nextStatus === "shipped" && shippingMethod === "freight" ? vehicleNumber : undefined,
        expectedShipDate: expectedShipDate || undefined,
        delayReason: overdue ? delayReason : undefined,
      });
      onUpdated({
        ...order,
        status: nextStatus,
        shippingMethod: nextStatus === "shipped" ? shippingMethod : order.shippingMethod,
        trackingNumber: nextStatus === "shipped" && shippingMethod === "parcel" ? trackingNumber : order.trackingNumber,
        courierPhone: nextStatus === "shipped" && shippingMethod === "freight" ? courierPhone : order.courierPhone,
        vehicleNumber: nextStatus === "shipped" && shippingMethod === "freight" ? vehicleNumber : order.vehicleNumber,
        expectedShipDate: expectedShipDate || order.expectedShipDate,
        delayReason: overdue ? delayReason : order.delayReason,
      });
      setEditing(false);
    } catch {
      setError("배송 정보 입력이 필요하거나 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!editing) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`border px-2 py-1 text-[11px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </button>
        {overdue && (
          <span className="border border-red-600 px-1.5 py-1 text-[11px] font-semibold text-red-600">
            배송 지연
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="w-full border border-line-strong bg-paper-raised p-3 text-xs">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <select
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
          className="h-8 border border-line-strong bg-paper px-2 text-xs outline-patina"
        >
          {EDITABLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {nextStatus === "shipped" && (
          <div className="flex gap-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={shippingMethod === "parcel"}
                onChange={() => setShippingMethod("parcel")}
                className="accent-patina"
              />
              택배
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={shippingMethod === "freight"}
                onChange={() => setShippingMethod("freight")}
                className="accent-patina"
              />
              화물차 배송
            </label>
          </div>
        )}
      </div>

      {nextStatus === "shipped" && (
        <div className="mb-2 space-y-2">
          {shippingMethod === "parcel" ? (
            <input
              type="text"
              required
              placeholder="송장번호"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="h-8 w-full border border-line-strong bg-paper px-2 text-xs outline-patina"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                required
                placeholder="기사님 연락처"
                value={courierPhone}
                onChange={(e) => setCourierPhone(e.target.value)}
                className="h-8 flex-1 border border-line-strong bg-paper px-2 text-xs outline-patina"
              />
              <input
                type="text"
                required
                placeholder="차량번호"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="h-8 flex-1 border border-line-strong bg-paper px-2 text-xs outline-patina"
              />
            </div>
          )}
        </div>
      )}

      <div className="mb-2">
        <label className="mb-1 block text-[11px] text-ink-soft">납기 (예상 발송일)</label>
        <input
          type="date"
          value={expectedShipDate}
          onChange={(e) => setExpectedShipDate(e.target.value)}
          className="h-8 border border-line-strong bg-paper px-2 text-xs outline-patina"
        />
      </div>

      {overdue && (
        <div className="mb-2 border border-red-600 bg-red-50 p-2">
          <p className="mb-1.5 text-[11px] font-semibold text-red-600">
            주문 후 {OVERDUE_DAYS}일이 지났습니다. 배송 지연 사유를 작성해주세요.
          </p>
          <textarea
            required
            rows={2}
            placeholder="배송 지연 사유"
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            className="w-full border border-line-strong bg-paper px-2 py-1.5 text-xs outline-patina"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={handleConfirm}
          className="border border-patina bg-patina px-2 py-1 text-[11px] text-paper disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "확인"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-[11px] text-ink-soft hover:underline">
          취소
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

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
  const artworkPayoutTotal = useMemo(
    () =>
      (artworkOrders ?? [])
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + (o.artistPayoutAmount ?? 0), 0),
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
          <p className="text-xs text-ink-faint">작품 판매 총액 (수수료 차감 전)</p>
          <p className="mt-1 text-xl font-semibold">{formatKRW(artworkTotal)}</p>
          <p className="mt-1 text-sm text-patina">실수령 예정액 {formatKRW(artworkPayoutTotal)}</p>
          <p className="mt-1 text-[11px] text-ink-faint">
            작가 정산비율이 반영된 예상 금액이며, 실제 정산은 운영팀 안내를 따릅니다.
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

      <p className="mb-4 text-xs text-ink-faint">
        상태 배지를 클릭하면 변경할 수 있습니다. "배송중"으로 바꾸려면 배송 방식과 송장번호(택배) 또는 기사님
        연락처·차량번호(화물차)를 입력해야 합니다.
      </p>

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
                    <OrderStatusEditor
                      order={order}
                      kind="artwork"
                      onUpdated={(next) =>
                        setArtworkOrders((list) =>
                          (list ?? []).map((o) => (o.id === order.id ? (next as ArtworkOrder) : o))
                        )
                      }
                    />
                  </div>
                </div>
                <div className="mt-1 text-xs text-ink-faint">
                  주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                  {order.artistPayoutAmount != null && ` · 실수령 예정 ${formatKRW(order.artistPayoutAmount)}`}
                  {order.expectedShipDate && ` · 납기 ${order.expectedShipDate}`}
                </div>
                {order.delayReason && (
                  <div className="mt-1 text-xs text-red-600">지연 사유: {order.delayReason}</div>
                )}
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
                  <OrderStatusEditor
                    order={order}
                    kind="merch"
                    onUpdated={(next) =>
                      setMerchOrders((list) => (list ?? []).map((o) => (o.id === order.id ? (next as MerchOrder) : o)))
                    }
                  />
                </div>
              </div>
              <div className="mt-1 text-xs text-ink-faint">
                수량 {order.quantity} · 주문번호 {order.orderNumber} · {formatDate(order.createdAt)}
                {order.expectedShipDate && ` · 납기 ${order.expectedShipDate}`}
              </div>
              {order.delayReason && (
                <div className="mt-1 text-xs text-red-600">지연 사유: {order.delayReason}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
