"use client";

import React from "react";
import Link from "next/link";
import { Play, Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 pt-16 pb-12 overflow-hidden">
      
      {/* Pre-footer Big CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-brand-900/60 via-[#1d232e] to-brand-950/60 border border-brand-500/30 overflow-hidden shadow-2xl text-center">
          <div className="aurora-glow !top-[-100px]" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-300 bg-brand-500/20 px-3 py-1 rounded-full border border-brand-500/30">
              Comece Hoje
            </span>
            <h3 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Crie seu primeiro vídeo cinematográfico agora mesmo
            </h3>
            <p className="mt-3 text-slate-300 text-sm sm:text-base">
              Junte-se a milhares de canais dark escalando receita em dólar e retenção no YouTube com o pipeline autônomo do LoopX.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/studio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:opacity-95 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Acessar Painel ADM</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-surface-border">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-background rounded-md flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-brand-300 fill-brand-300 ml-0.5" />
                </div>
              </div>
              <span className="text-lg font-bold text-white">
                Loop<span className="text-brand-400">X</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              A infraestrutura definitiva para automação e escala de canais dark documentais e listas Top 10 para o YouTube.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistemas & GPUs 100% Operacionais</span>
            </div>
          </div>

          {/* Col 2: Produto */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Produto
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/studio" className="hover:text-brand-300 transition-colors">
                  Estúdio de Criação
                </Link>
              </li>
              <li>
                <Link href="#pipeline" className="hover:text-brand-300 transition-colors">
                  Pipeline 8 Etapas
                </Link>
              </li>
              <li>
                <Link href="#recursos" className="hover:text-brand-300 transition-colors">
                  Efeito Parallax 2.5D
                </Link>
              </li>
              <li>
                <Link href="#precos" className="hover:text-brand-300 transition-colors">
                  Planos e Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categorias */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Formatos de Vídeo
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Documentários Históricos</li>
              <li>Top 10 / Rankings de Curiosidades</li>
              <li>Mistérios & Crimes Reais</li>
              <li>Ciência & Astronomia 4K</li>
              <li>Geopolítica & Conflitos Militares</li>
            </ul>
          </div>

          {/* Col 4: Suporte & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Comunidade & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://chat.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Grupo VIP no WhatsApp
                </a>
              </li>
              <li>Termos de Uso do Serviço</li>
              <li>Política de Privacidade & Cookies</li>
              <li>Diretrizes de Conteúdo do YouTube</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 LoopX Inc. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Desenvolvido com tecnologia de ponta para criadores</span>
            <ShieldCheck className="w-4 h-4 text-brand-400" />
          </div>
        </div>

      </div>
    </footer>
  );
}
