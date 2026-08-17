import Link from "next/link";
import { formatDate, formatKRW } from "@/lib/format";
import { ORDER_STATUS_BADGE_STYLE, ORDER_STATUS_LABEL } from "@/lib/orderStatus";
import type { ArtworkOrder, MerchOrder } from "@/lib/types";

const SHIPPING_METHOD_LABEL: Record<string, string> = {
  parcel: "택배",
  freight: "화물차 배송",
};

function ShippingInfoBlock({ order }: { order: ArtworkOrder | MerchOrder }) {
  if (!order.shippingMethod) {
    return <p className="text-sm text-ink-faint">아직 배송 정보가 등록되지 않았습니다. (작가가 배송중으로 변경 시 입력)</p>;
  }
  return (
    <div className="space-y-1 text-sm text-ink-soft">
      <p>배송 방식: {SHIPPING_METHOD_LABEL[order.shippingMethod] ?? order.shippingMethod}</p>
      {order.shippingMethod === "parcel" ? (
        <>
          {order.trackingCarrier && <p>택배사: {order.trackingCarrier}</p>}
          <p>송장번호: {order.trackingNumber}</p>
        </>
      ) : (
        <>
          <p>기사님 연락처: {order.courierPhone}</p>
          <p>차량번호: {order.vehicleNumber}</p>
          {order.courierName && <p>기사님 성함: {order.courierName}</p>}
        </>
      )}
    </div>
  );
}

export default function AdminOrderDetail({
  kind,
  order,
  customerArtworkOrders,
  customerMerchOrders,
}: {
  kind: "artwork" | "merch";
  order: ArtworkOrder | MerchOrder;
  customerArtworkOrders: ArtworkOrder[];
  customerMerchOrders: MerchOrder[];
}) {
  const title = kind === "artwork" ? (order as ArtworkOrder).artworkTitle : (order as MerchOrder).productTitle;
  const otherOrderCount =
    customerArtworkOrders.filter((o) => o.id !== order.id).length +
    customerMerchOrders.filter((o) => o.id !== order.id).length;

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-block text-xs text-ink-soft hover:underline">
        ← 주문 현황으로
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{title}</h1>
        <span className={`border px-2 py-1 text-xs ${ORDER_STATUS_BADGE_STYLE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border border-line p-4">
          <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">주문 정보</p>
          <div className="space-y-1 text-sm text-ink-soft">
            <p>주문번호: {order.orderNumber}</p>
            <p>주문일: {formatDate(order.createdAt)}</p>
            <p>결제금액: {formatKRW(order.amount)}</p>
            <p>결제수단: {order.paymentMethod}</p>
            {kind === "artwork" && (order as ArtworkOrder).artistPayoutAmount != null && (
              <p>작가 정산 예정액: {formatKRW((order as ArtworkOrder).artistPayoutAmount as number)}</p>
            )}
            {kind === "merch" && <p>굿즈 정산 예정액(로열티): {formatKRW((order as MerchOrder).royaltyAmount)}</p>}
          </div>
        </div>

        <div className="border border-line p-4">
          <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">구매자 정보</p>
          <div className="space-y-1 text-sm text-ink-soft">
            <p>{order.name || "이름 미입력"}</p>
            <p>{order.phone}</p>
            <p>{order.email || "이메일 미입력"}</p>
            <p>{order.shippingAddress}</p>
          </div>
        </div>

        <div className="border border-line p-4 sm:col-span-2">
          <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">배송 정보</p>
          <ShippingInfoBlock order={order} />
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          이 고객의 다른 주문 ({otherOrderCount}건)
        </p>
        {otherOrderCount === 0 ? (
          <p className="text-sm text-ink-faint">다른 주문 이력이 없습니다.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {customerArtworkOrders
              .filter((o) => o.id !== order.id)
              .map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/artwork/${o.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-paper-raised"
                >
                  <span>
                    {o.artworkTitle} · {formatDate(o.createdAt)}
                  </span>
                  <span className="flex items-center gap-3">
                    <span>{formatKRW(o.amount)}</span>
                    <span className={`border px-1.5 py-0.5 text-[10px] ${ORDER_STATUS_BADGE_STYLE[o.status]}`}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </span>
                </Link>
              ))}
            {customerMerchOrders
              .filter((o) => o.id !== order.id)
              .map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/merch/${o.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-paper-raised"
                >
                  <span>
                    {o.productTitle} · {formatDate(o.createdAt)}
                  </span>
                  <span className="flex items-center gap-3">
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
