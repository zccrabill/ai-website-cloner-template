import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LiabilityCheckupSection from "@/components/LiabilityCheckupSection";
import FeaturedInSection from "@/components/FeaturedInSection";
import SolutionsSection from "@/components/SolutionsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FaiirSection from "@/components/FaiirSection";
import PricingSection from "@/components/PricingSection";
import PracticeSnapshotSection from "@/components/PracticeSnapshotSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AvaFloatingWidget from "@/components/AvaFloatingWidget";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema, HOMEPAGE_FAQS } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={faqPageSchema(HOMEPAGE_FAQS)} />
      <Header />
      <main>
        <HeroSection />

        <Reveal><LiabilityCheckupSection /></Reveal>

        <div id="featured">
          <Reveal><FeaturedInSection /></Reveal>
        </div>

        {/* Solutions cascades its own header + cards (staggered reveals),
            so it is intentionally NOT wrapped in a block-level <Reveal>. */}
        <div id="solutions">
          <SolutionsSection />
        </div>

        <div id="how">
          <Reveal><HowItWorksSection /></Reveal>
        </div>

        <Reveal><FaiirSection /></Reveal>

        <div id="pricing">
          <Reveal><PricingSection /></Reveal>
        </div>

        <PracticeSnapshotSection />

        <Reveal><TestimonialsSection /></Reveal>

        <Reveal><CTASection /></Reveal>
      </main>
      <Footer />
      <AvaFloatingWidget />
    </>
  );
}
