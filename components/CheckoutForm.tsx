"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ArtworkThumbnail from "./ArtworkThumbnail";
import ShippingNotice from "./ShippingNotice";
import { buttonClasses } from "@/lib/ui";
import { computeVatBreakdown, formatKRW } from "@/lib/format";
import { getMyProfile } from "@/lib/queries";
import { SHIPPING_PERIOD_STANDARD } from "@/lib/shipping";
import { TOSS_WIDGET_CLIENT_KEY } from "@/lib/tosspayments";
import type { Artist, Artwork } from "@/lib/types";
import type { PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";

const SELLER_INTERMEDIARY = "Gallery Lumora";
const TOSS_ORDER_STORAGE_PREFIX = "gl_toss_order_";

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
  const [insured, setInsured] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileAddress, setProfileAddress] = useState("");
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  const vat = computeVatBreakdown(artwork.price, artwork.taxStatus);
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);

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

  // TossPayments 결제위젯 — 상품/작가별로 위젯을 다시 그리지 않도록 마운트 시 1회만 로드합니다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { loadPaymentWidget, ANONYMOUS } = await import("@tosspayments/payment-widget-sdk");
      const widget = await loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, ANONYMOUS);
      if (cancelled) return;
      widget.renderPaymentMethods("#toss-payment-methods", { value: artwork.price }, { variantKey: "DEFAULT" });
      widget.renderAgreement("#toss-agreement", { variantKey: "AGREEMENT" });
      paymentWidgetRef.current = widget;
      setWidgetReady(true);
    })().catch(() => setError("결제창을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork.id]);

  function toggleUseProfileAddress() {
    setUseProfileAddress((prev) => {
      const next = !prev;
      setShippingAddress(next ? profileAddress : "");
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const widget = paymentWidgetRef.current;
    if (!widget) {
      setError("결제창이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const orderId = `gl_${artwork.id.slice(0, 8)}_${Date.now()}`;
    // TossPayments 결제창은 orderId/orderName/고객정보만 함께 넘어가므로, 배송지 등
    // 나머지 주문 정보는 결제 승인 후 완료 페이지에서 이어받을 수 있도록 세션에 잠시 보관합니다.
    sessionStorage.setItem(
      `${TOSS_ORDER_STORAGE_PREFIX}${orderId}`,
      JSON.stringify({ artworkId: artwork.id, shippingAddress, phone, name, email, insured, marketingOptIn })
    );

    try {
      await widget.requestPayment({
        orderId,
        orderName: artwork.title,
        customerName: name,
        customerEmail: email,
        successUrl: `${window.location.origin}/works/${artwork.slug}/checkout/success`,
        failUrl: `${window.location.origin}/works/${artwork.slug}/checkout/fail`,
      });
      // 정상 흐름에서는 TossPayments 결제창이 successUrl/failUrl로 이동시키므로 여기까지 오지 않습니다.
    } catch {
      sessionStorage.removeItem(`${TOSS_ORDER_STORAGE_PREFIX}${orderId}`);
      setError("결제가 취소되었거나 실패했습니다. 다시 시도해주세요.");
      setSubmitting(false);
    }
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

          <Field label="결제 수단 (TossPayments)">
            <div id="toss-payment-methods" />
            <div id="toss-agreement" className="mt-2" />
            {!widgetReady && !error && (
              <p className="mt-2 text-xs text-ink-faint">결제창을 불러오는 중...</p>
            )}
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

          <ShippingNotice kind="standard" />

          <button type="submit" disabled={submitting || !widgetReady} className={`w-full ${buttonClasses("primary")}`}>
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
            <SumLine label="배송기간" value={`${SHIPPING_PERIOD_STANDARD} 발송`} />
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
