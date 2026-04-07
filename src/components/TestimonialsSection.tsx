"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Review {
  quote: string;
  client: string;
}

const reviews: Review[] = [
  {
    quote:
      "Excellent legal analysis with a quick turnaround time. Their review of our Terms and Conditions was thorough, well-reasoned, and included practical recommendations tailored to our business needs. Communication was professional and responsive. Highly recommend for business contract review.",
    client: "Enhance Safety Training",
  },
  {
    quote:
      "Zachariah went above and beyond to help me and was extremely thorough in answering all of my questions.",
    client: "Indigo Floral Co.",
  },
  {
    quote:
      "Zachariah did a wonderful job with my quickly needed request. He was responsive, thorough, and fast. Would use him again in a heart beat for any legal matter.",
    client: "Brooke H.",
  },
  {
    quote:
      "Zachariah did a great job, didn't over promise, was realistic with expectations and ultimately the case went my way. Raging success.",
    client: "Hassle Free Logistics, LLC",
  },
  {
    quote: "Zach was easy to work with and delivered our lease before the estimated time.",
    client: "Kerry P.",
  },
  {
    quote: "I'm glad to have someone of Zach's caliber standing up for people in this community.",
    client: "Kathy A.",
  },
  {
    quote:
      "Zachariah C. was thorough, fast, and incredibly thoughtful throughout the entire process. He's highly informed, easy to work with, and communicates complex points clearly. I'd absolutely recommend him to anyone looking for sharp, responsive counsel.",
    client: "Molly L.",
  },
  {
    quote: "Great quality of work and timeliness. Couldn't have been better.",
    client: "Church of the Sacred Synthesis",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  function goTo(index: number) {
    setActiveIndex((index + reviews.length) % reviews.length);
  }

  function handlePrev() {
    goTo(activeIndex - 1);
  }

  function handleNext() {
    goTo(activeIndex + 1);
  }

  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        minHeight: "894px",
        width: "100%",
      }}
    >
      {/* Heading */}
      <div
        style={{
          paddingTop: "80px",
          textAlign: "center",
          marginBottom: "48px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading), 'Playfair Display', Georgia, serif",
            fontSize: "48px",
            fontWeight: 400,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          <span style={{ color: "#6b7280" }}>from:&nbsp;</span>
          <span style={{ color: "#f59e0b" }}>clients</span>
        </h2>
      </div>

      {/* Carousel wrapper */}
      <div
        style={{
          maxWidth: "1411px",
          margin: "0 auto",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Track */}
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              style={{
                minWidth: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 16px",
                boxSizing: "border-box",
              }}
            >
              {/* Card */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "16px",
                  boxShadow:
                    "rgba(0,0,0,0.05) 0px 2px 4px, rgba(0,0,0,0.06) 0px 8px 16px, rgba(0,0,0,0.04) 0px 16px 32px",
                  padding: "50px 55px",
                  maxWidth: "800px",
                  width: "100%",
                }}
              >
                {/* Stars */}
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "20px",
                    marginBottom: "24px",
                    letterSpacing: "2px",
                  }}
                >
                  ★★★★★
                </div>

                {/* Quote */}
                <p
                  style={{
                    fontFamily:
                      "var(--font-body), 'Pontano Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: "18px",
                    color: "#1d1d1f",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    margin: "0 0 28px 0",
                  }}
                >
                  &ldquo;{review.quote}&rdquo;
                </p>

                {/* Client name */}
                <p
                  style={{
                    fontFamily:
                      "var(--font-body), 'Pontano Sans', ui-sans-serif, system-ui, sans-serif",
                    fontSize: "15px",
                    color: "#86868b",
                    margin: 0,
                  }}
                >
                  — {review.client}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginTop: "40px",
          paddingBottom: "60px",
        }}
      >
        {/* Prev arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous testimonial"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#6b7280",
            padding: "8px",
            lineHeight: 1,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
          }}
        >
          ←
        </button>

        {/* Dots */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === activeIndex ? "bg-amber-400" : "bg-transparent"
              )}
              style={{
                width: "10px",
                height: "10px",
                border: i === activeIndex ? "2px solid #f59e0b" : "2px solid #6b7280",
                backgroundColor: i === activeIndex ? "#f59e0b" : "transparent",
                borderRadius: "50%",
                padding: 0,
                cursor: "pointer",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          aria-label="Next testimonial"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#6b7280",
            padding: "8px",
            lineHeight: 1,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
          }}
        >
          →
        </button>
      </div>
    </section>
  );
}
