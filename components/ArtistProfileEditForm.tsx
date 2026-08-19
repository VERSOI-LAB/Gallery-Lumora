"use client";

import { useState, type FormEvent } from "react";
import ArtistAvatar from "./ArtistAvatar";
import { buttonClasses } from "@/lib/ui";
import { updateArtist, uploadMedia, type ArtistInput } from "@/lib/queries";
import { MEDIUM_CATEGORIES } from "@/lib/mediumTaxonomy";
import type { Artist } from "@/lib/types";

export default function ArtistProfileEditForm({ artist }: { artist: Artist }) {
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [nameEn, setNameEn] = useState(artist.nameEn);
  const [tagline, setTagline] = useState(artist.tagline);
  const [bio, setBio] = useState(artist.bio);
  const [awards, setAwards] = useState(artist.awards);
  const [career, setCareer] = useState(artist.career);
  const [exhibitions, setExhibitions] = useState(artist.exhibitions);
  const [styleTags, setStyleTags] = useState(artist.styleTags.join(", "));
  const [commissionAccepting, setCommissionAccepting] = useState(artist.commission.accepting);
  const [commissionMedia, setCommissionMedia] = useState<string[]>(artist.commission.media);
  const [commissionLeadTime, setCommissionLeadTime] = useState(artist.commission.leadTime);
  const [commissionPriceRange, setCommissionPriceRange] = useState(artist.commission.priceRange);
  const [bankName, setBankName] = useState(artist.bankName);
  const [bankAccountNumber, setBankAccountNumber] = useState(artist.bankAccountNumber);
  const [businessName, setBusinessName] = useState(artist.businessName);
  const [businessRegNumber, setBusinessRegNumber] = useState(artist.businessRegNumber);
  const [businessRegCertUrl, setBusinessRegCertUrl] = useState(artist.businessRegCertUrl);
  const [businessRegCertUploading, setBusinessRegCertUploading] = useState(false);
  const [businessOwnerName, setBusinessOwnerName] = useState(artist.businessOwnerName);
  const [businessAddress, setBusinessAddress] = useState(artist.businessAddress);
  const [businessPhone, setBusinessPhone] = useState(artist.businessPhone);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMedia(code: string) {
    setCommissionMedia((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function handleAvatarUpload(file: File) {
    setAvatarUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadMedia(`artists/${artist.id}/avatar.${ext}`, file);
      setAvatarUrl(url);
    } catch {
      setError("사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleBusinessRegCertUpload(file: File) {
    setBusinessRegCertUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadMedia(`business-docs/${artist.id}/${crypto.randomUUID()}.${ext}`, file);
      setBusinessRegCertUrl(url);
    } catch {
      setError("사업자등록증 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusinessRegCertUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);

    if (
      !businessRegCertUrl ||
      !businessName.trim() ||
      !businessOwnerName.trim() ||
      !businessRegNumber.trim() ||
      !businessAddress.trim() ||
      !businessPhone.trim() ||
      !bankName.trim() ||
      !bankAccountNumber.trim()
    ) {
      setError("사업자정보(*필수) 항목을 모두 입력해야 저장할 수 있습니다.");
      return;
    }

    setSubmitting(true);
    const input: ArtistInput = {
      slug: artist.slug,
      name: artist.name,
      nameEn,
      tagline,
      bio,
      awards,
      career,
      exhibitions,
      hue: artist.hue,
      artistSplitRate: artist.artistSplitRate,
      bankName,
      bankAccountNumber,
      businessName,
      businessRegNumber,
      businessRegCertUrl,
      businessOwnerName,
      businessAddress,
      businessPhone,
      avatarUrl,
      styleTags: styleTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      commissionAccepting,
      commissionMedia,
      commissionLeadTime,
      commissionPriceRange,
    };
    try {
      await updateArtist(artist.id, input);
      setSaved(true);
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">프로필 사진</span>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 flex-none overflow-hidden border border-line">
            <ArtistAvatar avatarUrl={avatarUrl} hue={artist.hue} seed={artist.slug} className="h-full w-full" />
          </div>
          <label className="cursor-pointer text-xs text-ink-soft hover:text-ink hover:underline">
            {avatarUploading ? "업로드 중..." : "사진 변경"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={avatarUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="작가명">
          <input
            value={artist.name}
            disabled
            className="h-10 w-full border border-line bg-paper-raised px-3 text-sm text-ink-faint"
          />
        </Field>
        <Field label="영문명">
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
      </div>

      <Field label="한 줄 소개">
        <input
          required
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <Field label="작가 소개">
        <textarea
          required
          rows={5}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
      </Field>

      <Field label="수상">
        <textarea
          rows={5}
          placeholder={"예: 2024.01   OO공모전 동상"}
          value={awards}
          onChange={(e) => setAwards(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
        <p className="mt-1.5 text-[11px] text-ink-faint">한 줄에 하나씩, "연도   내용" 형식으로 입력해주세요.</p>
      </Field>

      <Field label="경력">
        <textarea
          rows={5}
          placeholder={"예: 2020   OO대학 교수 역임"}
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
        <p className="mt-1.5 text-[11px] text-ink-faint">한 줄에 하나씩, "연도   내용" 형식으로 입력해주세요.</p>
      </Field>

      <Field label="전시">
        <textarea
          rows={5}
          placeholder={"예: 2024.05   OO갤러리 개인전"}
          value={exhibitions}
          onChange={(e) => setExhibitions(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
        <p className="mt-1.5 text-[11px] text-ink-faint">한 줄에 하나씩, "연도   내용" 형식으로 입력해주세요.</p>
      </Field>

      <Field label="화풍 태그 (쉼표로 구분)">
        <input
          type="text"
          placeholder="예: 인물, 추상, 풍경"
          value={styleTags}
          onChange={(e) => setStyleTags(e.target.value)}
          className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
      </Field>

      <div className="border-t border-line pt-5">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">정산 비율</p>
        <p className="text-sm text-ink-soft">
          작가 {Math.round(artist.artistSplitRate * 100)}% / 갤러리 {Math.round((1 - artist.artistSplitRate) * 100)}%
        </p>
        <p className="mt-1 text-xs text-ink-faint">운영팀이 설정하는 값으로, 작품 판매 정산에 적용됩니다.</p>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          사업자정보 (*필수)
        </p>
        <p className="mb-4 text-xs text-ink-faint">
          작품 상세 페이지, 결제창, 영수증에 판매자 정보로 표시되며 정산에 사용됩니다. 모두
          입력해야 프로필이 저장됩니다.
        </p>

        <Field label="사업자등록증">
          <label className="flex h-24 cursor-pointer flex-col items-center justify-center border border-dashed border-line-strong text-center text-sm text-ink-faint">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              disabled={businessRegCertUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBusinessRegCertUpload(file);
              }}
            />
            {businessRegCertUploading
              ? "업로드 중..."
              : businessRegCertUrl
                ? "사업자등록증 업로드됨 (변경하려면 클릭)"
                : "사업자등록증 파일을 클릭하여 업로드"}
          </label>
        </Field>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="사업자명">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="대표자명">
            <input
              type="text"
              value={businessOwnerName}
              onChange={(e) => setBusinessOwnerName(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="사업자등록번호">
            <input
              type="text"
              placeholder="000-00-00000"
              value={businessRegNumber}
              onChange={(e) => setBusinessRegNumber(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="사업장 주소">
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="사업자 연락처">
            <input
              type="tel"
              placeholder="010-0000-0000"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
        </div>

        <p className="mt-5 mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          정산계좌
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="은행">
            <input
              type="text"
              placeholder="예: 국민은행"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="계좌번호">
            <input
              type="text"
              placeholder="예: 123456-78-901234"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink-faint">작품 판매 정산금이 입금될 계좌입니다.</p>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          커미션 설정 (1:1 주문 제작 의뢰 가능 여부)
        </p>

        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={commissionAccepting}
            onChange={() => setCommissionAccepting((v) => !v)}
            className="accent-patina"
          />
          커미션 접수 중
        </label>

        <Field label="커미션 가능 매체 (복수 선택)">
          <div className="flex flex-wrap gap-2">
            {MEDIUM_CATEGORIES.flatMap((c) => c.types).map((t) => (
              <button
                key={t.code}
                type="button"
                onClick={() => toggleMedia(t.code)}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  commissionMedia.includes(t.code)
                    ? "border-patina bg-patina text-paper"
                    : "border-line-strong bg-paper-raised text-ink-soft hover:text-ink"
                }`}
              >
                {t.nameKo}
              </button>
            ))}
          </div>
        </Field>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="예상 소요 기간">
            <input
              type="text"
              placeholder="예: 4~6주"
              value={commissionLeadTime}
              onChange={(e) => setCommissionLeadTime(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
          <Field label="가격대">
            <input
              type="text"
              placeholder="예: 50만원~200만원"
              value={commissionPriceRange}
              onChange={(e) => setCommissionPriceRange(e.target.value)}
              className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
            <span className="mt-1.5 block text-[11px] text-ink-faint">
              책정 기준 : 최저가(1호 기준), 최고가(100호 기준)
            </span>
          </Field>
        </div>
      </div>

      <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
        {submitting ? "저장 중..." : "저장하기"}
      </button>
      {saved && <p className="text-sm text-patina">저장되었습니다.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
    </label>
  );
}
