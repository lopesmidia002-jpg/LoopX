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
  AlertCircle,
  Clock,
  Layers,
  Check
} from "lucide-react";
import { PIPELINE_STAGES, INITIAL_DEMO_SCENES } from "@/lib/constants";
import { SceneItem } from "@/lib/types";

interface PipelineStatusProps {
  currentStage: number;
  progressPercentage: number;
  onComplete: () => void;
  topicTitle: string;
  scenes?: SceneItem[];
}

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

export default function PipelineStatus({
  currentStage,
  progressPercentage,
  onComplete,
  topicTitle,
  scenes,
}: PipelineStatusProps) {
  const [logs, setLogs] = useState<string[]>([
    "Inicializando cluster de processamento GPU...",
    "Conectando aos repositórios de apuração histórica...",
  ]);

  useEffect(() => {
    const stageInfo = PIPELINE_STAGES.find((s) => s.stage === currentStage);
    if (stageInfo) {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ${stageInfo.name}: ${stageInfo.detailedDesc}`,
        ...prev.slice(0, 7),
      ]);
    }
  }, [currentStage]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-surface rounded-2xl p-6 border border-brand-500/30 mb-8 bg-gradient-to-r from-brand-950/40 via-surface to-brand-950/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-brand-300 font-bold">
                Pipeline Autônomo em Execução • Etapa {currentStage} de 8
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1">
              {topicTitle || "Documentário Cinematográfico em Produção"}
            </h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-brand-300 font-mono">
                {progressPercentage}%
              </span>
              <p className="text-[10px] text-slate-400">Progresso Geral</p>
            </div>
            {progressPercentage >= 100 && (
              <button
                onClick={onComplete}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
              >
                Abrir Storyboard
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-surface-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent transition-all duration-500 ease-out shadow-lg shadow-brand-500/50"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Grid: 8 Stages Status on Left + Live Scene Building Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 8 Stages Detailed Status */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Status das Etapas em Tempo Real
          </h3>

          <div className="space-y-2">
            {PIPELINE_STAGES.map((s) => {
              const Icon = ICON_MAP[s.iconName] || Sparkles;
              const isFinished = currentStage > s.stage || progressPercentage >= 100;
              const isCurrent = currentStage === s.stage && progressPercentage < 100;
              const isPending = currentStage < s.stage && progressPercentage < 100;

              return (
                <div
                  key={s.stage}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? "bg-brand-500/20 border-brand-500/60 shadow-lg shadow-brand-500/20"
                      : isFinished
                      ? "bg-surface/50 border-emerald-500/20"
                      : "bg-[#141923]/40 border-surface-border/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        isCurrent
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/40"
                          : isFinished
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-surface text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">0{s.stage}</span>
                        <h4 className={`text-xs font-bold ${isCurrent ? "text-white" : "text-slate-200"}`}>
                          {s.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{s.shortDesc}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isFinished && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isCurrent && (
                      <span className="text-[10px] font-bold font-mono text-brand-300 bg-brand-500/30 px-2 py-0.5 rounded border border-brand-500/40 animate-pulse">
                        Processando
                      </span>
                    )}
                    {isPending && <span className="text-[10px] font-mono text-slate-400">Aguardando</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Building Canvas & Console Logs */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Live Scenes Coming to Life */}
          <div className="glass-surface rounded-2xl p-5 border border-surface-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Film className="w-4 h-4 text-brand-400" />
                <span>Prévia de Cenas Montadas ao Vivo</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {currentStage >= 3 ? "4 Cenas Processadas" : "Pesquisando Acervo..."}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(scenes && scenes.length > 0 ? scenes.slice(0, 4) : INITIAL_DEMO_SCENES).map((scene, idx) => {
                const isSceneVisible = currentStage >= 3;
                return (
                  <div
                    key={scene.id}
                    className="relative aspect-video rounded-xl overflow-hidden border border-surface-border bg-black group"
                  >
                    {isSceneVisible ? (
                      <>
                        <img
                          src={scene.mediaUrl}
                          alt="Cena gerada"
                          className={`w-full h-full object-cover ${currentStage >= 6 ? "ken-burns-active" : ""}`}
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white border border-white/10">
                          Cena 0{scene.sceneOrder}
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/80 px-2 py-0.5 rounded text-[9px] text-white truncate border border-white/10">
                          {currentStage >= 5 ? "Legenda & Áudio Sincronizados" : scene.keywords.join(", ")}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <Sparkles className="w-4 h-4 text-brand-500/50 animate-pulse mb-1" />
                        <span className="text-[10px] font-mono">Gerando cena 0{scene.sceneOrder}...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Console Activity Logs */}
          <div className="rounded-2xl p-4 bg-[#10141c] border border-surface-border">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Terminal de Operações da GPU:
            </span>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              {logs.map((log, index) => (
                <p key={index} className="truncate text-slate-300">
                  <span className="text-brand-400 mr-1.5">›</span>
                  {log}
                </p>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
