"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PurchaseSuccessCard } from "./OrderReceipt";
import { buttonClasses } from "@/lib/ui";
import { purchaseArtwork } from "@/lib/queries";
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
  | { status: "done"; orderNumber: string; amount: number; pending: PendingOrder };

export default function CheckoutSuccessClient({ artwork, artist }: { artwork: Artwork; artist: Artist }) {
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>({ status: "confirming" });

  useEffect(() => {
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
      const res = await fetch("/api/toss/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error || "결제 승인에 실패했습니다." });
        return;
      }

      try {
        const result = await purchaseArtwork({
          artworkId: pending.artworkId,
          shippingAddress: pending.shippingAddress,
          phone: pending.phone,
          name: pending.name,
          email: pending.email,
          paymentMethod: "TossPayments (신용/체크카드 등)",
          insured: pending.insured,
          marketingOptIn: pending.marketingOptIn,
        });
        sessionStorage.removeItem(`${TOSS_ORDER_STORAGE_PREFIX}${orderId}`);
        setState({ status: "done", orderNumber: result.orderNumber, amount: result.amount, pending });
      } catch {
        setState({
          status: "error",
          message: "결제는 완료되었으나 주문 등록에 실패했습니다. 고객센터로 문의해주세요.",
        });
      }
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
      paymentMethod="TossPayments (신용/체크카드 등)"
    />
  );
}
