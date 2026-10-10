"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminRefundOrder } from "@/lib/adminActions";
import { formatDate, formatKRW } from "@/lib/format";

export default function AdminRefundButton({
  kind,
  orderId,
  amount,
  refundedAt,
}: {
  kind: "artwork" | "merch";
  orderId: string;
  amount: number;
  refundedAt: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (refundedAt) {
    return <p className="text-xs text-ink-faint">환불 완료 · {formatDate(refundedAt)}</p>;
  }

  async function handleRefund() {
    if (!window.confirm(`${formatKRW(amount)}을 환불하고 주문을 취소할까요? 되돌릴 수 없습니다.`)) return;
    setPending(true);
    setMessage(null);
    try {
      const result = await adminRefundOrder(kind, orderId);
      if (result.ok) {
        setMessage({
          ok: true,
          text: result.alreadyCanceled
            ? "토스에서 이미 취소된 결제라 주문 상태만 환불 완료로 맞췄습니다."
            : "환불했습니다.",
        });
        router.refresh();
      } else {
        setMessage({ ok: false, text: result.error });
      }
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "환불 요청에 실패했습니다." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRefund}
        disabled={pending}
        className="border border-red-600 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "환불 처리 중..." : `환불 (${formatKRW(amount)})`}
      </button>
      {message && (
        <p className={`mt-2 text-xs break-all ${message.ok ? "text-patina" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
