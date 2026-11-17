"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Video, Play, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-[38px] z-40 w-full backdrop-blur-xl bg-background/80 border-b border-surface-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-lg shadow-brand-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <Play className="w-4 h-4 text-brand-300 fill-brand-300 ml-0.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-brand-300">
              Loop<span className="text-brand-400">X</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">
              Dark Channels AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link href="#como-funciona" className="hover:text-brand-300 transition-colors">
            Como Funciona
          </Link>
          <Link href="#pipeline" className="hover:text-brand-300 transition-colors flex items-center gap-1.5">
            Pipeline 8 Etapas
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Auto
            </span>
          </Link>
          <Link href="#recursos" className="hover:text-brand-300 transition-colors">
            Recursos
          </Link>
          <Link href="#mostruario" className="hover:text-brand-300 transition-colors">
            Exemplos
          </Link>
          <Link href="#precos" className="hover:text-brand-300 transition-colors">
            Preços
          </Link>
          <Link href="#faq" className="hover:text-brand-300 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/studio"
            className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:opacity-95 shadow-md shadow-brand-500/20 border border-brand-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-brand-200" />
            <span>Abrir Estúdio</span>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-surface-border px-4 py-6 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-300">
            <Link
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-300 transition-colors py-1"
            >
              Como Funciona
            </Link>
            <Link
              href="#pipeline"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-300 transition-colors py-1"
            >
              Pipeline 8 Etapas
            </Link>
            <Link
              href="#recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-300 transition-colors py-1"
            >
              Recursos
            </Link>
            <Link
              href="#mostruario"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-300 transition-colors py-1"
            >
              Exemplos
            </Link>
            <Link
              href="#precos"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-300 transition-colors py-1"
            >
              Preços
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-brand-300 transition-colors py-1"
            >
              FAQ
            </Link>
          </nav>
          <div className="pt-4 border-t border-surface-border flex flex-col gap-2.5">
            <Link
              href="/studio"
              className="w-full text-center text-sm font-semibold text-white py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-200" />
              Criar Vídeo no Estúdio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
