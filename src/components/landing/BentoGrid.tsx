"use client";

import React, { useState } from "react";
import { 
  Camera, 
  Mic, 
  FileText, 
  Volume2, 
  Play, 
  Zap, 
  Check, 
  Layers, 
  Sparkles,
  Sliders,
  TrendingUp
} from "lucide-react";
import { VOICE_OPTIONS } from "@/lib/constants";

export default function BentoGrid() {
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <section id="recursos" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Diferenciais Técnicos
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engenharia pensada para dominar o algoritmo do YouTube
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Cada detalhe do VeloVide foi projetado para elevar o CTR (taxa de clique) e a AVD (duração média de visualização).
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Movimento Cinematográfico & Parallax 2.5D (Large: col-span-7) */}
          <div className="lg:col-span-7 glass-surface rounded-2xl p-7 flex flex-col justify-between border border-surface-border group hover:border-brand-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-brand-300 bg-brand-500/15 border border-brand-500/30 px-3 py-1 rounded-full">
                  Sem Imagens Estáticas
                </span>
                <Camera className="w-5 h-5 text-brand-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Movimento Cinematográfico & Parallax 2.5D
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Adeus aos slideshows mortos que derrubam a retenção. O VeloVide aplica profundidade 2.5D com separação de planos, efeito Ken Burns dinâmico em 4K e transições rítmicas milimetricamente alinhadas à cadência da fala.
              </p>
            </div>

            {/* Visual simulation box */}
            <div className="relative rounded-xl overflow-hidden aspect-[21/9] border border-surface-border bg-black">
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"
                alt="Parallax visual"
                className="w-full h-full object-cover ken-burns-active"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-brand-500/80 text-[11px] font-bold text-white uppercase tracking-wider">
                    Profundidade 2.5D
                  </span>
                  <span className="text-xs text-slate-200">
                    Zoom Contínuo + Shake Sutil de Câmera Documental
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Vozes Realistas de Suspense (col-span-5) */}
          <div className="lg:col-span-5 glass-surface rounded-2xl p-7 flex flex-col justify-between border border-surface-border group hover:border-brand-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-brand-300 bg-brand-500/15 border border-brand-500/30 px-3 py-1 rounded-full">
                  Zero Voz Robótica
                </span>
                <Mic className="w-5 h-5 text-brand-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Vozes Neurais de Alta Inflexão
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Modelos treinados em locutores de canais de mistério e documentários da BBC e History Channel, com respiração natural e modulação emocional de suspense.
              </p>

              {/* Interactive Voice Selector */}
              <div className="space-y-2 mt-4">
                {VOICE_OPTIONS.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v);
                      setIsPlayingAudio(!isPlayingAudio);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs flex items-center justify-between transition-all ${
                      selectedVoice.id === v.id
                        ? "bg-brand-500/20 border-brand-500 text-white font-medium"
                        : "bg-surface/50 border-surface-border text-slate-300 hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Volume2 className={`w-3.5 h-3.5 ${selectedVoice.id === v.id ? "text-brand-400" : "text-slate-400"}`} />
                      <span>{v.name}</span>
                    </div>
                    <span className="text-[10px] bg-[#161b24] px-2 py-0.5 rounded text-brand-300 font-mono">
                      {v.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs text-slate-400">
              <span>Suporte a PT-BR, EN e ES</span>
              <span className="text-emerald-400 font-medium">Clone de Voz Disponível</span>
            </div>
          </div>

          {/* Card 3: Pesquisa + Roteiro Estruturado (col-span-4) */}
          <div className="lg:col-span-4 glass-surface rounded-2xl p-7 flex flex-col justify-between border border-surface-border group hover:border-brand-500/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-300 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Pesquisa & Roteiro Hipnótico
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                A IA apura dados reais e constrói o roteiro com ganchos (hooks) magnéticos nos primeiros 30 segundos, loops abertos e retenção progressiva até o desfecho.
              </p>
            </div>

            <div className="bg-[#141923] p-3 rounded-xl border border-surface-border text-xs space-y-1.5 font-mono text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Gancho de Curiosidade Inicial</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Fatos Verificados & Sem Alucinação</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Divisão em Atos e Clímax Dramático</span>
              </div>
            </div>
          </div>

          {/* Card 4: Mixagem Automática com Audio Ducking (col-span-4) */}
          <div className="lg:col-span-4 glass-surface rounded-2xl p-7 flex flex-col justify-between border border-surface-border group hover:border-brand-500/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-300 mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Trilha Sonora + SFX com Ducking
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Músicas cinematográficas orquestrais e efeitos sonoros sincronizados (whoosh, batidas cardíacas, risers) com abaixamento dinâmico automático sob a narração.
              </p>
            </div>

            <div className="p-3 bg-[#141923] rounded-xl border border-surface-border flex items-center justify-between text-xs">
              <span className="text-slate-400">Sensibilidade do Ducking:</span>
              <span className="font-mono text-brand-300 font-bold">-16 dB Dinâmico</span>
            </div>
          </div>

          {/* Card 5: YouTube em 1 Clique (col-span-4) */}
          <div className="lg:col-span-4 glass-surface rounded-2xl p-7 flex flex-col justify-between border border-surface-border group hover:border-brand-500/40 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
                <Play className="w-5 h-5 fill-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                YouTube em 1 Clique com SEO
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Envio direto via YouTube Data API. O VeloVide gera título otimizado para CTR, descrição com hashtags de ranqueamento e capítulos por cena com timestamps.
              </p>
            </div>

            <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-200">
              <span>Capítulos Automáticos:</span>
              <span className="font-mono font-bold">00:00, 02:15, 05:40...</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
