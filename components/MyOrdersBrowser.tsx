"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import MerchThumbnail from "./MerchThumbnail";
import { buttonClasses } from "@/lib/ui";
import { formatKRW, formatDate } from "@/lib/format";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";
import {
  cancelOrder,
  getArtworkOrdersByPhoneRpc,
  getMerchOrdersByPhone,
  getMyArtworkOrders,
  getMyMerchOrders,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import type { ArtworkOrder, MerchOrder } from "@/lib/types";

const LAST_PHONE_KEY = "lumora:mypage:phone";

function CancelOrderButton({
  status,
  pending,
  onCancel,
}: {
  status: ArtworkOrder["status"];
  pending: boolean;
  onCancel: () => void;
}) {
  if (status !== "paid" && status !== "preparing") return null;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onCancel}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "취소 처리 중..." : "주문 취소"}
    </button>
  );
}

function TrackingLine({ order }: { order: ArtworkOrder | MerchOrder }) {
  if (!order.shippingMethod) return null;
  if (order.shippingMethod === "parcel" && order.trackingNumber) {
    return (
      <p className="mt-1 text-xs text-ink-soft">
        송장번호 {order.trackingNumber}
        {order.trackingCarrier ? ` (${order.trackingCarrier})` : ""}
      </p>
    );
  }
  if (order.shippingMethod === "freight" && order.courierPhone) {
    return (
      <p className="mt-1 text-xs text-ink-soft">
        기사님 연락처 {order.courierPhone} · 차량번호 {order.vehicleNumber}
      </p>
    );
  }
  return null;
}

function MerchOrderRow({
  order,
  onCancel,
  cancelPending,
}: {
  order: MerchOrder;
  onCancel?: () => void;
  cancelPending?: boolean;
}) {
  return (
    <li className="border border-line p-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden">
          <MerchThumbnail
            imageUrls={order.imageUrls}
            hue={order.hue}
            variant={order.variant}
            seed={order.productSlug || "merch"}
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
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">{order.productTitle}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-ink-faint">{formatDate(order.createdAt)}</span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
            {order.variantLabel && <span>옵션 {order.variantLabel}</span>}
            {order.editionNumber != null && <span>에디션 #{order.editionNumber}</span>}
            <span>수량 {order.quantity}개</span>
            <span>{order.paymentMethod}</span>
          </div>
          <TrackingLine order={order} />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-faint">주문번호 {order.orderNumber}</span>
            <span className="text-sm font-semibold text-ink">{formatKRW(order.amount)}</span>
          </div>
          {onCancel && (
            <div className="mt-2 text-right">
              <CancelOrderButton status={order.status} pending={!!cancelPending} onCancel={onCancel} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ArtworkOrderRow({
  order,
  onCancel,
  cancelPending,
}: {
  order: ArtworkOrder;
  onCancel?: () => void;
  cancelPending?: boolean;
}) {
  return (
    <li className="border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">작품 주문</span>
          <Link
            href={`/works`}
            className="mt-0.5 block truncate text-sm font-semibold text-ink hover:underline"
          >
            {order.artworkTitle}
          </Link>
          <p className="mt-0.5 text-xs text-ink-faint">{order.artistName}</p>
        </div>
        <span className="shrink-0 text-xs text-ink-faint">{formatDate(order.createdAt)}</span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
        <span>{order.paymentMethod}</span>
        {order.insured && <span>보험 가입</span>}
      </div>
      <TrackingLine order={order} />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-ink-faint">주문번호 {order.orderNumber}</span>
        <span className="text-sm font-semibold text-ink">{formatKRW(order.amount)}</span>
      </div>
      {onCancel && (
        <div className="mt-2 text-right">
          <CancelOrderButton status={order.status} pending={!!cancelPending} onCancel={onCancel} />
        </div>
      )}
    </li>
  );
}

function LoggedInOrders() {
  const [artworkOrders, setArtworkOrders] = useState<ArtworkOrder[] | null>(null);
  const [merchOrders, setMerchOrders] = useState<MerchOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMyArtworkOrders(), getMyMerchOrders()])
      .then(([a, m]) => {
        setArtworkOrders(a);
        setMerchOrders(m);
      })
      .catch(() => setError("주문내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."));
  }, []);

  async function handleCancel(kind: "artwork" | "merch", id: string) {
    setCancellingId(id);
    try {
      await cancelOrder(kind, id);
      if (kind === "artwork") {
        setArtworkOrders((prev) =>
          prev ? prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)) : prev
        );
      } else {
        setMerchOrders((prev) =>
          prev ? prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)) : prev
        );
      }
    } catch {
      setError("주문 취소에 실패했습니다. 이미 배송이 시작되었을 수 있습니다.");
    } finally {
      setCancellingId(null);
    }
  }

  if (artworkOrders === null || merchOrders === null) {
    return <p className="text-sm text-ink-faint">불러오는 중...</p>;
  }
  if (artworkOrders.length === 0 && merchOrders.length === 0) {
    return <p className="text-sm text-ink-faint">아직 주문내역이 없습니다.</p>;
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {artworkOrders.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">작품 주문</p>
          <ul className="space-y-4">
            {artworkOrders.map((order) => (
              <ArtworkOrderRow
                key={order.id}
                order={order}
                onCancel={() => handleCancel("artwork", order.id)}
                cancelPending={cancellingId === order.id}
              />
            ))}
          </ul>
        </div>
      )}
      {merchOrders.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">굿즈 주문</p>
          <ul className="space-y-4">
            {merchOrders.map((order) => (
              <MerchOrderRow
                key={order.id}
                order={order}
                onCancel={() => handleCancel("merch", order.id)}
                cancelPending={cancellingId === order.id}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GuestPhoneLookup() {
  const [phone, setPhone] = useState("");
  const [artworkOrders, setArtworkOrders] = useState<ArtworkOrder[] | null>(null);
  const [merchOrders, setMerchOrders] = useState<MerchOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(kind: "artwork" | "merch", id: string) {
    setCancellingId(id);
    try {
      await cancelOrder(kind, id, phone.trim());
      if (kind === "artwork") {
        setArtworkOrders((prev) =>
          prev ? prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)) : prev
        );
      } else {
        setMerchOrders((prev) =>
          prev ? prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)) : prev
        );
      }
    } catch {
      setError("주문 취소에 실패했습니다. 이미 배송이 시작되었을 수 있습니다.");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(LAST_PHONE_KEY);
    if (saved) setPhone(saved);
  }, []);

  async function lookup(targetPhone: string) {
    setLoading(true);
    setError(null);
    try {
      const [artworkResult, merchResult] = await Promise.all([
        getArtworkOrdersByPhoneRpc(targetPhone),
        getMerchOrdersByPhone(targetPhone),
      ]);
      setArtworkOrders(artworkResult);
      setMerchOrders(merchResult);
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

      {artworkOrders && merchOrders && (
        <div className="mt-8 space-y-8">
          {artworkOrders.length === 0 && merchOrders.length === 0 ? (
            <p className="text-sm text-ink-faint">해당 연락처로 조회된 주문내역이 없습니다.</p>
          ) : (
            <>
              {artworkOrders.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    작품 주문
                  </p>
                  <ul className="space-y-4">
                    {artworkOrders.map((order) => (
                      <ArtworkOrderRow
                        key={order.id}
                        order={order}
                        onCancel={() => handleCancel("artwork", order.id)}
                        cancelPending={cancellingId === order.id}
                      />
                    ))}
                  </ul>
                </div>
              )}
              {merchOrders.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    굿즈 주문
                  </p>
                  <ul className="space-y-4">
                    {merchOrders.map((order) => (
                      <MerchOrderRow
                        key={order.id}
                        order={order}
                        onCancel={() => handleCancel("merch", order.id)}
                        cancelPending={cancellingId === order.id}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyOrdersBrowser() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  if (loggedIn === null) return null;
  return loggedIn ? <LoggedInOrders /> : <GuestPhoneLookup />;
}
