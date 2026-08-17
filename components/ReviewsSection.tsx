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
  updateReview,
  deleteReview,
  getCurrentUserId,
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

function StarPicker({ rating, onChange }: { rating: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-ink-soft">별점</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n}점`}
          className={n <= rating ? "text-ink" : "text-line-strong"}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function EditReviewForm({
  review,
  onSaved,
  onCancel,
}: {
  review: Review;
  onSaved: (review: Review) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [body, setBody] = useState(review.body);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateReview(review.id, rating, body);
      onSaved({ ...review, rating, body });
    } catch {
      setError("수정하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-line p-4">
      <StarPicker rating={rating} onChange={setRating} />
      <textarea
        required
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
      />
      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className={buttonClasses("primary", "sm")}>
          {submitting ? "저장 중..." : "저장"}
        </button>
        <button type="button" onClick={onCancel} className={buttonClasses("ghost", "sm")}>
          취소
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

export default function ReviewsSection({
  target,
}: {
  target: { artworkId: string } | { productId: string };
}) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isArtwork = "artworkId" in target;

  useEffect(() => {
    const load = isArtwork ? getReviewsForArtwork(target.artworkId) : getReviewsForProduct(target.productId);
    const canLoad = isArtwork ? canReviewArtwork(target.artworkId) : canReviewProduct(target.productId);
    load.then(setReviews).catch(() => setReviews([]));
    canLoad.then(setCanReview);
    getCurrentUserId().then(setUserId);
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
        { id: crypto.randomUUID(), userId: userId ?? "", rating, body, createdAt: new Date().toISOString() },
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

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteReview(id);
      setReviews((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
      setCanReview(true);
    } catch {
      setError("삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeletingId(null);
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
          <StarPicker rating={rating} onChange={setRating} />
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
          {reviews.map((r) =>
            editingId === r.id ? (
              <li key={r.id}>
                <EditReviewForm
                  review={r}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => {
                    setReviews((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)) : prev));
                    setEditingId(null);
                  }}
                />
              </li>
            ) : (
              <li key={r.id} className="border-b border-line pb-5">
                <div className="mb-1 flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{r.body}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-ink-faint">구매자</p>
                  {userId && r.userId === userId && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(r.id)}
                        className="text-xs text-ink-soft hover:text-ink hover:underline"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === r.id}
                        onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-600 hover:underline disabled:opacity-40"
                      >
                        {deletingId === r.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
