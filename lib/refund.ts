import "server-only";
import { supabaseService } from "./supabase/service";
import { findTossPaymentKeyByOrderId, refundTossPayment } from "./tossServer";

export type OrderKind = "artwork" | "merch";

export interface RefundableOrder {
  id: string;
  orderNumber: string;
  amount: number;
  status: string;
  phone: string;
  userId: string | null;
  paymentKey: string | null;
  tossOrderId: string | null;
  refundedAt: string | null;
  artworkId: string | null;
  productId: string | null;
  editionNumber: number | null;
}

export async function getRefundableOrder(kind: OrderKind, id: string): Promise<RefundableOrder | null> {
  if (kind === "artwork") {
    const { data } = await supabaseService
      .from("orders")
      .select("id, order_number, amount, status, phone, user_id, payment_key, toss_order_id, refunded_at, artwork_id")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      orderNumber: data.order_number,
      amount: data.amount,
      status: data.status,
      phone: data.phone,
      userId: data.user_id,
      paymentKey: data.payment_key,
      tossOrderId: data.toss_order_id,
      refundedAt: data.refunded_at,
      artworkId: data.artwork_id,
      productId: null,
      editionNumber: null,
    };
  }
  const { data } = await supabaseService
    .from("merch_orders")
    .select(
      "id, order_number, amount, status, phone, user_id, payment_key, toss_order_id, refunded_at, product_id, edition_number"
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    orderNumber: data.order_number,
    amount: data.amount,
    status: data.status,
    phone: data.phone,
    userId: data.user_id,
    paymentKey: data.payment_key,
    tossOrderId: data.toss_order_id,
    refundedAt: data.refunded_at,
    artworkId: null,
    productId: data.product_id,
    editionNumber: data.edition_number,
  };
}

/** 토스 결제를 취소(환불)하고 주문을 취소 처리합니다. 장바구니 결제는 여러 주문이 같은 결제를
 * 공유하므로 항상 해당 주문 금액만큼만 취소합니다. 작품은 다시 판매 가능 상태로, 한정판 굿즈는
 * 해당 에디션을 다시 판매 가능하게 되돌립니다. */
export async function refundOrder(
  kind: OrderKind,
  order: RefundableOrder,
  reason: string
): Promise<{ ok: true; alreadyCanceled: boolean } | { ok: false; error: string }> {
  if (order.refundedAt) return { ok: false, error: "이미 환불된 주문입니다." };

  let paymentKey = order.paymentKey;
  if (!paymentKey && order.tossOrderId) {
    const found = await findTossPaymentKeyByOrderId(order.tossOrderId);
    if ("error" in found) return { ok: false, error: found.error };
    paymentKey = found.paymentKey;
  }
  if (!paymentKey) {
    return {
      ok: false,
      error: "결제 정보가 없어 자동 환불할 수 없습니다. 토스페이먼츠 상점관리자에서 직접 취소해주세요.",
    };
  }

  const refunded = await refundTossPayment(paymentKey, reason, order.amount);
  if (!refunded.ok) return { ok: false, error: refunded.message };

  const now = new Date().toISOString();
  if (kind === "artwork") {
    const { error } = await supabaseService
      .from("orders")
      .update({ status: "cancelled", refunded_at: now, payment_key: paymentKey })
      .eq("id", order.id);
    if (error) console.error("[refund] 작품 주문 상태 갱신 실패", order.orderNumber, error);
    if (order.artworkId) {
      await supabaseService.from("artworks").update({ sold: false }).eq("id", order.artworkId);
    }
  } else {
    const { error } = await supabaseService
      .from("merch_orders")
      .update({ status: "cancelled", refunded_at: now, payment_key: paymentKey })
      .eq("id", order.id);
    if (error) console.error("[refund] 굿즈 주문 상태 갱신 실패", order.orderNumber, error);
    if (order.productId && order.editionNumber != null) {
      await supabaseService
        .from("merch_editions")
        .update({ sold: false })
        .eq("product_id", order.productId)
        .eq("edition_number", order.editionNumber);
    }
  }
  return { ok: true, alreadyCanceled: refunded.alreadyCanceled };
}
