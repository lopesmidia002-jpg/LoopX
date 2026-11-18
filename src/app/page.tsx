import React from "react";
import LiquidHero from "@/components/landing/LiquidHero";
import AboutSection from "@/components/landing/AboutSection";
import FeaturedVideoSection from "@/components/landing/FeaturedVideoSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import ServicesSection from "@/components/landing/ServicesSection";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-black text-white selection:bg-white/20 selection:text-white">
      {/* SECTION 1 -- HERO (Liquid Glass & Cinematic Fade Loop Video) */}
      <LiquidHero />

      {/* SECTION 2 -- ABOUT SECTION */}
      <AboutSection />

      {/* SECTION 3 -- FEATURED VIDEO */}
      <FeaturedVideoSection />

      {/* SECTION 4 -- PHILOSOPHY / INNOVATION x VISION */}
      <PhilosophySection />

      {/* SECTION 5 -- SERVICES / WHAT WE DO */}
      <ServicesSection />

      {/* SECTION 6 -- PRICING PLANS & PIX / STRIPE CHECKOUT */}
      <Pricing />

      {/* FOOTER & CALL TO ACTION */}
      <Footer />
    </main>
  );
}
