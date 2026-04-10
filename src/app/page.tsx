import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedInSection from "@/components/FeaturedInSection";
import SolutionsSection from "@/components/SolutionsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AlloraFloatingWidget from "@/components/AlloraFloatingWidget";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />

        <div id="featured">
          <FeaturedInSection />
        </div>

        <div id="solutions">
          <SolutionsSection />
        </div>

        <div id="how">
          <HowItWorksSection />
        </div>

        <div id="pricing">
          <PricingSection />
        </div>

        <TestimonialsSection />

        <CTASection />
      </main>
      <Footer />
      <AlloraFloatingWidget />
    </>
  );
}
