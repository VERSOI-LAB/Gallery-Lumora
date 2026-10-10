"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { useCart } from "./CartContext";
import { TOSS_MERCH_ORDER_STORAGE_PREFIX, type PendingMerchOrder } from "@/lib/tosspayments";

interface Receipt {
  orderNumber: string;
  amount: number;
}

type State =
  | { status: "confirming" }
  | { status: "error"; message: string }
  | {
      status: "done";
      receipts: Receipt[];
      paymentMethod: string;
      failedCount: number;
      refundedAmount: number;
      refundFailed: boolean;
    };

export default function MerchCheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<State>({ status: "confirming" });

  // 같은 결제를 두 번 승인 요청하지 않도록(개발 모드 StrictMode의 effect 이중 실행 등) 1회만 실행합니다.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      if (!paymentKey || !orderId || !amount) {
        setState({ status: "error", message: "결제 정보가 올바르지 않습니다." });
        return;
      }

      const storageKey = `${TOSS_MERCH_ORDER_STORAGE_PREFIX}${orderId}`;
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        setState({ status: "error", message: "주문 정보를 찾을 수 없습니다. 같은 브라우저에서 다시 시도해주세요." });
        return;
      }
      const pending: PendingMerchOrder = JSON.parse(raw);

      // 결제 승인과 주문 등록은 서버에서 함께 처리합니다(금액 검증 및 실패 시 자동취소 포함).
      const res = await fetch("/api/toss/confirm-merch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), order: pending }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", message: data.error || "결제 승인에 실패했습니다." });
        return;
      }
      sessionStorage.removeItem(storageKey);
      if (pending.fromCart) clear();
      setState({
        status: "done",
        receipts: data.receipts,
        paymentMethod: data.paymentMethod,
        failedCount: data.failedCount,
        refundedAmount: data.refundedAmount,
        refundFailed: data.refundFailed,
      });
    })();
    // clear는 렌더마다 새로 만들어지지만 1회만 실행하므로 의존성에서 제외합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (state.status === "confirming") {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center md:px-0">
        <p className="text-sm text-ink-soft">결제 승인 확인 중입니다...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center md:px-0">
        <p className="mb-4 font-display text-xl">결제 확인에 실패했습니다</p>
        <p className="mb-8 text-sm text-ink-soft">{state.message}</p>
        <Link href="/shop" className={buttonClasses("ghost")}>
          Shop으로 돌아가기
        </Link>
      </div>
    );
  }

  const grandTotal = state.receipts.reduce((s, r) => s + r.amount, 0);
  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
      <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">결제 완료</p>
      <h1 className="mb-4 font-display text-2xl">주문이 완료되었습니다</h1>
      <p className="mb-6 text-sm text-ink-soft">
        {state.receipts.length}건 · {formatKRW(grandTotal)} 결제가 완료되었습니다. ({state.paymentMethod})
      </p>
      <ul className="mb-6 space-y-1 border-y border-line py-3 text-sm">
        {state.receipts.map((r) => (
          <li key={r.orderNumber} className="flex justify-between">
            <span>주문번호 {r.orderNumber}</span>
            <span>{formatKRW(r.amount)}</span>
          </li>
        ))}
      </ul>
      {state.failedCount > 0 && (
        <p className="mb-6 text-xs text-red-600">
          {state.refundFailed
            ? `${state.failedCount}개 상품은 품절 등으로 주문되지 않았고, 해당 금액 환불 처리에 실패했습니다. 고객센터로 문의해주세요.`
            : `${state.failedCount}개 상품은 품절 등으로 주문되지 않아 ${formatKRW(state.refundedAmount)}이 부분 취소되었습니다.`}
        </p>
      )}
      <Link href="/shop" className={buttonClasses("ghost")}>
        Shop으로 돌아가기
      </Link>
    </div>
  );
}
