"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Film,
  ListOrdered,
  Globe,
  Mic,
  Clock,
  Upload,
  Play,
  Volume2,
  Check,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { VOICE_OPTIONS } from "@/lib/constants";
import { VideoFormat, Language, VoiceOption } from "@/lib/types";

interface ProjectConfigProps {
  onStartPipeline: (config: {
    topic: string;
    format: VideoFormat;
    language: Language;
    voiceId: string;
    customScript?: string;
    targetDuration: number;
  }) => void;
  isProcessing: boolean;
  resetKey?: number;
}

const TEMPLATE_SUGGESTIONS = [
  "O Mistério Inexplicável do Voo MH370 e as Teorias Ocultas",
  "As 10 Descobertas Arqueológicas Mais Perturbadoras da Humanidade",
  "A Civilização Perdida sob o Gelo da Antártida",
  "Top 10 Armas Secretas que Quase Mudaram a Segunda Guerra Mundial",
  "O Que a Ciência Descobriu no Fundo da Fossa das Marianas",
];

export default function ProjectConfig({ onStartPipeline, isProcessing, resetKey }: ProjectConfigProps) {
  const [topic, setTopic] = useState("");
  const [customScript, setCustomScript] = useState("");
  const [hasCustomScript, setHasCustomScript] = useState(false);
  const [format, setFormat] = useState<VideoFormat>("DOCUMENTARY");
  const [language, setLanguage] = useState<Language>("PT_BR");
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [targetDuration, setTargetDuration] = useState<number>(10);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (resetKey && resetKey > 0) {
      setTopic("");
      setCustomScript("");
      setHasCustomScript(false);
      const input = document.getElementById("project-topic-input");
      if (input) {
        input.focus();
        input.classList.add("ring-2", "ring-brand-400");
        setTimeout(() => input.classList.remove("ring-2", "ring-brand-400"), 2000);
      }
    }
  }, [resetKey]);

  const filteredVoices = VOICE_OPTIONS.filter((v) => v.language === language);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onStartPipeline({
      topic,
      format,
      language,
      voiceId: selectedVoice.id,
      customScript: hasCustomScript ? customScript : undefined,
      targetDuration,
    });
  };

  const playVoicePreview = (voiceId: string) => {
    setPlayingVoiceId(playingVoiceId === voiceId ? null : voiceId);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6">

      {/* Intro Header */}
      <div className="text-center mb-6 sm:mb-8">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
          Etapa 1 de 3 • Configuração
        </span>
        <h1 className="mt-2.5 sm:mt-3 text-xl sm:text-3xl font-extrabold text-white">
          Configure seu Próximo Vídeo
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400">
          Defina o tema, formato e estilo narrativo. O pipeline autônomo cuidará de todo o resto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">

        {/* Topic or Idea Input */}
        <div className="glass-surface rounded-2xl p-4 sm:p-6 border border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Ideia, Tópico ou Título do Vídeo *</span>
            </label>
            <button
              type="button"
              onClick={() => setHasCustomScript(!hasCustomScript)}
              className="text-[11px] sm:text-xs font-semibold text-brand-300 hover:text-white transition-colors"
            >
              {hasCustomScript ? "— Esconder roteiro próprio" : "+ Já tenho um roteiro pronto"}
            </button>
          </div>

          <textarea
            id="project-topic-input"
            required
            rows={hasCustomScript ? 2 : 3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: O Mistério Inexplicável do Voo MH370 e os radares que desapareceram na calada da noite..."
            className="w-full bg-[#141923] border border-surface-border rounded-xl p-3 sm:p-3.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />

          {/* Quick Suggestions Chips (Horizontal Swipe on Mobile) */}
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Sugestões de alta retenção no YouTube Dark:
            </span>
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:flex-wrap">
              {TEMPLATE_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(sug)}
                  className="text-[11px] bg-surface hover:bg-surface-hover text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-surface-border transition-colors whitespace-nowrap sm:whitespace-normal shrink-0 max-w-xs text-left min-h-[36px] active:scale-95"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Custom Script Field */}
          {hasCustomScript && (
            <div className="mt-4 pt-4 border-t border-surface-border">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Cole seu Roteiro Completo (Opcional):
              </label>
              <textarea
                rows={6}
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                placeholder="Cole aqui seu roteiro. Se deixado em branco, a IA escreverá do zero com gancho, desenvolvimento e clímax..."
                className="w-full bg-[#12161f] border border-surface-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}
        </div>

        {/* Video Format Selector */}
        <div className="glass-surface rounded-2xl p-6 border border-surface-border">
          <label className="text-sm font-bold text-white block mb-3">
            Formato do Vídeo *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Documentary Card */}
            <button
              type="button"
              onClick={() => setFormat("DOCUMENTARY")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all ${format === "DOCUMENTARY"
                ? "bg-brand-500/15 border-brand-500 text-white shadow-lg shadow-brand-500/10"
                : "bg-surface/50 border-surface-border text-slate-300 hover:bg-surface"
                }`}
            >
              <div className={`p-2.5 rounded-lg ${format === "DOCUMENTARY" ? "bg-brand-500 text-white" : "bg-[#141923] text-slate-400"}`}>
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Documentário Cinematográfico
                  {format === "DOCUMENTARY" && <Check className="w-4 h-4 text-brand-400" />}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Narrativa imersiva linear com suspense, ganchos de retenção profunda e reviravoltas no clímax.
                </p>
              </div>
            </button>

            {/* Top 10 Ranking Card */}
            <button
              type="button"
              onClick={() => setFormat("TOP_10")}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all ${format === "TOP_10"
                ? "bg-brand-500/15 border-brand-500 text-white shadow-lg shadow-brand-500/10"
                : "bg-surface/50 border-surface-border text-slate-300 hover:bg-surface"
                }`}
            >
              <div className={`p-2.5 rounded-lg ${format === "TOP_10" ? "bg-brand-500 text-white" : "bg-[#141923] text-slate-400"}`}>
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Top 10 / Ranking de Fatos
                  {format === "TOP_10" && <Check className="w-4 h-4 text-brand-400" />}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Lista numerada progressiva (do 10º ao 1º lugar) gerando curiosidade voraz até o item número 1.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Language & Voice Selector */}
        <div className="glass-surface rounded-2xl p-6 border border-surface-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-brand-400" />
              <span>Idioma e Escolha de Voz Realista *</span>
            </label>

            {/* Language Selector Pill */}
            <div className="inline-flex rounded-lg bg-[#141923] p-1 border border-surface-border">
              {(["PT_BR", "EN", "ES"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    const matching = VOICE_OPTIONS.find((v) => v.language === lang);
                    if (matching) setSelectedVoice(matching);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === lang
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:text-white"
                    }`}
                >
                  {lang === "PT_BR" ? "🇧🇷 Português" : lang === "EN" ? "🇺🇸 Inglês" : "🇪🇸 Espanhol"}
                </button>
              ))}
            </div>
          </div>

          {/* Voices List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {filteredVoices.map((voice) => {
              const isSelected = selectedVoice.id === voice.id;
              const isPlaying = playingVoiceId === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected
                    ? "bg-brand-500/20 border-brand-500 text-white shadow-md"
                    : "bg-[#141923] border-surface-border text-slate-300 hover:border-slate-700"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoicePreview(voice.id);
                      }}
                      className="p-2 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500 hover:text-white transition-colors"
                      aria-label="Ouvir voz"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse text-white" : ""}`} />
                    </button>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {voice.name}
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      </h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{voice.description}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-brand-300 bg-surface px-2 py-0.5 rounded border border-surface-border">
                    {voice.tag}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-surface-border/50">
            <span>Ou faça upload da sua própria narração gravada:</span>
            <button
              type="button"
              className="text-xs font-semibold text-brand-300 hover:text-white flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Áudio (.mp3 / .wav)</span>
            </button>
          </div>
        </div>

        {/* Target Duration */}
        <div className="glass-surface rounded-2xl p-4 sm:p-6 border border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Duração Alvo do Vídeo *</span>
            </label>
            <span className="text-[11px] sm:text-xs font-bold text-brand-300 font-mono">
              {targetDuration} min (~{Math.round(targetDuration * 1.1)}m crédito)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[8, 10, 12, 15].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setTargetDuration(dur)}
                className={`py-3 rounded-xl border text-center font-bold text-xs transition-all min-h-[44px] active:scale-95 ${targetDuration === dur
                  ? "bg-brand-600 text-white border-brand-500 shadow-md"
                  : "bg-[#141923] border-surface-border text-slate-300 hover:border-slate-700"
                  }`}
              >
                {dur} min
              </button>
            ))}
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-2.5 sm:mt-3">
            Vídeos entre 8 e 15 minutos atingem o ponto ideal de monetização máxima no YouTube, habilitando anúncios intermediários (mid-roll ads).
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !topic.trim()}
          className="w-full py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:opacity-95 shadow-xl shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[50px]"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-200" />
          <span>Iniciar Pipeline de Criação (8 Etapas)</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-200" />
        </button>

      </form>

    </div>
  );
}
