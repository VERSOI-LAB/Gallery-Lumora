import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRefundableOrder, refundOrder, type OrderKind } from "@/lib/refund";

const CANCELLABLE_STATUSES = ["paid", "preparing"];

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

/** 고객 주문 취소 — 토스 결제를 함께 환불합니다. 회원은 본인 주문만, 예전 비회원 주문은 연락처와
 * 주문번호가 모두 맞을 때만 취소할 수 있고, 배송 준비 전(결제완료·배송준비중)까지만 가능합니다. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { kind, orderId, phone, orderNumber } = body ?? {};
  if ((kind !== "artwork" && kind !== "merch") || typeof orderId !== "string") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const order = await getRefundableOrder(kind as OrderKind, orderId);
  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = Boolean(user && order.userId === user.id);
  const isGuestOwner =
    typeof phone === "string" &&
    typeof orderNumber === "string" &&
    digits(phone).length >= 9 &&
    digits(phone) === digits(order.phone) &&
    orderNumber.trim().toUpperCase() === order.orderNumber;
  if (!isOwner && !isGuestOwner) {
    return NextResponse.json({ error: "이 주문을 취소할 권한이 없습니다." }, { status: 403 });
  }
  if (!CANCELLABLE_STATUSES.includes(order.status) || order.refundedAt) {
    return NextResponse.json(
      { error: "이미 배송이 시작되었거나 취소된 주문입니다. 고객센터로 문의해주세요." },
      { status: 409 }
    );
  }

  const result = await refundOrder(kind as OrderKind, order, "고객 요청 주문 취소");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true });
}
