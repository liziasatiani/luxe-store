"use client";
import { useState } from "react";
import Image from "next/image";
import { Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerified: boolean;
  createdAt: Date | string;
  helpfulCount: number;
  user: { id: string; name?: string | null; image?: string | null };
}

interface Props {
  productId: string;
  initialReviews: Review[];
  avgRating: number;
  reviewCount: number;
}

export function ReviewsSection({ productId, initialReviews, avgRating, reviewCount }: Props) {
  const { data: session } = useSession();
  const [reviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const distribution: Record<number, number> = {};
  reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1; });

  const handleSubmit = async () => {
    if (!session) { toast.error("Sign in to leave a review"); return; }
    if (body.length < 10) { toast.error("Review must be at least 10 characters"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message ?? "Review submitted!");
      setShowForm(false);
      setBody("");
      setTitle("");
      setRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl text-surface-900 dark:text-white">
          Customer Reviews ({reviewCount})
        </h2>
        <Button onClick={() => setShowForm((f) => !f)} variant="outline" size="sm">
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Summary */}
      {reviewCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 p-6 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-800 mb-8">
          <div className="text-center">
            <p className="font-display text-6xl text-surface-900 dark:text-white">{Number(avgRating).toFixed(1)}</p>
            <RatingStars rating={Number(avgRating)} showCount={false} size={18} />
            <p className="text-sm text-surface-400 mt-1">{reviewCount} reviews</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] ?? 0;
              const pct = reviewCount ? Math.round((count / reviewCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-surface-500 w-4">{star}</span>
                  <Star size={12} fill="#c4821f" stroke="#c4821f" />
                  <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-surface-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-surface-200 dark:border-surface-700 mb-8 space-y-4"
        >
          <h3 className="font-semibold text-surface-900 dark:text-white">Your Review</h3>
          <div>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                >
                  <Star
                    size={28}
                    fill={s <= (hoverRating || rating) ? "#c4821f" : "none"}
                    stroke="#c4821f"
                    className="transition-all"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full h-11 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white px-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 placeholder:text-surface-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Review *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others about this product…"
              rows={4}
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white p-4 focus:outline-none focus:ring-2 focus:ring-brand-500/40 placeholder:text-surface-400 resize-none"
            />
          </div>
          <Button onClick={handleSubmit} loading={submitting} variant="gold">Submit Review</Button>
        </motion.div>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-surface-400 text-center py-8">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-surface-100 dark:border-surface-800 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden flex items-center justify-center">
                    {review.user.image ? (
                      <Image src={review.user.image} alt={review.user.name ?? ""} width={40} height={40} className="object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-surface-500">{review.user.name?.[0] ?? "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-surface-900 dark:text-white">{review.user.name}</p>
                    <p className="text-xs text-surface-400">{formatRelativeTime(review.createdAt)}</p>
                  </div>
                </div>
                <RatingStars rating={review.rating} showCount={false} size={14} />
              </div>
              {review.isVerified && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle size={12} /> Verified Purchase
                </div>
              )}
              {review.title && <p className="font-semibold text-surface-900 dark:text-white mt-3">{review.title}</p>}
              {review.body && <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 leading-relaxed">{review.body}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
