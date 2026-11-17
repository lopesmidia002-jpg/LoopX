import React from "react";
import TopBanner from "@/components/landing/TopBanner";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import HowItWorks from "@/components/landing/HowItWorks";
import RealtimePipeline from "@/components/landing/RealtimePipeline";
import BentoGrid from "@/components/landing/BentoGrid";
import Showcase from "@/components/landing/Showcase";
import ValueComparison from "@/components/landing/ValueComparison";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-slate-100">
      {/* 1. Fixed Scarcity Top Banner */}
      <TopBanner />

      {/* 2. Cinematic Navbar */}
      <Navbar />

      {/* 3. Hero Section with Mockup & Audio Waveform */}
      <Hero />

      {/* 4. Infinite Marquee with Diamond Separators */}
      <Marquee />

      {/* 5. How It Works (3 Numbered Cards) */}
      <HowItWorks />

      {/* 6. Realtime Pipeline (8 Stages Animated) */}
      <RealtimePipeline />

      {/* 7. Asymmetric Bento Grid Features */}
      <BentoGrid />

      {/* 8. Showcase: 3x2 16:9 Thumbnails with Ken Burns */}
      <Showcase />

      {/* 9. Traditional Editor vs VeloVide Value Comparison */}
      <ValueComparison />

      {/* 10. Pricing Table (4 Plans + Monthly/Annual Toggle) */}
      <Pricing />

      {/* 11. FAQ Interactive Accordion */}
      <FAQ />

      {/* 12. Final CTA & Footer */}
      <Footer />
    </main>
  );
}
