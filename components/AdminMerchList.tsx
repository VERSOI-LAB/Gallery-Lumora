"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MerchThumbnail from "./MerchThumbnail";
import { buttonClasses } from "@/lib/ui";
import { formatKRW } from "@/lib/format";
import { getMerchCategoryLabel } from "@/lib/merchTaxonomy";
import { downloadCsv } from "@/lib/csv";
import { adminAddMerchEditions, adminDeleteMerchProduct, adminUpdateMerchProductActive } from "@/lib/adminActions";
import type { MerchProduct } from "@/lib/types";

function RestockControl({
  productId,
  onRestocked,
}: {
  productId: string;
  onRestocked: (added: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-patina hover:underline">
        재입고
      </button>
    );
  }

  async function handleAdd() {
    setSubmitting(true);
    setError(false);
    try {
      await adminAddMerchEditions(productId, count);
      onRestocked(count);
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <span className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        className="h-7 w-16 border border-line-strong bg-paper-raised px-2 text-xs outline-patina"
      />
      <button
        type="button"
        disabled={submitting || count < 1}
        onClick={handleAdd}
        className="text-xs font-semibold text-patina hover:underline disabled:opacity-50"
      >
        {submitting ? "추가 중..." : "추가"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-faint hover:underline">
        취소
      </button>
      {error && <span className="text-xs text-red-600">실패</span>}
    </span>
  );
}

export default function AdminMerchList({
  products: initial,
  editionsRemaining: initialRemaining,
}: {
  products: MerchProduct[];
  editionsRemaining: Record<string, number>;
}) {
  const [products, setProducts] = useState(initial);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("이 상품을 삭제하시겠습니까? 연결된 주문이 있으면 삭제할 수 없습니다.")) return;
    setDeletingId(id);
    setDeleteErrorId(null);
    try {
      await adminDeleteMerchProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  }

  const term = keyword.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.artistName.toLowerCase().includes(term) ||
        getMerchCategoryLabel(p.category).toLowerCase().includes(term)
    );
  }, [products, term]);

  async function toggleActive(product: MerchProduct) {
    const next = !product.active;
    setPendingId(product.id);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: next } : p)));
    try {
      await adminUpdateMerchProductActive(product.id, next);
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: !next } : p)));
    } finally {
      setPendingId(null);
    }
  }

  function handleRestocked(productId: string, added: number) {
    setRemaining((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + added }));
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, editionSize: (p.editionSize ?? 0) + added } : p))
    );
  }

  function exportCsv() {
    downloadCsv(
      `lumora-merch-products-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((p) => ({
        상품명: p.title,
        카테고리: getMerchCategoryLabel(p.category),
        작가: p.isTemplate ? "템플릿(작품 선택형)" : p.artistName,
        가격: p.price,
        판매상태: p.active ? "판매중" : "비활성",
        재고: p.fulfillment === "edition" ? (remaining[p.id] ?? 0) : "",
      }))
    );
  }

  if (products.length === 0) {
    return <p className="text-sm text-ink-faint">등록된 굿즈 상품이 없습니다.</p>;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="상품명, 작가명, 카테고리로 검색"
          className="h-10 flex-1 min-w-[200px] border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className={`${buttonClasses("ghost", "sm")} disabled:opacity-40`}
        >
          CSV 내보내기
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map((product) => {
            const isEdition = product.fulfillment === "edition";
            const stockLeft = remaining[product.id] ?? 0;
            return (
              <div key={product.id}>
              <div className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 flex-none overflow-hidden">
                  <MerchThumbnail
                    imageUrls={product.imageUrls}
                    hue={product.hue}
                    variant={product.variant}
                    seed={product.slug}
                    className="h-full w-full"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{product.title}</span>
                    {isEdition && (
                      <span
                        className={`flex-none border px-1.5 py-0.5 text-[10px] ${
                          stockLeft === 0
                            ? "border-red-600 text-red-600"
                            : "border-line text-ink-faint"
                        }`}
                      >
                        재고 {stockLeft} / {product.editionSize}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {getMerchCategoryLabel(product.category)} ·{" "}
                    {product.isTemplate ? "템플릿(작품 선택형)" : product.artistName} · {formatKRW(product.price)}
                  </div>
                </div>

                <div className="flex flex-none items-center gap-4">
                  {isEdition && (
                    <RestockControl
                      productId={product.id}
                      onRestocked={(added) => handleRestocked(product.id, added)}
                    />
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={product.active}
                    aria-label="판매중"
                    disabled={pendingId === product.id}
                    onClick={() => toggleActive(product)}
                    className={`relative h-6 w-10 flex-none rounded-full transition-colors disabled:opacity-50 ${
                      product.active ? "bg-patina" : "bg-line-strong"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform ${
                        product.active ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <Link
                    href={`/admin/merch/${product.id}/edit`}
                    className="text-xs text-ink-soft hover:text-ink hover:underline"
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === product.id}
                    onClick={() => remove(product.id)}
                    className="text-xs text-red-600 hover:underline disabled:opacity-40"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {deleteErrorId === product.id && (
                <p className="pb-3 text-xs text-red-600">
                  삭제하지 못했습니다. 이 상품에 연결된 주문이 있는지 확인해주세요.
                </p>
              )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
