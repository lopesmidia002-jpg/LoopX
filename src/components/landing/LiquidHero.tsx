"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight, Instagram, Twitter, Sparkles, ShieldCheck, Users } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

export default function LiquidHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeAnimRef = useRef<number | null>(null);
  const isFadingOutRef = useRef<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"ADMIN" | "USER">("ADMIN");

  const animateOpacity = (target: number, duration: number, onComplete?: () => void) => {
    if (!videoRef.current) return;
    if (fadeAnimRef.current) cancelAnimationFrame(fadeAnimRef.current);

    const startOpacity = parseFloat(videoRef.current.style.opacity || "0");
    const startTime = performance.now();

    const step = (now: number) => {
      if (!videoRef.current) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = startOpacity + (target - startOpacity) * progress;
      videoRef.current.style.opacity = current.toString();

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(step);
      } else {
        fadeAnimRef.current = null;
        if (onComplete) onComplete();
      }
    };

    fadeAnimRef.current = requestAnimationFrame(step);
  };

  const handleCanPlay = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => {});
    animateOpacity(1, 500);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isFadingOutRef.current) return;
    const remaining = videoRef.current.duration - videoRef.current.currentTime;
    if (remaining <= 0.55 && videoRef.current.duration > 0) {
      isFadingOutRef.current = true;
      animateOpacity(0, 500);
    }
  };

  const handleEnded = () => {
    if (!videoRef.current) return;
    videoRef.current.style.opacity = "0";
    setTimeout(() => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      isFadingOutRef.current = false;
      animateOpacity(1, 500);
    }, 100);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 3) {
      video.play().catch(() => {});
      animateOpacity(1, 500);
    }

    return () => {
      if (fadeAnimRef.current) cancelAnimationFrame(fadeAnimRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col bg-black">
      {/* Background Video with Vanilla JS Fade */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
        muted
        autoPlay
        playsInline
        preload="auto"
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ opacity: 0 }}
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
      />

      {/* Subtle Black Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* Navbar (relative z-20, px-3 sm:px-6 py-3 sm:py-6) */}
      <nav className="relative z-20 px-3 sm:px-6 py-3 sm:py-6 w-full pt-safe">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Left Brand + Nav Links in Portuguese */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-white min-h-[44px]">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span className="font-semibold text-base sm:text-lg tracking-tight font-sans">
                Loop<span className="text-purple-400">X</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 ml-8">
              <a href="#about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Sobre
              </a>
              <a href="#services" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Recursos
              </a>
              <a href="#philosophy" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Visão
              </a>
              <a href="#pricing" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                Planos
              </a>
              <Link href="/studio" className="text-purple-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Estúdio</span>
              </Link>
            </div>
          </div>

          {/* Right Actions: Acesso ADM e Acesso a Usuários */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthTab("USER");
                setIsAuthModalOpen(true);
              }}
              className="text-white/80 hover:text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors min-h-[44px] flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Acesso Usuário</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("ADMIN");
                setIsAuthModalOpen(true);
              }}
              className="liquid-glass rounded-full px-3.5 sm:px-5 py-2 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold hover:bg-amber-500/15 transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-1.5 min-h-[44px] active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Acesso ADM</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 text-center max-w-5xl mx-auto md:-translate-y-[6%]">
        {/* Admin Exclusive Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass text-xs font-semibold text-amber-300 border border-amber-500/30 mb-5 sm:mb-6 shadow-lg shadow-amber-500/10">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Portal do ADM & Acesso de Usuários • LoopX Studio</span>
        </div>

        {/* Main Heading translated and aligned with LoopX */}
        <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tight font-serif select-none leading-[1.1]">
          Crie vídeos dark que <em className="italic font-serif text-purple-200">viralizam</em>.
        </h1>

        {/* Subtitle in Portuguese */}
        <p className="text-white/90 text-xs sm:text-base leading-relaxed max-w-xl mt-5 sm:mt-6 px-2 sm:px-4 font-light">
          Pesquisa de fatos, roteiro hipnótico, narração hiper-realista e edição cinematográfica em um pipeline 100% autônomo com IA.
        </p>

        {/* Admin & User Access CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <button
            type="button"
            onClick={() => {
              setAuthTab("ADMIN");
              setIsAuthModalOpen(true);
            }}
            className="rounded-full px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-black text-sm sm:text-base font-extrabold hover:opacity-95 transition-all shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-black" />
            <span>Acessar Painel ADM</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab("USER");
              setIsAuthModalOpen(true);
            }}
            className="liquid-glass rounded-full px-6 py-3.5 text-purple-300 hover:text-white border border-purple-500/30 text-xs sm:text-sm font-bold hover:bg-purple-500/10 transition-colors w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Acesso a Usuários</span>
          </button>
          <a
            href="#services"
            className="text-white/60 hover:text-white text-xs sm:text-sm font-medium transition-colors text-center px-4 py-2 min-h-[44px] flex items-center justify-center"
          >
            Conhecer o Pipeline
          </a>
        </div>
      </div>

      {/* Social icons footer (relative z-10, flex justify-center gap-4 pb-12) */}
      <div className="relative z-10 flex justify-center gap-4 pb-12">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram LoopX"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all hover:scale-105"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter X LoopX"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all hover:scale-105"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href="#about"
          aria-label="Comunidade Global LoopX"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all hover:scale-105"
        >
          <Globe className="w-5 h-5" />
        </a>
      </div>

      {/* Modal de Autenticação: Portal do ADM & Acesso a Usuários */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}
