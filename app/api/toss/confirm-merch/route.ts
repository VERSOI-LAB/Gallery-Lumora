import { NextRequest, NextResponse, after } from "next/server";
import { isValidPhone } from "@/lib/phone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";
import {
  MERCH_MAX_QUANTITY,
  TOSS_MERCH_ORDER_PREFIX,
  type PendingMerchItem,
  type PendingMerchOrder,
} from "@/lib/tosspayments";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { cancelTossPayment, confirmTossPayment, tossPaymentMethodLabel } from "@/lib/tossServer";

const MAX_ITEMS = 20;

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

function isValidItem(item: unknown): item is PendingMerchItem {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.productId === "string" &&
    isNullableString(i.variantId) &&
    Number.isInteger(i.quantity) &&
    (i.quantity as number) >= 1 &&
    (i.quantity as number) <= MERCH_MAX_QUANTITY &&
    isNullableString(i.artworkId) &&
    isNullableString(i.designImageUrl)
  );
}

function isValidOrder(order: unknown): order is PendingMerchOrder {
  if (!order || typeof order !== "object") return false;
  const o = order as Record<string, unknown>;
  return (
    Array.isArray(o.items) &&
    o.items.length >= 1 &&
    o.items.length <= MAX_ITEMS &&
    o.items.every(isValidItem) &&
    typeof o.shippingAddress === "string" &&
    typeof o.phone === "string" &&
    isValidPhone(o.phone) &&
    typeof o.name === "string" &&
    typeof o.email === "string" &&
    typeof o.marketingOptIn === "boolean" &&
    typeof o.fromCart === "boolean"
  );
}

/** purchase_merch와 같은 규칙으로 품목별 결제 금액을 계산합니다. 구매할 수 없는 품목이면 오류 메시지를 반환합니다. */
async function priceItems(items: PendingMerchItem[]): Promise<{ amounts: number[]; titles: string[] } | { error: string }> {
  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const { data: products, error } = await supabaseService
    .from("merch_products")
    .select("id, title, price, fulfillment, has_variants, is_template")
    .in("id", productIds)
    .eq("active", true);
  if (error) return { error: "상품 정보를 불러오지 못했습니다." };
  const productById = new Map(products.map((p) => [p.id, p]));

  const editionDemand = new Map<string, number>();
  const amounts: number[] = [];
  const titles: string[] = [];
  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) return { error: "판매 중이 아닌 상품이 포함되어 있습니다." };
    if (product.is_template && !item.artworkId) return { error: "작품을 선택해야 하는 상품입니다." };

    let unitPrice = product.price;
    if (product.fulfillment === "edition") {
      if (item.quantity !== 1) return { error: "한정판 상품은 1개씩만 구매할 수 있습니다." };
      editionDemand.set(product.id, (editionDemand.get(product.id) ?? 0) + 1);
    } else if (product.has_variants) {
      if (!item.variantId) return { error: "옵션을 선택해주세요." };
      const { data: variant } = await supabaseService
        .from("merch_variants")
        .select("price_delta")
        .eq("id", item.variantId)
        .eq("product_id", product.id)
        .maybeSingle();
      if (!variant) return { error: "선택한 옵션을 찾을 수 없습니다." };
      unitPrice += variant.price_delta;
    }
    amounts.push(unitPrice * item.quantity);
    titles.push(item.quantity > 1 ? `${product.title} × ${item.quantity}` : product.title);
  }

  for (const [productId, demand] of editionDemand) {
    const { count } = await supabaseService
      .from("merch_editions")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("sold", false);
    if ((count ?? 0) < demand) return { error: "품절된 한정판 상품이 포함되어 있습니다." };
  }
  return { amounts, titles };
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
    !orderId.startsWith(TOSS_MERCH_ORDER_PREFIX) ||
    typeof amount !== "number" ||
    !isValidOrder(order)
  ) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  // 결제위젯 금액은 브라우저에서 정해지므로, 승인 전에 DB 가격으로 다시 계산해 대조합니다.
  // 승인 요청을 보내지 않으면 TossPayments가 인증된 결제를 자동으로 만료시킵니다.
  const priced = await priceItems(order.items);
  if ("error" in priced) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }
  const expected = priced.amounts.reduce((s, a) => s + a, 0);
  if (expected !== amount) {
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

  // purchase_merch는 결제 없이 호출되지 않도록 service_role로만 호출합니다. service_role에는
  // auth.uid()가 없으므로, 로그인한 구매자의 주문은 user_id를 직접 채워 "내 주문"에 연결합니다.
  const receipts: { orderNumber: string; amount: number }[] = [];
  const emailLines: { orderNumber: string; title: string; amount: number }[] = [];
  let failedAmount = 0;
  for (const [index, item] of order.items.entries()) {
    const { data: rows, error } = await supabaseService.rpc("purchase_merch", {
      p_product_id: item.productId,
      // purchase_merch의 p_variant_id에는 DEFAULT가 없어 생성 타입이 non-null이지만, 옵션 없는 상품은 null을 받습니다.
      p_variant_id: item.variantId as string,
      p_artwork_id: item.artworkId ?? undefined,
      p_design_image_url: item.designImageUrl ?? undefined,
      p_quantity: item.quantity,
      p_shipping_address: order.shippingAddress,
      p_phone: order.phone,
      p_name: order.name,
      p_email: order.email,
      p_payment_method: paymentMethod,
      p_marketing_opt_in: order.marketingOptIn,
    });
    const row = rows?.[0];
    if (error || !row) {
      console.error("[toss] 굿즈 주문 등록 실패", orderId, paymentKey, item.productId, error);
      failedAmount += priced.amounts[index];
      continue;
    }
    if (user) {
      const { error: linkError } = await supabaseService
        .from("merch_orders")
        .update({ user_id: user.id })
        .eq("order_number", row.order_number);
      if (linkError) console.error("[toss] 굿즈 주문 회원 연결 실패", row.order_number, linkError);
    }
    receipts.push({ orderNumber: row.order_number, amount: row.amount });
    emailLines.push({ orderNumber: row.order_number, title: priced.titles[index], amount: row.amount });
  }

  if (receipts.length === 0) {
    const canceled = await cancelTossPayment(paymentKey, "주문 등록 실패로 인한 자동취소");
    return NextResponse.json(
      {
        error: canceled
          ? "주문 등록에 실패하여 결제가 자동 취소되었습니다. 품절되었거나 일시적인 오류일 수 있습니다."
          : `결제는 완료되었으나 주문 등록에 실패했습니다. 고객센터로 문의해주세요. (주문번호: ${orderId})`,
      },
      { status: 500 }
    );
  }

  let partialCancelFailed = false;
  if (failedAmount > 0) {
    partialCancelFailed = !(await cancelTossPayment(
      paymentKey,
      "일부 상품 주문 등록 실패로 인한 부분취소",
      failedAmount
    ));
  }

  // 주문 확인 메일은 응답을 보낸 뒤 발송합니다. 결제·주문은 이미 끝났으므로 실패해도 기록만 남깁니다.
  after(async () => {
    try {
      await sendOrderConfirmationEmail({
        to: order.email,
        buyerName: order.name,
        lines: emailLines,
        paymentMethod,
        shippingAddress: order.shippingAddress,
      });
    } catch (err) {
      console.error("[email] 굿즈 주문 확인 메일 발송 실패", orderId, err);
    }
  });

  return NextResponse.json({
    receipts,
    paymentMethod,
    failedCount: order.items.length - receipts.length,
    refundedAmount: partialCancelFailed ? 0 : failedAmount,
    refundFailed: partialCancelFailed,
  });
}
