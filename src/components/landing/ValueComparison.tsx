"use client";

import React from "react";
import { Check, X, Clock, DollarSign, Sparkles } from "lucide-react";

export default function ValueComparison() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Comparativo de Eficiência
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Editor Tradicional vs. LoopX
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Veja a diferença brutal de custos, tempo e previsibilidade para manter um canal dark lucrativo com frequência diária de publicações.
          </p>
        </div>

        {/* Comparison Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Traditional Editor Card (Red/Subdued) */}
          <div className="bg-[#171d27]/70 rounded-2xl p-8 border border-red-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
                    O Jeito Antigo
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Equipe / Freelancers
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                  <X className="w-6 h-6" />
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-red-400 font-mono">
                  R$ 3.500 a R$ 6.000
                </span>
                <span className="text-slate-400 text-sm ml-2">/mês por canal</span>
                <p className="text-xs text-slate-400 mt-1">Roteirista + Locutor + Editor de Vídeo</p>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Prazo lento:</strong> 3 a 5 dias para entregar um único vídeo longo de 10 minutos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Refações desgastantes:</strong> Espera de dias para corrigir erros de roteiro ou áudio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Imprevisibilidade:</strong> Freelancers somem ou atrasam, quebrando o algoritmo do canal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Custo proibitivo para escala:</strong> Criar 3 canais dark triplica seus custos fixos.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-surface-border/50 text-xs text-red-300/80">
              Gargalo na produção e alto risco de queima de caixa.
            </div>
          </div>

          {/* VeloVide Card (Highlighted) */}
          <div className="relative rounded-2xl p-8 bg-gradient-to-b from-brand-950/70 via-surface to-surface border-2 border-brand-500/50 shadow-2xl shadow-brand-500/20 flex flex-col justify-between">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-brand-600 to-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              Mais Rápido & Escalável
            </div>

            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-brand-300 font-bold">
                    A Nova Era da Automação
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    LoopX SaaS
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-300" />
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-white font-mono">
                  A partir de R$ 197
                </span>
                <span className="text-slate-400 text-sm ml-2">/mês</span>
                <p className="text-xs text-brand-300 mt-1">Equivalente a menos de R$ 6,50 por vídeo completo</p>
              </div>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Velocidade insana:</strong> Vídeo de 10 a 15 minutos gerado em menos de 10 minutos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Edição visual instantânea:</strong> Troque imagens e mídias no Storyboard em segundos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Qualidade constante:</strong> Roteiros com gancho psicológico e narração de suspense sem falhas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Escala ilimitada:</strong> Publique em 1 clique direto no YouTube com capítulos e SEO.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-brand-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Economia média de 92% e aumento de 10x na velocidade de publicação.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
