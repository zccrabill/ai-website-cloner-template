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
import AlloraFloatingWidget from "@/components/AlloraFloatingWidget";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema, HOMEPAGE_FAQS } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={faqPageSchema(HOMEPAGE_FAQS)} />
      <Header />
      <main>
        <HeroSection />

        <LiabilityCheckupSection />

        <div id="featured">
          <FeaturedInSection />
        </div>

        <div id="solutions">
          <SolutionsSection />
        </div>

        <div id="how">
          <HowItWorksSection />
        </div>

        <FaiirSection />

        <div id="pricing">
          <PricingSection />
        </div>

        <PracticeSnapshotSection />

        <TestimonialsSection />

        <CTASection />
      </main>
      <Footer />
      <AlloraFloatingWidget />
    </>
  );
}
