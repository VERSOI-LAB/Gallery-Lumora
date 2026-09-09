import { NextRequest, NextResponse } from "next/server";

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
