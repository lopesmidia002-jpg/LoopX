"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight, Instagram, Twitter, Sparkles, ShieldCheck } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

export default function LiquidHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeAnimRef = useRef<number | null>(null);
  const isFadingOutRef = useRef<boolean>(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  const handleOpenAuth = (mode: "LOGIN" | "REGISTER") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

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

      {/* Navbar (relative z-20, px-6 py-6) */}
      <nav className="relative z-20 px-6 py-6 w-full">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left Brand + Nav Links in Portuguese */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Globe className="w-6 h-6 text-purple-400" />
              <span className="font-semibold text-lg tracking-tight font-sans">
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-white/80 text-sm font-medium hover:text-white transition-colors px-2 py-1"
            >
              Portal
            </Link>
            <button
              type="button"
              onClick={() => handleOpenAuth("LOGIN")}
              className="liquid-glass rounded-full px-5 py-2 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-bold hover:bg-amber-500/10 transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso ADM</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero content (relative z-10, flex-1 flex flex-col items-center justify-center, px-6 py-12 text-center, -translate-y-[20%]) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-5xl mx-auto md:-translate-y-[10%]">
        {/* Main Heading translated and aligned with LoopX */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tight font-serif select-none">
          Crie vídeos dark que <em className="italic font-serif text-purple-200">viralizam</em>.
        </h1>

        {/* Email Input Form in Portuguese */}
        <div className="w-full max-w-xl mt-8 sm:mt-10">
          <form
            onSubmit={handleSubscribe}
            className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 w-full shadow-2xl"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail para acesso antecipado"
              required
              className="bg-transparent flex-1 text-white placeholder:text-white/40 text-sm sm:text-base outline-none border-none focus:ring-0"
            />
            <button
              type="submit"
              className="bg-white rounded-full p-3 text-black hover:scale-105 active:scale-95 transition-transform flex-shrink-0 cursor-pointer shadow-md"
              title="Inscrever-se"
            >
              <ArrowRight className="w-5 h-5 text-black" />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-emerald-400 mt-2 font-medium tracking-wide animate-fade-in">
              Obrigado! Você agora tem acesso antecipado às novidades do LoopX.
            </p>
          )}
        </div>

        {/* Subtitle in Portuguese */}
        <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-xl mt-6 px-4">
          Pesquisa de fatos, roteiro hipnótico, narração hiper-realista e edição cinematográfica em um pipeline 100% autônomo com IA.
        </p>

        {/* Action button */}
        <div className="mt-8 flex items-center gap-4">
          <a
            href="#services"
            className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors inline-block"
          >
            Conhecer o Pipeline
          </a>
          <button
            type="button"
            onClick={() => handleOpenAuth("LOGIN")}
            className="rounded-full px-8 py-3 bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            Acessar Estúdio
          </button>
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

      {/* Login & Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
