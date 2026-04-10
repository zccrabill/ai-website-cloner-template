"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  rating: number;
  matter: string;
  quote: string;
  author: string;
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
];

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % REVIEWS.length);
  const prev = () => setIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length);

  const review = REVIEWS[index];

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
            5.0 average · {REVIEWS.length} verified reviews
          </span>
        </div>

        {/* Featured review carousel */}
        <div className="w-full max-w-[800px] bg-white rounded-2xl border border-[#1F1810]/8 shadow-sm p-10 md:p-14 mb-8 relative">
          <div className="text-[100px] text-[#C17832] opacity-15 leading-none font-heading absolute top-4 left-8">
            &ldquo;
          </div>

          <div className="relative">
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(review.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-[#C17832] text-[#C17832]"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mb-8">
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
                  {index + 1} / {REVIEWS.length}
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
          {REVIEWS.map((_, i) => (
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
