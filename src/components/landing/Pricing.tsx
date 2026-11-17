"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  ArrowRight,
  QrCode,
  CreditCard,
  X,
  Copy,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";
import { formatCurrencyBRL } from "@/lib/utils";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSession, setCheckoutSession] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleOpenCheckout = async (plan: any, packageMinutes?: number) => {
    setSelectedPlan(plan);
    setSelectedPackage(packageMinutes || null);
    setPaymentSuccess(false);
    setCheckoutSession(null);
    setCheckoutModalOpen(true);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan ? plan.id : undefined,
          packageMinutes: packageMinutes,
          billingCycle: isAnnual ? "ANNUAL" : "MONTHLY",
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCheckoutSession(data.session);
      }
    } catch (err) {
      console.error("Erro ao gerar checkout:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!checkoutSession) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/billing/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: checkoutSession.sessionId,
          planId: selectedPlan ? selectedPlan.id : undefined,
          packageMinutes: selectedPackage,
          billingCycle: isAnnual ? "ANNUAL" : "MONTHLY",
          amountPaidBRL: checkoutSession.amountBRL,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
      }
    } catch (err) {
      console.error("Erro ao confirmar pagamento:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    if (checkoutSession?.pixCopyPaste) {
      navigator.clipboard.writeText(checkoutSession.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
                <button
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent text-white shadow-lg shadow-brand-500/30 hover:opacity-95"
                      : "bg-surface hover:bg-surface-hover text-slate-200 border border-surface-border hover:border-brand-500/30"
                  }`}
                >
                  <span>Começar no {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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

          <button
            onClick={() => handleOpenCheckout(null, 60)}
            className="shrink-0 px-6 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-bold text-white transition-all hover:border-brand-400"
          >
            Adicionar +60 Minutos Avulsos
          </button>
        </div>

      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                    <QrCode className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedPlan ? `Assinar Plano ${selectedPlan.name}` : `Comprar Minutos (+${selectedPackage} min)`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Ciclo: {isAnnual ? "Anual com 10% de desconto" : "Mensal"}
                    </p>
                  </div>
                </div>

                {isProcessing && !checkoutSession ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                    <p className="text-xs text-slate-300">Gerando sessão segura de pagamento...</p>
                  </div>
                ) : checkoutSession ? (
                  <div className="mt-5 space-y-4">
                    <div className="p-4 rounded-xl bg-[#141923] border border-surface-border flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total a pagar:</span>
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">
                        {formatCurrencyBRL(checkoutSession.amountBRL)}
                      </span>
                    </div>

                    {/* QR Code and Pix Copy-Paste */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-surface-border">
                      {checkoutSession.pixQrCodeUrl && (
                        <img
                          src={checkoutSession.pixQrCodeUrl}
                          alt="QR Code Pix"
                          className="w-44 h-44 rounded-lg bg-white p-2 shadow-inner"
                        />
                      )}
                      <p className="mt-3 text-[11px] text-slate-400 text-center">
                        Abra o app do seu banco e escaneie o QR Code ou copie o código abaixo.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Código Pix Copia e Cola:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={checkoutSession.pixCopyPaste || ""}
                          className="w-full text-xs font-mono bg-[#141923] border border-surface-border rounded-lg px-3 py-2 text-slate-300 focus:outline-none select-all"
                        />
                        <button
                          onClick={handleCopyPix}
                          className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? "Copiado!" : "Copiar"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulate Payment for Dev / Demo */}
                    <div className="pt-2">
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isProcessing}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirmando pagamento via webhook...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Simular Confirmação Instantânea (Pix Webhook)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Pagamento Confirmado!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Sua assinatura e saldo de minutos foram atualizados instantaneamente no sistema.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link
                    href="/studio"
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                  >
                    Ir para o Estúdio de Criação
                  </Link>
                  <button
                    onClick={() => setCheckoutModalOpen(false)}
                    className="px-4 py-2.5 bg-surface hover:bg-surface-hover text-slate-300 text-xs font-medium rounded-xl border border-surface-border transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
