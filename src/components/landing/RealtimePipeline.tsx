"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  FileText, 
  Film, 
  Mic, 
  Type, 
  Camera, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Play
} from "lucide-react";
import { PIPELINE_STAGES, INITIAL_DEMO_SCENES } from "@/lib/constants";
import Link from "next/link";

const ICON_MAP: Record<string, React.ElementType> = {
  Search,
  FileText,
  Film,
  Mic,
  Type,
  Camera,
  Volume2,
  Sparkles,
};

export default function RealtimePipeline() {
  const [activeStage, setActiveStage] = useState(6);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto rotate stage every 4 seconds unless user interacts
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev >= 8 ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const currentStageInfo = PIPELINE_STAGES.find((s) => s.stage === activeStage) || PIPELINE_STAGES[0];
  const CurrentIcon = ICON_MAP[currentStageInfo.iconName] || Sparkles;

  return (
    <section id="pipeline" className="py-24 relative bg-[#131822] border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Tecnologia Exclusiva
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pipeline Visual em Tempo Real (8 Etapas)
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Veja exatamente o que acontece nos bastidores. Cada cena é construída de forma sequencial com total controle e transparência.
          </p>
        </div>

        {/* Interactive Pipeline Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: 8 Stages Clickable List */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Etapas do Processamento
              </span>
              <span className="text-xs text-brand-300 font-mono">
                {activeStage} de 8 concluindo ({Math.round((activeStage / 8) * 100)}%)
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface-border overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent transition-all duration-700 ease-out"
                style={{ width: `${(activeStage / 8) * 100}%` }}
              />
            </div>

            {PIPELINE_STAGES.map((s) => {
              const Icon = ICON_MAP[s.iconName] || Sparkles;
              const isSelected = activeStage === s.stage;
              const isFinished = activeStage > s.stage;

              return (
                <button
                  key={s.stage}
                  onClick={() => {
                    setActiveStage(s.stage);
                    setAutoRotate(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-brand-500/15 border-brand-500/60 shadow-lg shadow-brand-500/10"
                      : isFinished
                      ? "bg-surface/40 border-emerald-500/20 hover:bg-surface/70"
                      : "bg-surface/20 border-surface-border/40 hover:bg-surface/50 opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/40"
                          : isFinished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-surface text-slate-400 group-hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">0{s.stage}</span>
                        <h4 className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                          {s.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                        {s.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFinished && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {isSelected && (
                      <span className="text-[11px] font-semibold text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded border border-brand-500/40 animate-pulse">
                        Em execução
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Stage Visualizer & Scene Grid */}
          <div className="lg:col-span-6">
            <div className="glass-surface rounded-2xl p-6 border border-surface-border shadow-2xl relative overflow-hidden">
              
              {/* Active Stage Highlight Card */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                    <CurrentIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-mono text-brand-300 font-bold">
                      Etapa 0{currentStageInfo.stage} de 08
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {currentStageInfo.name}
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400 bg-[#161b24] px-2.5 py-1 rounded border border-surface-border">
                  ~{currentStageInfo.estimatedSeconds}s est.
                </span>
              </div>

              <p className="py-4 text-sm text-slate-300 leading-relaxed">
                {currentStageInfo.detailedDesc}
              </p>

              {/* Dynamic Scenes Grid Gaining Life */}
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
                  <span>Grade de Cenas em Construção</span>
                  <span className="text-emerald-400 font-mono">4 Cenas Prontas</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {INITIAL_DEMO_SCENES.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="group relative rounded-xl overflow-hidden border border-surface-border bg-black aspect-video shadow-md"
                    >
                      <img
                        src={scene.mediaUrl}
                        alt={`Cena ${scene.sceneOrder}`}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          activeStage >= 6 ? "ken-burns-active" : "group-hover:scale-105"
                        }`}
                      />

                      {/* Scene Order Badge */}
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-white/10">
                        Cena 0{scene.sceneOrder}
                      </div>

                      {/* Subtitle / Motion Badge */}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white truncate border border-white/10">
                        {activeStage >= 5 ? (
                          <span className="text-brand-300 font-semibold">Legenda & Ken Burns Ativo</span>
                        ) : (
                          <span>{scene.keywords.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Resolução de saída: <strong>1080p Full HD (16:9)</strong>
                </span>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-300 hover:text-white transition-colors"
                >
                  <span>Testar no Estúdio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
