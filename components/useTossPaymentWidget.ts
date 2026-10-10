"use client";

import { useEffect, useRef, useState } from "react";
import { TOSS_WIDGET_CLIENT_KEY } from "@/lib/tosspayments";
import type { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

/** TossPayments 결제위젯을 `#{methodsId}`/`#{agreementId}` 요소에 그리고, amount가 바뀌면
 * (수량·옵션 변경 등) 위젯을 다시 그리지 않고 금액만 갱신합니다. enabled가 false인 동안에는
 * 로드하지 않습니다(장바구니 상품 정보를 아직 불러오는 중일 때 등). */
export function useTossPaymentWidget({
  amount,
  methodsId,
  agreementId,
  enabled = true,
}: {
  amount: number;
  methodsId: string;
  agreementId: string;
  enabled?: boolean;
}) {
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsRef = useRef<PaymentMethodsWidget | null>(null);
  const amountRef = useRef(amount);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    amountRef.current = amount;
    methodsRef.current?.updateAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const { loadPaymentWidget, ANONYMOUS } = await import("@tosspayments/payment-widget-sdk");
      const widget = await loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, ANONYMOUS);
      if (cancelled) return;
      methodsRef.current = widget.renderPaymentMethods(
        `#${methodsId}`,
        { value: amountRef.current },
        { variantKey: "DEFAULT" }
      );
      widget.renderAgreement(`#${agreementId}`, { variantKey: "AGREEMENT" });
      widgetRef.current = widget;
      setReady(true);
    })().catch(() => setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [enabled, methodsId, agreementId]);

  return { widgetRef, ready, loadError };
}

/** Toss orderId 규칙(영문·숫자·-·_, 6~64자)에 맞는 고유 주문 ID. */
export function newTossOrderId(prefix: string): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** requestPayment 등에서 던진 오류를 사용자에게 보여줄 문구로 바꿉니다. 원인 파악을 위해
 * TossPayments 오류 코드와 메시지를 그대로 노출하고, 콘솔에도 남깁니다. */
export function tossErrorMessage(err: unknown): string {
  console.error("[toss] 결제 요청 실패", err);
  const e = (err ?? {}) as { code?: unknown; message?: unknown };
  const code = typeof e.code === "string" ? e.code : null;
  const message = typeof e.message === "string" && e.message ? e.message : null;
  if (code === "USER_CANCEL" || code === "PAY_PROCESS_CANCELED") {
    return "결제를 취소했습니다.";
  }
  if (message) return code ? `${message} (${code})` : message;
  return "결제가 취소되었거나 실패했습니다. 다시 시도해주세요.";
}
