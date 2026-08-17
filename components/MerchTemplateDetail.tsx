"use client";

import { useRef, useState } from "react";
import MerchArtworkPicker from "./MerchArtworkPicker";
import MerchCanvasEditor, { type MerchCanvasEditorHandle } from "./MerchCanvasEditor";
import MerchPurchaseForm from "./MerchPurchaseForm";
import { uploadMedia } from "@/lib/queries";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";
import type { Artwork, MerchProduct, MerchVariant } from "@/lib/types";

/** Product detail layout for "템플릿" 굿즈(엽서·포스터·캔버스 액자·노트·에코백·
 * 머그컵·텀블러·스카프 등) — 관리자가 특정 작품 없이 빈 상품만 등록해두고,
 * 고객이 작품을 골라 상품 사진 위 캔버스에서 배치·텍스트 추가까지 마친 뒤
 * 구매를 확정한다. */
export default function MerchTemplateDetail({
  product,
  variants,
  editionsRemaining,
}: {
  product: MerchProduct;
  variants: MerchVariant[];
  editionsRemaining: number | null;
}) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const canvasRef = useRef<MerchCanvasEditorHandle>(null);

  async function exportDesignImage(): Promise<string | null> {
    const blob = await canvasRef.current?.exportPng();
    if (!blob) return null;
    const file = new File([blob], "design.png", { type: "image/png" });
    const path = `merch-designs/${product.slug}/${crypto.randomUUID()}.png`;
    return uploadMedia(path, file);
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <MerchCanvasEditor
          ref={canvasRef}
          backgroundImageUrl={product.imageUrls[0] ?? null}
          artwork={selectedArtwork}
          onRequestArtwork={() => setPickerOpen(true)}
          onArtworkRemoved={() => setSelectedArtwork(null)}
        />
      </div>

      <div>
        <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
          {getMerchCategoryLabel(product.category)}
        </span>
        <h1 className="mt-2 mb-2 font-display text-2xl">{product.title}</h1>
        <p className="text-sm text-patina">고객이 작품을 직접 선택해 디자인하는 상품입니다</p>

        {product.description && (
          <p className="mt-4 text-sm leading-7 text-ink-soft">{product.description}</p>
        )}

        {pickerOpen && (
          <div className="mt-6 border border-line p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] tracking-wide text-ink-soft uppercase">디자인할 작품 선택</span>
              <button type="button" onClick={() => setPickerOpen(false)} className="text-xs text-ink-faint hover:text-ink">
                닫기
              </button>
            </div>
            <MerchArtworkPicker
              selected={selectedArtwork}
              onSelect={(a) => {
                setSelectedArtwork(a);
                setPickerOpen(false);
              }}
            />
          </div>
        )}

        <div className="mt-8">
          <MerchPurchaseForm
            product={product}
            variants={variants}
            editionsRemaining={editionsRemaining}
            selectedArtworkId={selectedArtwork?.id ?? null}
            requiresArtworkSelection
            exportDesignImage={exportDesignImage}
          />
        </div>
      </div>
    </div>
  );
}
