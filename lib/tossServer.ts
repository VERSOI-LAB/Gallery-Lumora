import "server-only";

// TossPayments 결제위젯 시크릿 키(live_gsk_... / test_gsk_...). 서버에서만 사용하며 절대 커밋하지 마세요.
// 비워두면 TossPayments 문서에 공개된 테스트 전용 시크릿 키로 동작합니다(실 결제 승인 불가).
const TOSS_WIDGET_SECRET_KEY =
  process.env.TOSS_WIDGET_SECRET_KEY || "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
const TOSS_API_BASE = "https://api.tosspayments.com/v1/payments";

function tossHeaders() {
  const basicAuth = Buffer.from(`${TOSS_WIDGET_SECRET_KEY}:`).toString("base64");
  return { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/json" };
}

export interface TossPayment {
  status: string;
  method?: string;
  easyPay?: { provider?: string } | null;
}

export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<{ ok: true; payment: TossPayment } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${TOSS_API_BASE}/confirm`, {
    method: "POST",
    headers: tossHeaders(),
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, message: data.message || "결제 승인에 실패했습니다." };
  }
  return { ok: true, payment: data };
}

/** cancelAmount를 생략하면 전액 취소, 지정하면 해당 금액만 부분 취소합니다. */
export async function cancelTossPayment(paymentKey: string, cancelReason: string, cancelAmount?: number) {
  const res = await fetch(`${TOSS_API_BASE}/${encodeURIComponent(paymentKey)}/cancel`, {
    method: "POST",
    headers: tossHeaders(),
    body: JSON.stringify(cancelAmount === undefined ? { cancelReason } : { cancelReason, cancelAmount }),
  });
  if (!res.ok) {
    console.error("[toss] 결제 자동취소 실패", paymentKey, await res.text().catch(() => ""));
  }
  return res.ok;
}

export function tossPaymentMethodLabel(payment: TossPayment): string {
  return `TossPayments ${payment.easyPay?.provider ?? payment.method ?? ""}`.trim();
}
