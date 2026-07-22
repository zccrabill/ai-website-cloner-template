"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Review {
  rating: number;
  matter: string;
  quote: string;
  author: string;
}

// Shape returned by the get_published_reviews RPC — approved rows from the
// /review collection flow, display fields only.
interface PublishedReview {
  id: string;
  rating: number;
  practice_area: string | null;
  display_name: string;
  review_text: string;
  approved_at: string;
}

const REVIEWS: Review[] = [
  {
    rating: 5,
    matter: "Real Estate Indemnity Agreement",
    quote:
      "Zachariah was prompt, thorough and very detail-oriented. He explained the human oversight and expertise was used throughout the whole process, after the initial clerical work which is completed by his AI legal software. The final work product was exactly what we needed and above and beyond what we hoped for. Thank you very much!",
    author: "Real Estate Purchase Agreement client",
  },
  {
    rating: 5,
    matter: "Separation Agreement Review",
    quote:
      "Zachariah C. was thorough, fast, and incredibly thoughtful throughout the entire process. He's highly informed, easy to work with, and communicates complex points clearly. I'd absolutely recommend him to anyone looking for sharp, responsive counsel.",
    author: "Severance Package client",
  },
  {
    rating: 5,
    matter: "Terms & Conditions Review",
    quote:
      "Zachariah provided excellent legal analysis with a quick turnaround time. His review of our Terms and Conditions was thorough, well-reasoned, and included practical recommendations tailored to our business needs. His communication was professional and responsive. Highly recommend for business contract review.",
    author: "Online Safety Training Co.",
  },
  {
    rating: 5,
    matter: "Cease and Desist Letter",
    quote:
      "Zachariah did a wonderful job with my quickly needed request. He was responsive, thorough, and fast. Would use him again in a heart beat for any legal matter.",
    author: "Cease and Desist client",
  },
  {
    rating: 5,
    matter: "Wedding Florist Contract",
    quote:
      "Zachariah went above and beyond to help me and was extremely thorough in answering all of my questions.",
    author: "Event Space Rental client",
  },
  {
    rating: 5,
    matter: "Commercial Collections Dispute",
    quote:
      "Zachariah did a great job, didn't over promise, was realistic with expectations and ultimately the case went my way. Raging success.",
    author: "Commercial Driving Company",
  },
  {
    rating: 5,
    matter: "Catering Services Agreement",
    quote:
      "Amazing to work with!",
    author: "Steve, Private Chef & Catering",
  },
  {
    rating: 5,
    matter: "Rental Lease Agreement",
    quote:
      "Zach was easy to work with and delivered our lease before the estimated time.",
    author: "Rental Lease client",
  },
  {
    rating: 5,
    matter: "Terms of Service Review",
    quote:
      "Great quality of work and timeliness couldn't have been better.",
    author: "Colorado ToS client",
  },
  {
    rating: 5,
    matter: "Liability Waiver & Rental Contract",
    quote: "Very responsive and great to work with.",
    author: "Event Rental Business Owner",
  },
  {
    rating: 5,
    matter: "Commercial Lease Review",
    quote:
      "Zachariah delivered a thorough 11-page memo that covered enforceability analysis, Colorado-specific compliance, and practical recommendations. He identified threshold issues I hadn't considered and provided clear, actionable revisions. The follow-up call was equally valuable. Fast turnaround, no filler, and easy to work with. Exactly what you want from an attorney on a commercial deal.",
    author: "Commercial Tenant",
  },
  {
    rating: 5,
    matter: "Revocable Living Trust Review",
    quote:
      "Zachariah provided a thorough and well-organized review of our executed living trust. He identified legitimate items worth addressing and was responsive throughout. We had one disagreement on a flagged provision that was resolved quickly and professionally. Would use again for Colorado estate matters.",
    author: "Colorado Estate client",
  },
  {
    rating: 5,
    matter: "Quitclaim Deed Drafting",
    quote: "Quick, easy, as intended :)",
    author: "Property Deed client",
  },
  {
    rating: 5,
    matter: "Phantom Stock Agreement Review",
    quote:
      "Zach did a great job and had my best interests at heart during the review process.",
    author: "Founder, VC-track startup",
  },
];

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  // Approved reviews from the /review flow render ahead of the hardcoded
  // historical set. Fetch failures fall back silently to the static list.
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.rpc("get_published_reviews");
        if (error || !Array.isArray(data) || data.length === 0) return;
        const published: Review[] = (data as PublishedReview[]).map((r) => ({
          rating: r.rating,
          matter: r.practice_area ?? "Client Review",
          quote: r.review_text,
          author: r.display_name,
        }));
        if (!cancelled) setReviews([...published, ...REVIEWS]);
      } catch {
        // Static list already rendered — nothing to do.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const next = () => setIndex((i) => (i + 1) % reviews.length);
  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);

  const review = reviews[index];

  return (
    <section
      id="testimonials"
      className="w-full bg-[#F5F0EB] py-[120px] px-6"
    >
      <div className="mx-auto max-w-[1100px] flex flex-col items-center">
        {/* Label */}
        <p className="text-sm font-semibold text-[#C17832] uppercase tracking-widest mb-3">
          What Clients Say
        </p>
        <h2 className="text-3xl md:text-4xl font-heading text-[#1F1810] mb-2 text-center">
          Real reviews from real clients
        </h2>
        <div className="flex items-center gap-2 mb-12">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-[#C17832] text-[#C17832]"
              />
            ))}
          </div>
          <span className="text-sm text-[#6B5B4E]">
            {(
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)}{" "}
            average · {reviews.length} verified reviews
          </span>
        </div>

        {/* Featured review carousel */}
        <div className="w-full max-w-[800px] bg-white rounded-2xl border border-[#1F1810]/8 shadow-sm p-10 md:p-14 mb-8 relative">
          <div className="text-[100px] text-[#C17832] opacity-15 leading-none font-heading absolute top-4 left-8">
            &ldquo;
          </div>

          {/* Inner wrapper is flex-col with a fixed min-height so the card
              doesn't resize when reviews have different lengths. The blockquote
              uses flex-1 to absorb extra space, which pins the attribution
              row + carousel buttons to the same vertical position on every
              slide. */}
          <div className="relative flex flex-col min-h-[360px] md:min-h-[400px]">
            {/* Stars — right-aligned so they balance the large quotation-mark
                decoration on the top-left, keeping the top-left corner less busy. */}
            <div className="flex gap-1 mb-6 justify-end">
              {[...Array(review.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-[#C17832] text-[#C17832]"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mb-8 flex-1">
              <p className="text-xl md:text-2xl font-heading text-[#1F1810] leading-snug">
                {review.quote}
              </p>
            </blockquote>

            {/* Attribution */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1F1810]">
                  {review.author}
                </p>
                <p className="text-xs text-[#A89279] uppercase tracking-wider mt-1">
                  {review.matter}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-full border border-[#1F1810]/10 hover:bg-[#1F1810] hover:text-white hover:border-[#1F1810] transition-all flex items-center justify-center text-[#6B5B4E]"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#A89279] tabular-nums">
                  {index + 1} / {reviews.length}
                </span>
                <button
                  onClick={next}
                  className="w-9 h-9 rounded-full border border-[#1F1810]/10 hover:bg-[#1F1810] hover:text-white hover:border-[#1F1810] transition-all flex items-center justify-center text-[#6B5B4E]"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-[#C17832]"
                  : "w-1.5 bg-[#1F1810]/15 hover:bg-[#1F1810]/30"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
