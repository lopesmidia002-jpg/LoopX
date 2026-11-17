"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Play, 
  Sparkles, 
  Clock, 
  Layers, 
  PlusCircle, 
  ChevronRight, 
  CreditCard,
  X,
  Check,
  Zap
} from "lucide-react";

interface StudioHeaderProps {
  availableMinutes: number;
  maxMinutes: number;
  concurrentRenders: number;
  maxConcurrentRenders: number;
  onNewProject: () => void;
  onMinutesRecharged?: (newMinutes: number) => void;
}

export default function StudioHeader({
  availableMinutes = 184.5,
  maxMinutes = 195.0,
  concurrentRenders = 0,
  maxConcurrentRenders = 1,
  onNewProject,
  onMinutesRecharged,
}: StudioHeaderProps) {
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const percentage = Math.round((availableMinutes / maxMinutes) * 100);

  const handleRecharge = async (minutes: number, amount: number) => {
    try {
      setRechargeLoading(true);
      const res = await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, amountBRL: amount }),
      });
      const data = await res.json();
      if (data.success && data.availableMinutes) {
        setRechargeSuccess(true);
        if (onMinutesRecharged) onMinutesRecharged(data.availableMinutes);
        setTimeout(() => {
          setRechargeSuccess(false);
          setIsRechargeModalOpen(false);
        }, 1500);
      }
    } catch (e) {
      console.error("Erro ao recarregar:", e);
    } finally {
      setRechargeLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#141923]/95 backdrop-blur-xl border-b border-surface-border px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-background rounded-md flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-brand-300 fill-brand-300 ml-0.5" />
              </div>
            </div>
            <span className="text-base font-bold text-white hidden sm:inline">
              Loop<span className="text-brand-400">X</span>
            </span>
          </Link>

          <ChevronRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 bg-brand-500/15 border border-brand-500/30 px-2.5 py-0.5 rounded-full">
              Estúdio de Criação
            </span>
            <span className="hidden md:inline text-xs text-slate-400">
              // Motor Autônomo v2.4
            </span>
          </div>
        </div>

        {/* Right: Credits, Concurrency & Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Minutes Balance Indicator */}
          <div 
            onClick={() => setIsRechargeModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border cursor-pointer hover:border-brand-500/40 transition-colors"
            title="Clique para recarregar minutos"
          >
            <Clock className="w-4 h-4 text-brand-400 shrink-0" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white font-mono">
                  {availableMinutes.toFixed(1)} min
                </span>
                <span className="text-[10px] text-brand-300 underline">+ Recarregar</span>
              </div>
              <div className="w-20 sm:w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Concurrent Render Slots Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-white font-semibold text-[11px]">
                {concurrentRenders}/{maxConcurrentRenders} Render Ativa
              </span>
              <span className="text-[10px] text-slate-400">Fila Normal</span>
            </div>
          </div>

          {/* New Project Button */}
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:opacity-90 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Projeto</span>
          </button>
        </div>

      </div>

      {/* Recharge Minutes Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1a202c] border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Recarga de Minutos de Vídeo</span>
              </h4>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-6">
              Adicione minutos extras à sua conta instantaneamente. Os minutos avulsos não expiram.
            </p>

            {rechargeSuccess ? (
              <div className="p-6 text-center rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Minutos Recarregados com Sucesso!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => handleRecharge(30, 72)}
                  className="p-4 rounded-xl bg-surface border border-surface-border hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">+30 Minutos de Vídeo</span>
                    <span className="text-[10px] text-slate-400">R$ 2,40 por minuto extra</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-brand-300">R$ 72,00</span>
                </div>

                <div
                  onClick={() => handleRecharge(60, 144)}
                  className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/40 hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">+60 Minutos de Vídeo (Mais Popular)</span>
                    <span className="text-[10px] text-emerald-400">Equivalente a ~6 vídeos completos</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-white">R$ 144,00</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
