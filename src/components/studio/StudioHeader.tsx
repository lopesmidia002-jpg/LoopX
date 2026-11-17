"use client";

import React from "react";
import Link from "next/link";
import { 
  Play, 
  Sparkles, 
  Clock, 
  Layers, 
  PlusCircle, 
  ChevronRight, 
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface StudioHeaderProps {
  availableMinutes: number;
  maxMinutes: number;
  concurrentRenders: number;
  maxConcurrentRenders: number;
  onNewProject: () => void;
}

export default function StudioHeader({
  availableMinutes = 184.5,
  maxMinutes = 195.0,
  concurrentRenders = 0,
  maxConcurrentRenders = 1,
  onNewProject,
}: StudioHeaderProps) {
  const percentage = Math.round((availableMinutes / maxMinutes) * 100);

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
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border">
            <Clock className="w-4 h-4 text-brand-400 shrink-0" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white font-mono">
                  {availableMinutes.toFixed(1)} min
                </span>
                <span className="text-[10px] text-slate-400">restantes</span>
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
    </header>
  );
}
