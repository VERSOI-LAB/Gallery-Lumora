import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isHighValueArtwork } from "@/lib/format";
import { tossOrderIdPrefix } from "@/lib/tosspayments";

// TossPayments 결제위젯 시크릿 키(live_gsk_... / test_gsk_...). 서버에서만 사용하며 절대 커밋하지 마세요.
// 비워두면 TossPayments 문서에 공개된 테스트 전용 시크릿 키로 동작합니다(실 결제 승인 불가).
const TOSS_WIDGET_SECRET_KEY =
  process.env.TOSS_WIDGET_SECRET_KEY || "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const TOSS_API_BASE = "https://api.tosspayments.com/v1/payments";

interface PendingOrder {
  artworkId: string;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  insured: boolean;
  marketingOptIn: boolean;
}

function tossHeaders() {
  const basicAuth = Buffer.from(`${TOSS_WIDGET_SECRET_KEY}:`).toString("base64");
  return { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/json" };
}

async function cancelPayment(paymentKey: string, cancelReason: string) {
  const res = await fetch(`${TOSS_API_BASE}/${encodeURIComponent(paymentKey)}/cancel`, {
    method: "POST",
    headers: tossHeaders(),
    body: JSON.stringify({ cancelReason }),
  });
  if (!res.ok) {
    console.error("[toss] 결제 자동취소 실패", paymentKey, await res.text().catch(() => ""));
  }
  return res.ok;
}

function isValidOrder(order: unknown): order is PendingOrder {
  if (!order || typeof order !== "object") return false;
  const o = order as Record<string, unknown>;
  return (
    typeof o.artworkId === "string" &&
    typeof o.shippingAddress === "string" &&
    typeof o.phone === "string" &&
    typeof o.name === "string" &&
    typeof o.email === "string" &&
    typeof o.insured === "boolean" &&
    typeof o.marketingOptIn === "boolean"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { paymentKey, orderId, amount, order } = body ?? {};
  if (
    typeof paymentKey !== "string" ||
    typeof orderId !== "string" ||
    typeof amount !== "number" ||
    !isValidOrder(order)
  ) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!orderId.startsWith(tossOrderIdPrefix(order.artworkId))) {
    return NextResponse.json({ error: "주문 정보가 결제 정보와 일치하지 않습니다." }, { status: 400 });
  }

  // 결제위젯 금액은 브라우저에서 정해지므로, 승인 전에 DB의 작품 가격과 반드시 대조합니다.
  // 승인 요청을 보내지 않으면 TossPayments가 인증된 결제를 자동으로 만료시킵니다.
  const supabase = await createServerSupabaseClient();
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("price, sold")
    .eq("id", order.artworkId)
    .maybeSingle();
  if (artworkError || !artwork) {
    return NextResponse.json({ error: "작품 정보를 찾을 수 없습니다." }, { status: 404 });
  }
  if (artwork.sold) {
    return NextResponse.json({ error: "이미 판매완료된 작품입니다." }, { status: 409 });
  }
  if (isHighValueArtwork(artwork.price) || artwork.price !== amount) {
    return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
  }

  const confirmRes = await fetch(`${TOSS_API_BASE}/confirm`, {
    method: "POST",
    headers: tossHeaders(),
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const payment = await confirmRes.json();
  if (!confirmRes.ok) {
    return NextResponse.json(
      { error: payment.message || "결제 승인에 실패했습니다." },
      { status: confirmRes.status }
    );
  }

  // 가상계좌(WAITING_FOR_DEPOSIT) 등 즉시 완료되지 않는 결제는 입금 확인 웹훅이 없으므로 받지 않습니다.
  if (payment.status !== "DONE") {
    await cancelPayment(paymentKey, "즉시 결제가 완료되지 않는 결제수단");
    return NextResponse.json(
      { error: "해당 결제수단은 지원하지 않습니다. 카드·간편결제 등 다른 결제수단을 이용해주세요." },
      { status: 400 }
    );
  }

  const paymentMethod = `TossPayments ${payment.easyPay?.provider ?? payment.method ?? ""}`.trim();
  const { data: rows, error: purchaseError } = await supabase.rpc("purchase_artwork", {
    p_artwork_id: order.artworkId,
    p_shipping_address: order.shippingAddress,
    p_phone: order.phone,
    p_name: order.name,
    p_email: order.email,
    p_payment_method: paymentMethod,
    p_insured: order.insured,
    p_marketing_opt_in: order.marketingOptIn,
  });

  if (purchaseError || !rows?.[0]) {
    console.error("[toss] 주문 등록 실패", orderId, paymentKey, purchaseError);
    const canceled = await cancelPayment(paymentKey, "주문 등록 실패로 인한 자동취소");
    return NextResponse.json(
      {
        error: canceled
          ? "주문 등록에 실패하여 결제가 자동 취소되었습니다. 다시 시도해주세요."
          : `결제는 완료되었으나 주문 등록에 실패했습니다. 고객센터로 문의해주세요. (주문번호: ${orderId})`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orderNumber: rows[0].order_number,
    amount: rows[0].amount,
    paymentMethod,
  });
}
