import { NextRequest, NextResponse, after } from "next/server";
import { isValidPhone } from "@/lib/phone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import { isHighValueArtwork } from "@/lib/format";
import { tossOrderIdPrefix } from "@/lib/tosspayments";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { cancelTossPayment, confirmTossPayment, tossPaymentMethodLabel } from "@/lib/tossServer";

interface PendingOrder {
  artworkId: string;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  insured: boolean;
  marketingOptIn: boolean;
}

function isValidOrder(order: unknown): order is PendingOrder {
  if (!order || typeof order !== "object") return false;
  const o = order as Record<string, unknown>;
  return (
    typeof o.artworkId === "string" &&
    typeof o.shippingAddress === "string" &&
    typeof o.phone === "string" &&
    isValidPhone(o.phone) &&
    typeof o.name === "string" &&
    typeof o.email === "string" &&
    typeof o.insured === "boolean" &&
    typeof o.marketingOptIn === "boolean"
  );
}

export async function POST(req: NextRequest) {
  // 비회원 결제는 받지 않습니다. 토스 승인 전에 거부하므로 결제는 일어나지 않습니다.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인 후 결제할 수 있습니다." }, { status: 401 });
  }

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
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("title, price, sold")
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

  const confirmed = await confirmTossPayment(paymentKey, orderId, amount);
  if (!confirmed.ok) {
    return NextResponse.json({ error: confirmed.message }, { status: confirmed.status });
  }
  const { payment } = confirmed;

  // 가상계좌(WAITING_FOR_DEPOSIT) 등 즉시 완료되지 않는 결제는 입금 확인 웹훅이 없으므로 받지 않습니다.
  if (payment.status !== "DONE") {
    await cancelTossPayment(paymentKey, "즉시 결제가 완료되지 않는 결제수단");
    return NextResponse.json(
      { error: "해당 결제수단은 지원하지 않습니다. 카드·간편결제 등 다른 결제수단을 이용해주세요." },
      { status: 400 }
    );
  }

  const paymentMethod = tossPaymentMethodLabel(payment);
  // purchase_artwork는 결제 없이 호출되지 않도록 service_role만 실행할 수 있습니다.
  // service_role에는 auth.uid()가 없으므로 로그인한 구매자 ID를 직접 넘겨 "내 주문"에 연결합니다.
  const { data: rows, error: purchaseError } = await supabaseService.rpc("purchase_artwork", {
    p_artwork_id: order.artworkId,
    p_shipping_address: order.shippingAddress,
    p_phone: order.phone,
    p_name: order.name,
    p_email: order.email,
    p_payment_method: paymentMethod,
    p_insured: order.insured,
    p_marketing_opt_in: order.marketingOptIn,
    p_user_id: user?.id,
  });

  if (purchaseError || !rows?.[0]) {
    console.error("[toss] 주문 등록 실패", orderId, paymentKey, purchaseError);
    const canceled = await cancelTossPayment(paymentKey, "주문 등록 실패로 인한 자동취소");
    return NextResponse.json(
      {
        error: canceled
          ? "주문 등록에 실패하여 결제가 자동 취소되었습니다. 다시 시도해주세요."
          : `결제는 완료되었으나 주문 등록에 실패했습니다. 고객센터로 문의해주세요. (주문번호: ${orderId})`,
      },
      { status: 500 }
    );
  }

  // 주문 확인 메일은 응답을 보낸 뒤 발송합니다. 결제·주문은 이미 끝났으므로 실패해도 기록만 남깁니다.
  const confirmedOrder = rows[0];
  after(async () => {
    try {
      await sendOrderConfirmationEmail({
        to: order.email,
        buyerName: order.name,
        lines: [{ orderNumber: confirmedOrder.order_number, title: artwork.title, amount: confirmedOrder.amount }],
        paymentMethod,
        shippingAddress: order.shippingAddress,
      });
    } catch (err) {
      console.error("[email] 주문 확인 메일 발송 실패", confirmedOrder.order_number, err);
    }
  });

  return NextResponse.json({
    orderNumber: rows[0].order_number,
    amount: rows[0].amount,
    paymentMethod,
  });
}
