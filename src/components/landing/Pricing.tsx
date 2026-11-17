"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";
import { formatCurrencyBRL } from "@/lib/utils";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="precos" className="py-24 relative bg-[#131822] border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Planos & Créditos
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Escolha o plano ideal para a escala do seu canal
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Controle transparente baseado em minutos de vídeo renderizados e concorrência na fila de GPU.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-surface border border-surface-border">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !isAnnual
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cobrança Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Cobrança Anual</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                10% OFF
              </span>
            </button>
          </div>
        </div>

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-brand-950/80 via-surface to-surface border-2 border-brand-500 shadow-2xl shadow-brand-500/20 scale-100 lg:-translate-y-2"
                    : "glass-surface border border-surface-border hover:border-surface-hover"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-accent text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Mais Escolhido
                  </div>
                )}

                <div>
                  {/* Plan Name & Target */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {plan.priorityQueue && (
                      <span className="text-[10px] font-mono text-brand-300 bg-brand-500/10 border border-brand-500/25 px-2 py-0.5 rounded">
                        Fila VIP
                      </span>
                    )}
                  </div>

                  {/* Price Block */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-slate-400">R$</span>
                      <span className="text-4xl font-extrabold text-white font-mono">
                        {Math.floor(price)}
                      </span>
                      <span className="text-xs text-slate-400">
                        ,{((price % 1) * 100).toFixed(0).padStart(2, "0")}/mês
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                        Faturado anualmente com 10% de desconto
                      </p>
                    )}
                  </div>

                  {/* Minutes & Concurrency Highlights */}
                  <div className="p-3.5 rounded-xl bg-[#141923] border border-surface-border mb-6 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Minutos inclusos:</span>
                      <span className="font-bold text-brand-300 font-mono">
                        {plan.minutesPerMonth} min/mês
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Render simultânea:</span>
                      <span className="font-bold text-white font-mono">
                        {plan.concurrentRenders} por vez
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-surface-border/60">
                      <span>Minuto extra:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {formatCurrencyBRL(plan.extraMinuteRate)}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan CTA Button */}
                <Link
                  href="/studio"
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white shadow-lg shadow-brand-500/30 hover:opacity-95"
                      : "bg-surface hover:bg-surface-hover text-slate-200 border border-surface-border hover:border-brand-500/30"
                  }`}
                >
                  <span>Começar no {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Extra Minutes Packages Banner */}
        <div className="mt-14 max-w-4xl mx-auto glass-surface rounded-2xl p-6 sm:p-8 border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-surface to-brand-950/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Precisa de Minutos Avulsos?</span>
            </div>
            <h4 className="text-xl font-bold text-white">
              Recarregue seu saldo a qualquer momento sem trocar de plano
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Os minutos avulsos nunca expiram enquanto sua assinatura estiver ativa.
            </p>
          </div>

          <Link
            href="/studio"
            className="shrink-0 px-6 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-bold text-white transition-all hover:border-brand-400"
          >
            Adicionar Minutos Avulsos
          </Link>
        </div>

      </div>
    </section>
  );
}
