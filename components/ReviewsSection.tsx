"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buttonClasses } from "@/lib/ui";
import { formatDate } from "@/lib/format";
import {
  getReviewsForArtwork,
  getReviewsForProduct,
  canReviewArtwork,
  canReviewProduct,
  submitReview,
  type Review,
} from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`별점 ${rating}점`} className="tracking-wide text-ink">
      {"★".repeat(rating)}
      <span className="text-line-strong">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsSection({
  target,
}: {
  target: { artworkId: string } | { productId: string };
}) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isArtwork = "artworkId" in target;

  useEffect(() => {
    const load = isArtwork ? getReviewsForArtwork(target.artworkId) : getReviewsForProduct(target.productId);
    const canLoad = isArtwork ? canReviewArtwork(target.artworkId) : canReviewProduct(target.productId);
    load.then(setReviews).catch(() => setReviews([]));
    canLoad.then(setCanReview);
    // target identifies a fixed page for its lifetime; no need to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(isArtwork ? { artworkId: target.artworkId } : { productId: target.productId }, rating, body);
      setReviews((prev) => [
        { id: crypto.randomUUID(), rating, body, createdAt: new Date().toISOString() },
        ...(prev ?? []),
      ]);
      setCanReview(false);
      setBody("");
    } catch {
      setError("후기 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reviews === null) return null;

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="border-t border-line pt-8">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-editorial text-lg">구매 후기</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-ink-soft">
            <Stars rating={Math.round(average)} /> {average.toFixed(1)} ({reviews.length})
          </span>
        )}
      </div>

      {canReview && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3 border border-line p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-soft">별점</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n}점`}
                className={n <= rating ? "text-ink" : "text-line-strong"}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="구매 후기를 남겨주세요"
            className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
          />
          <button type="submit" disabled={submitting} className={buttonClasses("primary", "sm")}>
            {submitting ? "등록 중..." : "후기 등록"}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-ink-faint">아직 등록된 후기가 없습니다.</p>
      ) : (
        <ul className="space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-line pb-5">
              <div className="mb-1 flex items-center justify-between">
                <Stars rating={r.rating} />
                <span className="text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{r.body}</p>
              <p className="mt-1 text-xs text-ink-faint">구매자</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
