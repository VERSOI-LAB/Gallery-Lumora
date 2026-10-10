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

/** 토스 주문번호(orderId, 예: glm_…)로 결제를 조회해 paymentKey를 찾습니다. 결제 키를 저장하기 전의
 * 주문을 환불할 때 사용합니다. */
export async function findTossPaymentKeyByOrderId(
  orderId: string
): Promise<{ paymentKey: string } | { error: string }> {
  const res = await fetch(`${TOSS_API_BASE}/orders/${encodeURIComponent(orderId)}`, {
    headers: tossHeaders(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (res.ok && typeof data?.paymentKey === "string") return { paymentKey: data.paymentKey };
  // 조회 실패 원인(키 불일치·주문 없음 등)을 관리자 화면에서 바로 볼 수 있도록 그대로 돌려줍니다.
  const detail = [data?.code, data?.message].filter(Boolean).join(" ");
  console.error("[toss] 주문번호로 결제 조회 실패", orderId, res.status, data);
  return { error: `토스 결제 조회 실패 (HTTP ${res.status}${detail ? `, ${detail}` : ""}, 주문번호 ${orderId})` };
}

/** 환불용 결제 취소 — 실패 사유를 함께 돌려줍니다. 토스 상점관리자 등에서 이미 취소된 결제는
 * 성공으로 간주해 DB 상태만 맞출 수 있게 합니다. */
export async function refundTossPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount: number
): Promise<{ ok: true; alreadyCanceled: boolean } | { ok: false; message: string }> {
  const res = await fetch(`${TOSS_API_BASE}/${encodeURIComponent(paymentKey)}/cancel`, {
    method: "POST",
    headers: tossHeaders(),
    body: JSON.stringify({ cancelReason, cancelAmount }),
  });
  if (res.ok) return { ok: true, alreadyCanceled: false };
  const data = await res.json().catch(() => ({}));
  if (data?.code === "ALREADY_CANCELED_PAYMENT") return { ok: true, alreadyCanceled: true };
  console.error("[toss] 환불 실패", paymentKey, data);
  return { ok: false, message: data?.message || "결제 취소에 실패했습니다." };
}

/** 키의 종류·모드만 알려주는 접두사(예: live_gsk, test_gck). 키 값 자체는 노출하지 않습니다. */
function keyKind(key: string | undefined): string | null {
  const match = key?.trim().match(/^(live|test)_(gck|gsk|ck|sk)_/);
  return match ? `${match[1]}_${match[2]}` : key?.trim() ? "알 수 없는 형식" : null;
}

/** 관리자 화면에 보여줄 토스 키 설정 상태. 결제위젯에는 같은 모드의 gck(클라이언트)·gsk(시크릿) 짝이
 * 필요합니다. 문서용 공개 테스트 키로 대신 동작 중인지도 함께 알려줍니다. */
export function getTossConfigStatus(): {
  clientKey: string | null;
  secretKey: string | null;
  usingDocsFallback: boolean;
  problem: string | null;
} {
  const clientKind = keyKind(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
  const secretKind = keyKind(process.env.TOSS_WIDGET_SECRET_KEY);
  const usingDocsFallback = !process.env.TOSS_WIDGET_SECRET_KEY?.trim() || !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
  let problem: string | null = null;
  if (usingDocsFallback) problem = "키가 설정되지 않아 토스 문서용 테스트 키로 동작 중입니다(실결제 불가).";
  else if (clientKind !== "live_gck" || secretKind !== "live_gsk")
    problem = "실결제에는 결제위젯 연동 키(live_gck / live_gsk) 짝이 필요합니다.";
  return { clientKey: clientKind, secretKey: secretKind, usingDocsFallback, problem };
}
