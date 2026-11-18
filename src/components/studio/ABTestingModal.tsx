"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Split,
  Trophy,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Eye,
  MousePointerClick,
  Clock,
  Plus,
  RefreshCw,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { ABExperiment, ABVariant } from "@/lib/youtube/ab-testing";

interface ABTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectTopic?: string;
  currentProjectTitle?: string;
}

export default function ABTestingModal({
  isOpen,
  onClose,
  currentProjectTopic = "O Mistério das Profundezas do Oceano",
  currentProjectTitle = "O Que Eles Esconderam nas Fossas Marianas",
}: ABTestingModalProps) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "NEW">("ACTIVE");
  const [experiments, setExperiments] = useState<ABExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ABExperiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Formulário de novo experimento
  const [newTitle, setNewTitle] = useState(currentProjectTitle);
  const [newTopic, setNewTopic] = useState(currentProjectTopic);
  const [variantsForm, setVariantsForm] = useState([
    {
      title: "O Que a Marinha Descobriu nas Profundezas Não Deveria Existir",
      thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1280&q=80",
      hookType: "CURIOSITY_GAP" as const,
      hookLabel: "Lacuna de Curiosidade Proibida",
    },
    {
      title: "Eles Desceram 11.000 Metros e Encontraram Algo VIVO",
      thumbnailUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1280&q=80",
      hookType: "SHOCK_REVELATION" as const,
      hookLabel: "Revelação Chocante & Tensão",
    },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const loadExperiments = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/youtube/ab-tests");
        const data = await res.json();
        if (data.success && Array.isArray(data.experiments)) {
          setExperiments(data.experiments);
          if (data.experiments.length > 0 && !selectedExperiment) {
            setSelectedExperiment(data.experiments[0]);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar testes A/B:", e);
      } finally {
        setLoading(false);
      }
    };

    loadExperiments();
  }, [isOpen, selectedExperiment]);

  const handleStart = async (experimentId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/youtube/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START", experimentId }),
      });
      const data = await res.json();
      if (data.success && data.experiment) {
        updateExperimentInList(data.experiment);
      }
    } catch (e) {
      console.error("Erro ao iniciar teste:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async (experimentId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/youtube/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "STOP", experimentId }),
      });
      const data = await res.json();
      if (data.success && data.experiment) {
        updateExperimentInList(data.experiment);
      }
    } catch (e) {
      console.error("Erro ao pausar teste:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConclude = async (experimentId: string, winnerVariantId?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/youtube/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONCLUDE", experimentId, winnerVariantId }),
      });
      const data = await res.json();
      if (data.success && data.experiment) {
        updateExperimentInList(data.experiment);
      }
    } catch (e) {
      console.error("Erro ao concluir teste:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    try {
      setAiGenerating(true);
      const res = await fetch("/api/youtube/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_AI",
          topic: newTopic,
          title: newTitle,
        }),
      });
      const data = await res.json();
      if (data.success && data.aiSuggestions?.suggestions) {
        const formatted = data.aiSuggestions.suggestions.map((s: any) => ({
          title: s.title,
          thumbnailUrl: s.thumbnailUrl,
          hookType: s.hookType,
          hookLabel: s.hookLabel,
        }));
        setVariantsForm(formatted);
      }
    } catch (e) {
      console.error("Erro na geração de variantes por IA:", e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateNewExperiment = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/youtube/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          videoTitle: newTitle,
          variants: variantsForm,
        }),
      });
      const data = await res.json();
      if (data.success && data.experiment) {
        setExperiments((prev) => [data.experiment, ...prev]);
        setSelectedExperiment(data.experiment);
        setActiveTab("ACTIVE");
      }
    } catch (e) {
      console.error("Erro ao criar experimento:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const updateExperimentInList = (updated: ABExperiment) => {
    setExperiments((prev) => prev.map((exp) => (exp.id === updated.id ? updated : exp)));
    if (selectedExperiment?.id === updated.id) {
      setSelectedExperiment(updated);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-4 flex min-h-screen items-center justify-center">
      <div className="relative w-full max-w-5xl bg-[#141923] border border-surface-border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn my-auto">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#0f131a] border-b border-surface-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400">
              <Split className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Testes A/B de Miniaturas & Títulos
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  CTR Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rotacione variantes automáticas no YouTube para maximizar visualizações orgânicas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-surface border border-surface-border">
              <button
                onClick={() => setActiveTab("ACTIVE")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "ACTIVE"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Experimentos ({experiments.length})
              </button>
              <button
                onClick={() => setActiveTab("NEW")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === "NEW"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Teste</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "ACTIVE" ? (
            loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <p className="text-xs">Carregando métricas e variantes de CTR...</p>
              </div>
            ) : experiments.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <Split className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Nenhum teste A/B ativo</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Crie um teste A/B de miniaturas e títulos para comparar ângulos narrativos e encontrar o vencedor que viraliza no YouTube.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("NEW")}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Teste A/B
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Sidebar: Experiments List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Selecione o Vídeo
                  </h4>
                  <div className="space-y-2">
                    {experiments.map((exp) => {
                      const isSelected = selectedExperiment?.id === exp.id;
                      const winner = exp.variants.find((v) => v.id === exp.winnerVariantId) || exp.variants[0];

                      return (
                        <div
                          key={exp.id}
                          onClick={() => setSelectedExperiment(exp)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-950/20 border-purple-500/50 shadow-md"
                              : "bg-[#161c27] border-surface-border hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                exp.status === "RUNNING"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse"
                                  : exp.status === "CONCLUDED"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  : "bg-slate-500/15 text-slate-300 border-slate-500/30"
                              }`}
                            >
                              {exp.status === "RUNNING"
                                ? "● Em Andamento"
                                : exp.status === "CONCLUDED"
                                ? "✓ Concluído"
                                : "Rascunho"}
                            </span>
                            <span className="text-[11px] font-mono text-purple-400 font-bold">
                              {exp.variants.length} Variantes
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white line-clamp-1 mb-1">
                            {exp.videoTitle}
                          </h5>
                          <p className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>{exp.channelName}</span>
                            <span className="text-slate-300 font-mono font-bold">
                              Top CTR: {winner?.ctr || 0}%
                            </span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Detailed Comparison of Variants */}
                {selectedExperiment && (
                  <div className="lg:col-span-2 space-y-5 bg-[#0e1218] p-5 rounded-2xl border border-surface-border">
                    
                    {/* Experiment Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            {selectedExperiment.videoTitle}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          Canal: {selectedExperiment.channelName} • Meta: Taxa de Cliques (CTR)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedExperiment.status === "DRAFT" && (
                          <button
                            onClick={() => handleStart(selectedExperiment.id)}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Iniciar Teste
                          </button>
                        )}

                        {selectedExperiment.status === "RUNNING" && (
                          <>
                            <button
                              onClick={() => handleStop(selectedExperiment.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Pause className="w-3.5 h-3.5" />
                              Pausar
                            </button>
                            <button
                              onClick={() => handleConclude(selectedExperiment.id)}
                              disabled={actionLoading}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                              Eleger Vencedor
                            </button>
                          </>
                        )}

                        {selectedExperiment.status === "CONCLUDED" && (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Vencedor Aplicado no YouTube
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Winner Banner if Concluded */}
                    {selectedExperiment.winnerDeclaredReason && (
                      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-3">
                        <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-purple-200">
                          <p className="font-bold text-white mb-0.5">Resultado Definitivo:</p>
                          {selectedExperiment.winnerDeclaredReason}
                        </div>
                      </div>
                    )}

                    {/* Variants Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedExperiment.variants.map((v) => {
                        const isLeading = v.isWinner;

                        return (
                          <div
                            key={v.id}
                            className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                              isLeading
                                ? "bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/30"
                                : "bg-[#141923] border-surface-border"
                            }`}
                          >
                            {/* Leader Badge */}
                            {isLeading && (
                              <div className="absolute -top-3 right-3 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {selectedExperiment.status === "CONCLUDED" ? "Vencedora Oficial" : "Líder em CTR"}
                              </div>
                            )}

                            <div>
                              {/* Thumbnail 16:9 */}
                              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60 border border-surface-border mb-3 group">
                                <img
                                  src={v.thumbnailUrl}
                                  alt={v.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white font-bold">
                                  {v.name}
                                </div>
                              </div>

                              {/* Variant Title */}
                              <h5 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-2">
                                {v.title}
                              </h5>

                              {/* Hook Tag */}
                              <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300 mb-3">
                                {v.hookLabel}
                              </span>
                            </div>

                            {/* Performance Metrics Box */}
                            <div className="pt-3 border-t border-surface-border space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                                  Taxa de Cliques (CTR)
                                </span>
                                <span
                                  className={`text-sm font-mono font-bold ${
                                    isLeading ? "text-purple-300" : "text-white"
                                  }`}
                                >
                                  {v.ctr}%
                                </span>
                              </div>

                              {/* Progress bar visual comparison */}
                              <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    isLeading ? "bg-gradient-to-r from-purple-500 to-indigo-400" : "bg-slate-600"
                                  }`}
                                  style={{ width: `${Math.min(100, v.ctr * 5)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>{v.impressions.toLocaleString()} impressões</span>
                                <span>{v.clicks.toLocaleString()} cliques</span>
                                <span>~{v.avgWatchSeconds}s retenção</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* NEW EXPERIMENT FORM WITH 1-CLICK AI GENERATOR */
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Header Note */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Gerador de Títulos & Miniaturas com IA LoopX
                  </h4>
                  <p className="text-xs text-purple-200">
                    Nossa IA aplica as 3 fórmulas de retenção mais eficientes em canais dark (Curiosidade Proibida, Fato Censurado e Ponto Cego).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${aiGenerating ? "animate-spin" : ""}`} />
                  {aiGenerating ? "Gerando..." : "Gerar com 1-Clique"}
                </button>
              </div>

              {/* Topic & Base Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tema Central do Vídeo
                  </label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Ex: O Mistério das Profundezas do Oceano"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f131a] border border-surface-border text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Título Base de Referência
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: O Que a Marinha Escondeu"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f131a] border border-surface-border text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Variants Configuration */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Variantes do Experimento (A / B / C)
                </h4>

                {variantsForm.map((v, index) => {
                  const char = String.fromCharCode(65 + index);

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-[#0f131a] border border-surface-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 font-mono">
                          Variante {char} • {v.hookLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Título da Variante
                          </label>
                          <input
                            type="text"
                            value={v.title}
                            onChange={(e) => {
                              const updated = [...variantsForm];
                              updated[index].title = e.target.value;
                              setVariantsForm(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#141923] border border-surface-border text-white text-xs focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            URL da Miniatura
                          </label>
                          <input
                            type="text"
                            value={v.thumbnailUrl}
                            onChange={(e) => {
                              const updated = [...variantsForm];
                              updated[index].thumbnailUrl = e.target.value;
                              setVariantsForm(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#141923] border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("ACTIVE")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewExperiment}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar e Criar Experimento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
