"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/ui";
import { computeVatBreakdown, formatDate, formatKRW } from "@/lib/format";
import type { Artist, Artwork } from "@/lib/types";

export const SELLER_INTERMEDIARY = "Gallery Lumora";

export function PurchaseSuccessCard({
  artwork,
  artist,
  orderNumber,
  amount,
  buyerName,
  buyerEmail,
  shippingAddress,
  paymentMethod,
}: {
  artwork: Artwork;
  artist: Artist;
  orderNumber: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
}) {
  const [docView, setDocView] = useState<"receipt" | "confirmation" | null>(null);

  if (docView) {
    return (
      <OrderDocument
        type={docView}
        artwork={artwork}
        artist={artist}
        orderNumber={orderNumber}
        amount={amount}
        buyerName={buyerName}
        buyerEmail={buyerEmail}
        shippingAddress={shippingAddress}
        paymentMethod={paymentMethod}
        onClose={() => setDocView(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
      <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">결제 완료</p>
      <h1 className="mb-4 font-display text-2xl">소장을 축하드립니다</h1>
      <p className="mb-2 text-sm leading-7 text-ink-soft">
        주문번호 <span className="font-medium text-ink">{orderNumber}</span> · {formatKRW(amount)}{" "}
        결제가 완료되었습니다.
        <br />
        디지털 진품 인증서가 이메일로 발송되며, 배송 정보는 순차 안내드립니다.
      </p>
      <p className="mb-8 text-xs text-ink-faint">
        판매자: {artist.name} 작가 · 통신판매중개자: {SELLER_INTERMEDIARY}
      </p>
      <div className="mb-6 flex justify-center gap-3">
        <button type="button" onClick={() => setDocView("receipt")} className={buttonClasses("ghost", "sm")}>
          결제영수증 다운로드
        </button>
        <button type="button" onClick={() => setDocView("confirmation")} className={buttonClasses("ghost", "sm")}>
          주문확인서 다운로드
        </button>
      </div>
      <Link href={`/works/${artwork.slug}`} className={buttonClasses("ghost")}>
        작품 페이지로 돌아가기
      </Link>
    </div>
  );
}

function OrderDocument({
  type,
  artwork,
  artist,
  orderNumber,
  amount,
  buyerName,
  buyerEmail,
  shippingAddress,
  paymentMethod,
  onClose,
}: {
  type: "receipt" | "confirmation";
  artwork: Artwork;
  artist: Artist;
  orderNumber: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  onClose: () => void;
}) {
  const vat = computeVatBreakdown(amount, artwork.taxStatus);
  const title = type === "receipt" ? "결제영수증" : "주문확인서";

  return (
    <div className="mx-auto max-w-lg px-5 py-10 md:px-0">
      <div className="mb-6 flex justify-between gap-3 print:hidden">
        <button type="button" onClick={onClose} className={buttonClasses("ghost", "sm")}>
          ← 닫기
        </button>
        <button type="button" onClick={() => window.print()} className={buttonClasses("primary", "sm")}>
          인쇄 / PDF로 저장
        </button>
      </div>

      <div className="border border-line p-8 text-sm leading-6 text-ink">
        <p className="mb-1 text-xs tracking-wide text-ink-faint uppercase">Gallery Lumora</p>
        <h1 className="mb-6 font-display text-2xl">{title}</h1>

        <dl className="mb-6 space-y-1.5 border-t border-line pt-4">
          <Row label="주문번호" value={orderNumber} />
          <Row label="발행일" value={formatDate(new Date().toISOString())} />
          <Row label="판매자" value={`${artist.name} 작가`} />
          <Row label="통신판매중개자" value={SELLER_INTERMEDIARY} />
          <Row label="통신판매중개자 사업자등록번호" value="550-38-01564 (베르소이 / 갤러리 루모라)" />
        </dl>

        <dl className="mb-6 space-y-1.5 border-t border-line pt-4">
          <Row label="구매자" value={buyerName} />
          <Row label="이메일" value={buyerEmail} />
          {type === "confirmation" && <Row label="배송지" value={shippingAddress} />}
          <Row label="결제수단" value={paymentMethod} />
        </dl>

        <dl className="mb-6 space-y-1.5 border-t border-line pt-4">
          <Row label="상품" value={artwork.title} />
          <Row label="상품가격" value={formatKRW(vat.productPrice)} />
          <Row label="부가세(VAT)" value={vat.vat > 0 ? formatKRW(vat.vat) : "면세"} />
          <Row label="배송비" value="무료" />
        </dl>

        <div className="flex justify-between border-t border-line pt-4 text-base font-semibold">
          <span>결제금액</span>
          <span>{formatKRW(amount)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="flex-none text-ink-soft">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
