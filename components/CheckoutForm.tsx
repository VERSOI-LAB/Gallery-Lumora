"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import PlaceholderArt from "./PlaceholderArt";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { purchaseArtwork } from "@/lib/queries";
import type { Artist, Artwork } from "@/lib/types";

export default function CheckoutForm({
  artwork,
  artist,
}: {
  artwork: Artwork;
  artist: Artist;
}) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("신용/체크카드");
  const [insured, setInsured] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ orderNumber: string; amount: number } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await purchaseArtwork({
        artworkId: artwork.id,
        shippingAddress,
        phone,
        paymentMethod,
        insured,
      });
      setReceipt(result);
    } catch {
      setError("결제에 실패했습니다. 이미 판매된 작품이거나 일시적인 오류일 수 있습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">
          결제 완료
        </p>
        <h1 className="mb-4 font-display text-2xl">소장을 축하드립니다</h1>
        <p className="mb-8 text-sm leading-7 text-ink-soft">
          주문번호 <span className="font-medium text-ink">{receipt.orderNumber}</span> ·{" "}
          {formatKRW(receipt.amount)} 결제가 완료되었습니다.
          <br />
          디지털 진품 인증서가 이메일로 발송되며, 배송 정보는 순차 안내드립니다.
        </p>
        <Link href={`/works/${artwork.slug}`} className={buttonClasses("ghost")}>
          작품 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="mb-8 font-display text-2xl">결제</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="배송지">
            <textarea
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="받으실 주소를 입력해주세요"
              className="h-20 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
            />
          </Field>
          <Field label="연락처">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="결제 수단">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            >
              <option>신용/체크카드</option>
              <option>계좌이체</option>
              <option>간편결제</option>
            </select>
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={insured}
              onChange={() => setInsured((v) => !v)}
              className="accent-patina"
            />
            배송 보험 포함 (권장)
          </label>

          <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
            {submitting ? "결제 처리 중..." : `${formatKRW(artwork.price)} 결제하기`}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <p className="text-xs text-ink-faint">
            결제 완료 즉시 디지털 진품 인증서(QR)가 자동 발급됩니다.
          </p>
        </form>

        <aside className="h-fit border border-line p-5">
          <div className="mb-4 flex gap-3">
            <div className="h-[70px] w-[56px] flex-none overflow-hidden">
              <PlaceholderArt
                hue={artwork.hue}
                variant={artwork.variant}
                seed={artwork.slug}
                className="h-full w-full"
              />
            </div>
            <div>
              <div className="text-sm font-medium">{artwork.title}</div>
              <div className="text-xs text-ink-soft">{artist.name}</div>
            </div>
          </div>
          <div className="space-y-1 border-t border-line pt-3 text-sm">
            <SumLine label="작품가" value={formatKRW(artwork.price)} />
            <SumLine label="배송·보험" value={insured ? "무료" : "₩0"} />
            <SumLine label="총 결제금액" value={formatKRW(artwork.price)} total />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function SumLine({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return (
    <div
      className={`flex justify-between py-1.5 ${total ? "font-semibold" : "border-b border-line text-ink-soft"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
