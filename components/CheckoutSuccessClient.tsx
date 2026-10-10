"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PurchaseSuccessCard } from "./OrderReceipt";
import { buttonClasses } from "@/lib/ui";
import type { Artist, Artwork } from "@/lib/types";

const TOSS_ORDER_STORAGE_PREFIX = "gl_toss_order_";

interface PendingOrder {
  artworkId: string;
  shippingAddress: string;
  phone: string;
  name: string;
  email: string;
  insured: boolean;
  marketingOptIn: boolean;
}

type State =
  | { status: "confirming" }
  | { status: "error"; message: string }
  | { status: "done"; orderNumber: string; amount: number; paymentMethod: string; pending: PendingOrder };

export default function CheckoutSuccessClient({ artwork, artist }: { artwork: Artwork; artist: Artist }) {
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>({ status: "confirming" });

  // 같은 결제를 두 번 승인 요청하지 않도록(개발 모드 StrictMode의 effect 이중 실행 등) 1회만 실행합니다.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setState({ status: "error", message: "결제 정보가 올바르지 않습니다." });
      return;
    }

    const raw = sessionStorage.getItem(`${TOSS_ORDER_STORAGE_PREFIX}${orderId}`);
    if (!raw) {
      setState({ status: "error", message: "주문 정보를 찾을 수 없습니다. 같은 브라우저에서 다시 시도해주세요." });
      return;
    }
    const pending: PendingOrder = JSON.parse(raw);

    (async () => {
      // 결제 승인과 주문 등록은 서버에서 함께 처리합니다(금액 검증 및 실패 시 자동취소 포함).
      const res = await fetch("/api/toss/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), order: pending }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", message: data.error || "결제 승인에 실패했습니다." });
        return;
      }
      sessionStorage.removeItem(`${TOSS_ORDER_STORAGE_PREFIX}${orderId}`);
      setState({
        status: "done",
        orderNumber: data.orderNumber,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        pending,
      });
    })();
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
        <Link href={`/works/${artwork.slug}/checkout`} className={buttonClasses("ghost")}>
          결제 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <PurchaseSuccessCard
      artwork={artwork}
      artist={artist}
      orderNumber={state.orderNumber}
      amount={state.amount}
      buyerName={state.pending.name}
      buyerEmail={state.pending.email}
      shippingAddress={state.pending.shippingAddress}
      paymentMethod={state.paymentMethod}
    />
  );
}
