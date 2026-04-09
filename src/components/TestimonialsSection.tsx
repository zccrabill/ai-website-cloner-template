import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  company: string;
  text: string;
  rating: number;
  image?: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    company: 'TechStart Inc',
    text: 'Available Law transformed how we approach legal compliance. Their AI-powered solutions saved us countless hours and gave us confidence in our regulatory posture.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    company: 'Growth Capital Partners',
    text: 'The platform is intuitive and the support team is exceptional. We\'ve reduced our legal review time by 60% while maintaining higher accuracy standards.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    company: 'Digital Ventures LLC',
    text: 'As a startup founder, I needed accessible legal guidance without the enterprise price tag. Available Law delivered exactly that. Highly recommended.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: 'James Mitchell',
    company: 'Quantum Solutions',
    text: 'Integrating their API into our workflow was seamless. The accuracy and speed of their legal analysis tools have been game-changing for our compliance team.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  },
  {
    id: 5,
    name: 'Priya Kapoor',
    company: 'Innovate Labs',
    text: 'Outstanding service. The platform not only provides legal templates but also educational resources that helped our team understand complex regulations.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState(3);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getVisibleReviews = () => {
    const result = [];
    for (let i = 0; i < visibleReviews; i++) {
      result.push(reviews[(currentIndex + i) % reviews.length]);
    }
    return result;
  };

  return (
    <section id="testimonials" className="w-full bg-[#0f0f14] py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-16 flex items-baseline justify-center gap-2">
          <h2 className="text-4xl font-bold">
            <span className="text-[#71717a]">from:</span>{' '}
            <span className="text-[#f59e0b]">clients</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-3">
          {getVisibleReviews().map((review) => (
            <div
              key={review.id}
              className="group relative overflow-hidden rounded-lg border border-white/8 bg-[#111113] p-6 transition-all duration-300 hover:border-white/12 hover:bg-[#1a1a1f]"
            >
              {/* Gradient border effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-10" />

              {/* Quote text */}
              <p className="relative mb-6 text-base leading-relaxed text-[#d4d4d8]">
                "{review.text}"
              </p>

              {/* Stars */}
              <div className="relative mb-6 flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-[#f59e0b] text-[#f59e0b]"
                  />
                ))}
              </div>

              {/* Client info */}
              <div className="relative flex items-center gap-3">
                {review.image && (
                  <img
                    src={review.image}
                    alt={review.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {review.name}
                  </p>
                  <p className="text-xs text-[#71717a]">{review.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="mt-12 flex items-center justify-center gap-8">
          {/* Previous Button */}
          <button
            onClick={prev}
            className="group rounded-full border border-[#71717a] p-2 transition-all duration-300 hover:border-[#f59e0b]"
            aria-label="Previous testimonial"
          >
            <ChevronLeft
              size={20}
              className="text-[#71717a] transition-colors duration-300 group-hover:text-[#f59e0b]"
            />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-[#f59e0b]'
                    : 'w-2 bg-[#71717a] hover:bg-[#f59e0b]'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={next}
            className="group rounded-full border border-[#71717a] p-2 transition-all duration-300 hover:border-[#f59e0b]"
            aria-label="Next testimonial"
          >
            <ChevronRight
              size={20}
              className="text-[#71717a] transition-colors duration-300 group-hover:text-[#f59e0b]"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
