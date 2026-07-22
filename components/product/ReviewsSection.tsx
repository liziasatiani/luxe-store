"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("reviews");
  const { data: session } = useSession();
  const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");
  const reviews = useMemo(() => [...initialReviews].sort((a, b) => {
    if (sort === "highest") return b.rating - a.rating;
    if (sort === "lowest") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [initialReviews, sort]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const distribution: Record<number, number> = {};
  reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] ?? 0) + 1; });

  const submitReview = async () => {
    if (!session) { toast.error(t("errors.signIn")); return; }
    if (body.length < 10) { toast.error(t("errors.minLength")); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message ?? t("submit"));
      setShowForm(false);
      setBody("");
      setTitle("");
      setRating(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errors.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h2 className="font-display text-2xl text-black dark:text-white font-light">
          {t("title", { count: reviewCount })}
        </h2>
        <div className="flex items-center gap-3">
          {reviews.length > 1 && (
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="h-8 pl-3 pr-7 border border-black/15 dark:border-white/15 bg-transparent text-[10px] tracking-[0.08em] uppercase text-black dark:text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="highest">{t("sortHighest")}</option>
              <option value="lowest">{t("sortLowest")}</option>
            </select>
          )}
          <Button onClick={() => setShowForm((f) => !f)} variant="outline" size="sm" className="!rounded-none border-black/20 dark:border-white/20 text-[10px] tracking-[0.1em] uppercase">
            {showForm ? t("cancel") : t("writeReview")}
          </Button>
        </div>
      </div>
      {reviewCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 p-6 border border-black/8 dark:border-white/8 mb-8">
          <div className="text-center">
            <p className="font-display text-6xl text-black dark:text-white font-light">{Number(avgRating).toFixed(1)}</p>
            <RatingStars rating={Number(avgRating)} showCount={false} size={18} />
            <p className="text-xs text-black/40 dark:text-white/40 mt-1">{reviewCount} {t("reviews")}</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star] ?? 0;
              const pct = reviewCount ? Math.round((count / reviewCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-black/40 dark:text-white/40 w-4">{star}</span>
                  <Star size={12} fill="#c4821f" stroke="#c4821f" />
                  <div className="flex-1 h-1 bg-black/8 dark:bg-white/8 overflow-hidden">
                    <div className="h-full bg-black dark:bg-white" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-black/40 dark:text-white/40 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border border-black/10 dark:border-white/10 mb-8 space-y-4"
        >
          <h3 className="text-[11px] tracking-[0.12em] uppercase text-black dark:text-white">{t("yourReview")}</h3>
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-black/50 dark:text-white/50 mb-2">{t("rating")}</p>
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
            <label className="block text-[10px] tracking-[0.1em] uppercase text-black/50 dark:text-white/50 mb-1.5">{t("titleField")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="w-full h-11 border border-black/15 dark:border-white/15 bg-white dark:bg-black text-black dark:text-white px-4 focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-black/50 dark:text-white/50 mb-1.5">{t("reviewField")}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("reviewPlaceholder")}
              rows={4}
              className="w-full border border-black/15 dark:border-white/15 bg-white dark:bg-black text-black dark:text-white p-4 focus:outline-none placeholder:text-black/25 dark:placeholder:text-white/25 resize-none text-sm"
            />
          </div>
          <Button onClick={submitReview} loading={submitting} variant="primary" className="!rounded-none text-[11px] tracking-[0.14em] uppercase">{t("submit")}</Button>
        </motion.div>
      )}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-black/40 dark:text-white/40 text-center py-8">{t("noReviews")}</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-black/8 dark:border-white/8 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {review.user.image ? (
                      <Image src={review.user.image} alt={review.user.name ?? "Reviewer"} width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs text-black/50 dark:text-white/50">{review.user.name?.[0] ?? "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-black dark:text-white">{review.user.name}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{formatRelativeTime(review.createdAt)}</p>
                  </div>
                </div>
                <RatingStars rating={review.rating} showCount={false} size={14} />
              </div>
              {review.isVerified && (
                <div className="flex items-center gap-1.5 mt-3 text-[10px] tracking-[0.08em] uppercase text-green-600 dark:text-green-400">
                  <CheckCircle size={11} /> {t("verified")}
                </div>
              )}
              {review.title && <p className="text-sm font-medium text-black dark:text-white mt-3">{review.title}</p>}
              {review.body && <p className="text-sm text-black/60 dark:text-white/60 mt-2 leading-relaxed">{review.body}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
