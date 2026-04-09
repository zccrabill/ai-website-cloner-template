"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeaturedInSection from "@/components/FeaturedInSection";
import PerksSection from "@/components/PerksSection";
import PricingSection from "@/components/PricingSection";
import SolutionsSection from "@/components/SolutionsSection";
import BillingSection from "@/components/BillingSection";
import QuoteSection from "@/components/QuoteSection";
import Footer from "@/components/Footer";
import FaiirModal from "@/components/FaiirModal";
import ConciergeButton from "@/components/ConciergeButton";

export default function Home() {
  const [isFaiirOpen, setIsFaiirOpen] = useState(false);

  const handleFaiirOpen = () => setIsFaiirOpen(true);
  const handleFaiirClose = () => setIsFaiirOpen(false);

  return (
    <>
      <Header onFaiirOpen={handleFaiirOpen} />
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        <div id="about">
          <PerksSection />
        </div>
        <div id="solutions">
          <SolutionsSection />
        </div>
        <TestimonialsSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <BillingSection />
        <FeaturedInSection />
        <QuoteSection />
      </main>
      <Footer />
      <FaiirModal isOpen={isFaiirOpen} onClose={handleFaiirClose} />
      <ConciergeButton />
    </>
  );
}
