"use client";

import React, { useState } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TopBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside aria-label="Aviso de escassez" className="bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 border-b border-brand-500/20 py-2.5 px-4 text-xs sm:text-sm text-slate-200 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 mx-auto font-medium">
          {/* Pulsing indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          
          <span className="text-red-400 font-semibold tracking-wide uppercase text-[11px] sm:text-xs">
            Vagas Limitadas:
          </span>
          
          <span className="hidden sm:inline text-slate-200">
            Apenas 43 acessos restantes para a fila de renderização prioritária deste mês.
          </span>
          <span className="sm:hidden text-slate-200">
            Quando acabarem, o cadastro fecha.
          </span>

          <Link
            href="/studio"
            className="inline-flex items-center gap-1 text-brand-300 hover:text-white underline font-semibold ml-1.5 transition-colors"
          >
            Garantir Vaga <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          aria-label="Fechar banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
