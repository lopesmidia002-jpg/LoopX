"use client";

import React from "react";
import { Sparkles, BrainCircuit, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Descreva a ideia ou tema",
    description: "Digite qualquer assunto de mistério, história, ciência ou 'Top 10'. Se preferir, cole seu próprio roteiro bruto ou apenas um link de pesquisa.",
    icon: Sparkles,
    badge: "Input Simples",
    example: "Ex: 'O mistério das construções inexplicáveis do Antigo Egito'",
  },
  {
    number: "02",
    title: "A IA cria tudo de ponta a ponta",
    description: "O pipeline autônomo pesquisa fatos, redige o arco dramático, grava a narração neural com suspense, busca vídeos 4K e aplica efeitos Ken Burns e Parallax.",
    icon: BrainCircuit,
    badge: "8 Etapas Autônomas",
    example: "Pesquisa + Roteiro + Mídia + Voz + Legendas + SFX",
  },
  {
    number: "03",
    title: "Revise o Storyboard e publique",
    description: "Alterne qualquer mídia com 1 clique se desejar. Em seguida, baixe o MP4 em 1080p ou publique direto no seu canal com títulos e capítulos prontos.",
    icon: Rocket,
    badge: "1-Clique no YouTube",
    example: "Exportação em MP4 60fps com capítulos automáticos",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Fluxo Sem Complicações
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Como criar seu canal dark em 3 passos
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Você não precisa de câmeras, microfones caros nem gastar dias aprendendo softwares complexos como Premiere ou After Effects.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="glass-surface glass-surface-hover rounded-2xl p-7 relative flex flex-col justify-between group"
              >
                <div>
                  {/* Step Header with Number and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-brand-400/30 group-hover:text-brand-400/60 transition-colors font-mono">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-300 group-hover:scale-110 group-hover:bg-brand-500/20 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="inline-block text-[11px] font-semibold text-brand-300 px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 mb-3">
                    {step.badge}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-surface-border/60">
                  <p className="text-xs font-mono text-slate-400 bg-[#161b24] p-2.5 rounded-lg border border-surface-border">
                    {step.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner under Steps */}
        <div className="mt-14 text-center">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white transition-colors"
          >
            <span>Experimente o fluxo ao vivo no Estúdio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
