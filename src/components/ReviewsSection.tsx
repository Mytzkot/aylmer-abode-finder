import { useEffect, useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getActiveReviews } from "@/lib/reviews.functions";
import { T } from "@/i18n/LanguageProvider";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  source: string;
  review_date: string;
  verified: boolean;
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <Star
            key={i}
            className={`w-4 h-4 ${filled ? "fill-coral text-coral" : "text-ink/20"}`}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const date = new Date(r.review_date).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
  return (
    <article className="snap-start shrink-0 w-[85%] sm:w-auto bg-white rounded-2xl border border-border/40 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Stars rating={r.rating} />
        {r.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <p className="text-[14px] text-ink/85 leading-relaxed line-clamp-6">
        “{r.review_text}”
      </p>
      <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between text-[12px]">
        <span className="font-bold text-ink">{r.reviewer_name}</span>
        <span className="text-ink/60">
          {r.source} · {date}
        </span>
      </div>
    </article>
  );
}

export function ReviewsSection() {
  const fetchReviews = useServerFn(getActiveReviews);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchReviews()
      .then((r) => {
        if (!cancelled) setReviews(r.reviews as Review[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fetchReviews]);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="text-center mb-3">
          <h2 className="font-display text-3xl md:text-5xl text-ink">
            <T>What Our Guests Say</T>
          </h2>
          <p className="mt-3 text-ink/70 text-base md:text-lg">
            <T>Trusted by 4,000+ guests across Airbnb, Expedia and Booking.com</T>
          </p>
        </div>

        <div className="mt-10 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          {reviews.slice(0, 4).map((r) => (
            <ReviewCard key={r.id} r={r} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Stars rating={4.8} />
            <span className="font-bold text-ink text-[15px]">
              <T>Rated 4.8/5 by our guests</T>
            </span>
          </div>
          <a
            href="https://airbnb.com"
            target="_blank"
            rel="noreferrer"
            className="btn-pill btn-coral px-6 py-3 text-base font-bold"
          >
            <T>See our reviews on Airbnb</T>
          </a>
        </div>
      </div>
    </section>
  );
}
