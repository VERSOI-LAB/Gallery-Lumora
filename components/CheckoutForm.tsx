"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import ArtworkThumbnail from "./ArtworkThumbnail";
import { buttonClasses } from "@/lib/ui";
import { computeVatBreakdown, formatDate, formatKRW } from "@/lib/format";
import { getMyProfile, purchaseArtwork } from "@/lib/queries";
import type { Artist, Artwork } from "@/lib/types";

const SELLER_INTERMEDIARY = "Gallery Lumora";

export default function CheckoutForm({
  artwork,
  artist,
}: {
  artwork: Artwork;
  artist: Artist;
}) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("신용/체크카드");
  const [insured, setInsured] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ orderNumber: string; amount: number } | null>(null);
  const [profileAddress, setProfileAddress] = useState("");
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [docView, setDocView] = useState<"receipt" | "confirmation" | null>(null);

  const vat = computeVatBreakdown(artwork.price, artwork.taxStatus);

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        if (!profile) return;
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone);
        setProfileAddress(profile.address);
      })
      .catch(() => {});
  }, []);

  function toggleUseProfileAddress() {
    setUseProfileAddress((prev) => {
      const next = !prev;
      setShippingAddress(next ? profileAddress : "");
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await purchaseArtwork({
        artworkId: artwork.id,
        shippingAddress,
        phone,
        name,
        email,
        paymentMethod,
        insured,
        marketingOptIn,
      });
      setReceipt(result);
    } catch {
      setError("결제에 실패했습니다. 이미 판매된 작품이거나 일시적인 오류일 수 있습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (docView) {
    return (
      <OrderDocument
        type={docView}
        artwork={artwork}
        artist={artist}
        orderNumber={receipt!.orderNumber}
        amount={receipt!.amount}
        buyerName={name}
        buyerEmail={email}
        shippingAddress={shippingAddress}
        paymentMethod={paymentMethod}
        onClose={() => setDocView(null)}
      />
    );
  }

  if (receipt) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center md:px-0">
        <p className="mb-3 text-xs font-semibold tracking-wide text-patina uppercase">
          결제 완료
        </p>
        <h1 className="mb-4 font-display text-2xl">소장을 축하드립니다</h1>
        <p className="mb-2 text-sm leading-7 text-ink-soft">
          주문번호 <span className="font-medium text-ink">{receipt.orderNumber}</span> ·{" "}
          {formatKRW(receipt.amount)} 결제가 완료되었습니다.
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
          <button
            type="button"
            onClick={() => setDocView("confirmation")}
            className={buttonClasses("ghost", "sm")}
          >
            주문확인서 다운로드
          </button>
        </div>
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
          <Field label="이름">
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="이메일">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="배송지">
            {profileAddress && (
              <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={useProfileAddress}
                  onChange={toggleUseProfileAddress}
                  className="accent-patina"
                />
                등록된 주소와 동일
              </label>
            )}
            <textarea
              required
              disabled={useProfileAddress}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="받으실 주소를 입력해주세요"
              className="h-20 w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina disabled:text-ink-faint"
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={() => setMarketingOptIn((v) => !v)}
              className="accent-patina"
            />
            신작 소식 등 마케팅 이메일 수신에 동의합니다
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
              <ArtworkThumbnail
                imageUrls={artwork.imageUrls}
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
            <SumLine label="상품가격" value={formatKRW(vat.productPrice)} />
            <SumLine label="부가세(VAT)" value={vat.vat > 0 ? formatKRW(vat.vat) : "면세"} />
            <SumLine label="배송·보험" value={insured ? "무료" : "₩0"} />
            <SumLine label="총 결제금액" value={formatKRW(artwork.price)} total />
          </div>
          <div className="mt-4 space-y-0.5 border-t border-line pt-3 text-xs text-ink-faint">
            <p>판매자: {artist.name} 작가</p>
            <p>통신판매중개자: {SELLER_INTERMEDIARY}</p>
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
          <Row
            label="통신판매중개자 사업자등록번호"
            value="550-38-01564 (베르소이 / 갤러리 루모라)"
          />
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
