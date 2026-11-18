"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  Film,
  ListOrdered,
  Mic,
  Clock,
  Volume2,
  Check,
  ArrowRight,
  Lightbulb,
  FileText,
  PlusCircle,
} from "lucide-react";
import { VOICE_OPTIONS } from "@/lib/constants";
import { VideoFormat, Language, VoiceOption } from "@/lib/types";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: {
    topic: string;
    format: VideoFormat;
    language: Language;
    voiceId: string;
    customScript?: string;
    targetDuration: number;
  }) => void;
  initialTopic?: string;
}

const TEMPLATE_SUGGESTIONS = [
  "O Mistério Inexplicável do Voo MH370 e as Teorias Ocultas",
  "As 10 Descobertas Arqueológicas Mais Perturbadoras da Humanidade",
  "A Civilização Perdida sob o Gelo da Antártida",
  "Top 10 Armas Secretas que Quase Mudaram a Segunda Guerra Mundial",
  "O Que a Ciência Descobriu no Fundo da Fossa das Marianas",
];

export default function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialTopic = "",
}: NewProjectModalProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [format, setFormat] = useState<VideoFormat>("DOCUMENTARY");
  const [language, setLanguage] = useState<Language>("PT_BR");
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [targetDuration, setTargetDuration] = useState<number>(10);
  const [hasCustomScript, setHasCustomScript] = useState(false);
  const [customScript, setCustomScript] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialTopic) setTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen || !mounted) return null;

  const filteredVoices = VOICE_OPTIONS.filter((v) => v.language === language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onSubmit({
      topic: topic.trim(),
      format,
      language,
      voiceId: selectedVoice.id,
      customScript: hasCustomScript ? customScript : undefined,
      targetDuration,
    });
    onClose();
  };

  const playVoicePreview = (voiceId: string) => {
    setPlayingVoiceId(playingVoiceId === voiceId ? null : voiceId);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-4 flex min-h-screen items-end sm:items-center justify-center animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-left max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-surface-border/50 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <PlusCircle className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">Criar Novo Projeto</h2>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 text-[10px] font-mono font-bold border border-brand-500/30">
                Pipeline 8 Etapas
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configure os parâmetros do próximo vídeo dark para geração autônoma.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Topic or Idea Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Tema, Tópico ou Ideia *</span>
              </label>
              <button
                type="button"
                onClick={() => setHasCustomScript(!hasCustomScript)}
                className="text-[11px] font-semibold text-brand-300 hover:text-white transition-colors"
              >
                {hasCustomScript ? "— Esconder roteiro próprio" : "+ Já tenho um roteiro"}
              </button>
            </div>

            <textarea
              required
              rows={hasCustomScript ? 2 : 3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: O Mistério Inexplicável do Voo MH370 e os radares militares desclassificados..."
              className="w-full bg-[#141923] border border-surface-border rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              autoFocus
            />

            {/* Quick Suggestions */}
            <div className="mt-2">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Ideias de alto CTR:
              </span>
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
                {TEMPLATE_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="text-[11px] bg-[#141923] hover:bg-surface-hover text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-surface-border transition-colors whitespace-nowrap shrink-0"
                  >
                    {sug.length > 38 ? sug.substring(0, 38) + "..." : sug}
                  </button>
                ))}
              </div>
            </div>

            {hasCustomScript && (
              <div className="mt-3 pt-3 border-t border-surface-border">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cole seu Roteiro Completo:
                </label>
                <textarea
                  rows={3}
                  value={customScript}
                  onChange={(e) => setCustomScript(e.target.value)}
                  placeholder="Cole aqui a narrativa pronta dividida em atos ou parágrafos..."
                  className="w-full bg-[#141923] border border-surface-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-xs font-bold text-white block mb-1.5">Formato do Vídeo *</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormat("DOCUMENTARY")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  format === "DOCUMENTARY"
                    ? "bg-brand-500/20 border-brand-500 text-white"
                    : "bg-[#141923] border-surface-border text-slate-300 hover:border-slate-700"
                }`}
              >
                <Film className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Documentário</h4>
                  <p className="text-[10px] text-slate-400">Suspense e narrativa contínua</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("TOP_10")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  format === "TOP_10"
                    ? "bg-brand-500/20 border-brand-500 text-white"
                    : "bg-[#141923] border-surface-border text-slate-300 hover:border-slate-700"
                }`}
              >
                <ListOrdered className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Top 10 / Ranking</h4>
                  <p className="text-[10px] text-slate-400">Lista progressiva do 10º ao 1º</p>
                </div>
              </button>
            </div>
          </div>

          {/* Language & Voice Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-brand-400" />
                <span>Idioma & Voz Neural</span>
              </label>

              {/* Language Pills */}
              <div className="inline-flex rounded-lg bg-[#141923] p-0.5 border border-surface-border">
                {(["PT_BR", "EN", "ES"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      const matching = VOICE_OPTIONS.find((v) => v.language === lang);
                      if (matching) setSelectedVoice(matching);
                    }}
                    className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${
                      language === lang
                        ? "bg-brand-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang === "PT_BR" ? "🇧🇷 PT" : lang === "EN" ? "🇺🇸 EN" : "🇪🇸 ES"}
                  </button>
                ))}
              </div>
            </div>

            {/* Voices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredVoices.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                const isPlaying = playingVoiceId === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-brand-500/20 border-brand-500 text-white"
                        : "bg-[#141923] border-surface-border text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoicePreview(voice.id);
                        }}
                        className="p-1.5 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500 hover:text-white transition-colors"
                        aria-label="Ouvir voz"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? "animate-pulse text-white" : ""}`} />
                      </button>
                      <div>
                        <h5 className="text-xs font-bold text-white flex items-center gap-1">
                          {voice.name}
                          {isSelected && <Check className="w-3 h-3 text-brand-400" />}
                        </h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{voice.description}</p>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-brand-300 bg-surface px-1.5 py-0.5 rounded border border-surface-border">
                      {voice.tag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>Duração Alvo</span>
              </label>
              <span className="text-[11px] font-bold text-brand-300 font-mono">
                {targetDuration} min
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[8, 10, 12, 15].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setTargetDuration(dur)}
                  className={`py-2 rounded-xl border text-center font-bold text-xs transition-all ${
                    targetDuration === dur
                      ? "bg-brand-600 text-white border-brand-500 shadow-md"
                      : "bg-[#141923] border-surface-border text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {dur} min
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={!topic.trim()}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:opacity-95 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[46px]"
            >
              <Sparkles className="w-4 h-4 text-brand-200" />
              <span>Criar Projeto & Iniciar Produção</span>
              <ArrowRight className="w-4 h-4 text-brand-200" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 text-xs font-bold border border-surface-border transition-colors min-h-[46px]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
