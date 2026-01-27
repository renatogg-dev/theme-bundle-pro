import { HeroSection } from "@/components/sections/hero-section";
import { ThemesSection } from "@/components/sections/themes-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ThemesSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
