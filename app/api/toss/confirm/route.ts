import { NextRequest, NextResponse } from "next/server";
import { HIGH_VALUE_PRODUCT_THRESHOLD } from "@/lib/format";

// TossPayments 결제위젯 문서에 공개된 테스트 전용 시크릿 키를 기본값으로 사용합니다.
// 계약 승인 후에는 실제 발급받은 시크릿 키를 TOSS_WIDGET_SECRET_KEY 환경변수로 설정해야 합니다.
const TOSS_WIDGET_SECRET_KEY =
  process.env.TOSS_WIDGET_SECRET_KEY || "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { paymentKey, orderId, amount } = body ?? {};
  if (!paymentKey || !orderId || typeof amount !== "number") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  // PG사 계약상 1회 결제 단가 상한(8,000,000원)을 넘는 결제는 승인하지 않는다.
  // 고가 상품은 체크아웃 화면에서 애초에 노출되지 않지만, 이 엔드포인트를 직접
  // 호출하는 경우까지 막기 위한 서버 측 방어선이다.
  if (amount > HIGH_VALUE_PRODUCT_THRESHOLD) {
    return NextResponse.json({ error: "해당 금액은 카드 결제 한도를 초과합니다. 별도 문의를 이용해주세요." }, { status: 400 });
  }

  const basicAuth = Buffer.from(`${TOSS_WIDGET_SECRET_KEY}:`).toString("base64");
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message || "결제 승인에 실패했습니다." }, { status: res.status });
  }
  return NextResponse.json(data);
}
