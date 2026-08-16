"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import {
  createMerchProduct,
  updateMerchProduct,
  type MerchProductInput,
} from "@/lib/queries";
import { MERCH_CATEGORIES } from "@/lib/merchTaxonomy";
import type { Artwork, MerchProduct } from "@/lib/types";

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "product"}-${suffix}`;
}

export default function AdminMerchForm({
  product,
  artworks,
}: {
  product?: MerchProduct;
  artworks?: Artwork[];
}) {
  const router = useRouter();
  const [artworkId, setArtworkId] = useState(product?.artworkId ?? artworks?.[0]?.id ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? MERCH_CATEGORIES[0].code);
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [royaltyRate, setRoyaltyRate] = useState(product?.royaltyRate ?? 0.18);
  const [fulfillment, setFulfillment] = useState<"edition" | "stock">(product?.fulfillment ?? "stock");
  const [editionSize, setEditionSize] = useState(product?.editionSize ?? 50);
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity ?? 0);
  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedArtwork = artworks?.find((a) => a.id === artworkId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input: MerchProductInput = {
      slug: slug || slugify(title),
      artworkId,
      artistId: product?.artistId ?? selectedArtwork?.artistId ?? "",
      category,
      title,
      description,
      price,
      royaltyRate,
      fulfillment,
      editionSize: fulfillment === "edition" ? editionSize : null,
      stockQuantity: fulfillment === "stock" ? stockQuantity : null,
      hasVariants,
      active,
      coverHue: product?.hue ?? selectedArtwork?.hue ?? Math.floor(Math.random() * 360),
      coverVariant: product?.variant ?? selectedArtwork?.variant ?? 0,
    };
    try {
      if (product) {
        await updateMerchProduct(product.id, input);
        router.refresh();
      } else {
        const id = await createMerchProduct(input);
        router.push(`/admin/merch/${id}/edit`);
        router.refresh();
        return;
      }
    } catch {
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {!product && artworks && (
        <Field label="연결할 작품">
          <select
            required
            value={artworkId}
            onChange={(e) => setArtworkId(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          >
            {artworks.map((a) => (
              <option key={a.id} value={a.id}>
                {a.artistName} — {a.title}
              </option>
            ))}
          </select>
        </Field>
      )}
      {product && (
        <p className="text-xs text-ink-faint">
          연결된 작품: {product.artworkTitle} ({product.artistName})
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="상품명">
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="슬러그 (비워두면 자동 생성)">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-에-쓰일-slug"
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="카테고리">
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          >
            {MERCH_CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.nameKo}
              </option>
            ))}
          </select>
        </Field>
        <Field label="가격 (원)">
          <input
            required
            type="number"
            step={1000}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
        <Field label="로열티율 (0~1, 예: 0.18 = 18%)">
          <input
            required
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={royaltyRate}
            onChange={(e) => setRoyaltyRate(Number(e.target.value))}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </Field>
      </div>

      <Field label="상품 설명">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm leading-relaxed outline-patina"
        />
      </Field>

      <div className="border-t border-line pt-5">
        <p className="mb-4 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">판매 방식</p>

        {product ? (
          <p className="mb-4 text-sm text-ink-soft">
            {fulfillment === "edition" ? `한정 에디션 (총 ${editionSize}점)` : "일반 재고"}{" "}
            <span className="text-xs text-ink-faint">— 등록 후에는 변경할 수 없습니다.</span>
          </p>
        ) : (
          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                checked={fulfillment === "stock"}
                onChange={() => setFulfillment("stock")}
                className="accent-patina"
              />
              일반 재고
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                checked={fulfillment === "edition"}
                onChange={() => setFulfillment("edition")}
                className="accent-patina"
              />
              한정 에디션
            </label>
          </div>
        )}

        {!product && fulfillment === "edition" && (
          <Field label="한정 수량">
            <input
              required
              type="number"
              min={1}
              value={editionSize}
              onChange={(e) => setEditionSize(Number(e.target.value))}
              className="h-10 w-full max-w-xs border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
        )}

        {fulfillment === "stock" && (
          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={() => setHasVariants((v) => !v)}
              className="accent-patina"
            />
            옵션(사이즈·색상 등) 사용
          </label>
        )}

        {fulfillment === "stock" && !hasVariants && (
          <Field label="재고 수량">
            <input
              required
              type="number"
              min={0}
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="h-10 w-full max-w-xs border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
            />
          </Field>
        )}
        {fulfillment === "stock" && hasVariants && product && (
          <p className="text-xs text-ink-faint">재고는 아래 옵션별로 관리합니다.</p>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" checked={active} onChange={() => setActive((v) => !v)} className="accent-patina" />
        판매중 (Shop에 노출)
      </label>

      <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
        {submitting ? "저장 중..." : product ? "수정 완료" : "상품 등록"}
      </button>
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
