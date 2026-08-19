"use client";

import { useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { updateArtistCommissionSettings } from "@/lib/queries";
import type { Artist } from "@/lib/types";

export default function CommissionAvailabilityForm({ artist }: { artist: Artist }) {
  const [accepting, setAccepting] = useState(artist.commission.accepting);
  const [priceRange, setPriceRange] = useState(artist.commission.priceRange);
  const [leadTime, setLeadTime] = useState(artist.commission.leadTime);
  const [revisionCount, setRevisionCount] = useState(artist.commission.revisionCount);
  const [draftProcess, setDraftProcess] = useState(artist.commission.draftProcess);
  const [deliveryFormat, setDeliveryFormat] = useState(artist.commission.deliveryFormat);
  const [copyrightScope, setCopyrightScope] = useState(artist.commission.copyrightScope);
  const [withdrawalPolicy, setWithdrawalPolicy] = useState(artist.commission.withdrawalPolicy);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    setError(null);
    try {
      await updateArtistCommissionSettings(artist.id, {
        commissionAccepting: accepting,
        commissionPriceRange: priceRange,
        commissionLeadTime: leadTime,
        commissionRevisionCount: revisionCount,
        commissionDraftProcess: draftProcess,
        commissionDeliveryFormat: deliveryFormat,
        commissionCopyrightScope: copyrightScope,
        commissionWithdrawalPolicy: withdrawalPolicy,
      });
      setSaved(true);
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 border border-line p-5">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={accepting}
          onChange={(e) => setAccepting(e.target.checked)}
          className="accent-patina"
        />
        커미션 접수 (1:1 주문 제작 의뢰 가능 여부)
      </label>

      {accepting && (
        <div className="mt-4 space-y-4">
          <TermField label="커미션 비용 범위" placeholder="예: 50만원~200만원" value={priceRange} onChange={setPriceRange} />

          <p className="pt-2 text-[11px] tracking-wide text-ink-faint uppercase">
            거래 조건 (고객이 의뢰 전에 확인하는 내용이니 미리 정해두면 문의 단계에서 오해를 줄일 수 있어요)
          </p>
          <TermField
            label="제작기간 (주문 후 작품을 완성하는 데 걸리는 기간)"
            placeholder="예: 결제 후 14일 이내 제작"
            value={leadTime}
            onChange={setLeadTime}
          />
          <TermField
            label="수정횟수 (작가가 만든 시안에 대해 구매자가 수정 요청할 수 있는 횟수)"
            placeholder="예: 시안 2회 수정 가능"
            value={revisionCount}
            onChange={setRevisionCount}
          />
          <TermField
            label="시안 (최종 작품을 만들기 전에 작가가 보여주는 초안/디자인)"
            placeholder="예: 스케치 또는 디지털 초안 1회 제공"
            value={draftProcess}
            onChange={setDraftProcess}
          />
          <TermField
            label="최종 납품형태 (완성된 작품을 구매자에게 어떤 형태로 전달하는지)"
            placeholder="예: 원화 캔버스 + 액자 / JPG 파일 / PNG 파일"
            value={deliveryFormat}
            onChange={setDeliveryFormat}
          />
          <TermField
            label="저작권 이용범위 (구매자가 완성된 작품을 어디까지 사용할 수 있는지)"
            placeholder="예: 개인 소장만 가능 / 상업적 사용 가능"
            value={copyrightScope}
            onChange={setCopyrightScope}
          />
          <TermField
            label="청약철회 제한 여부 (주문 후 법적으로 청약철회가 제한될 수 있는 커미션인지 여부와 그 사유)"
            placeholder="예: 구매자 맞춤 제작이 시작된 경우 제한 가능"
            value={withdrawalPolicy}
            onChange={setWithdrawalPolicy}
          />
        </div>
      )}

      <button type="submit" disabled={submitting} className={`${buttonClasses("primary", "sm")} mt-4`}>
        {submitting ? "저장 중..." : "저장"}
      </button>
      {saved && <p className="mt-2 text-xs text-patina">저장되었습니다.</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}

function TermField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
      />
    </label>
  );
}
