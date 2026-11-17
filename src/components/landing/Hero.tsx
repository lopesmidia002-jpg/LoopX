"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Volume2, 
  Film, 
  ShieldCheck, 
  Layers, 
  Zap,
  TrendingUp,
  MessageCircle
} from "lucide-react";

export default function Hero() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);

  useEffect(() => {
    if (!isPlayingAudio) return;
    const interval = setInterval(() => {
      setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 200);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-inner shadow-brand-500/20">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            <span>Motor de IA v2.4 Especializado em Canais Dark do YouTube</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Da ideia ao vídeo cinematográfico —{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-brand-500 to-brand-accent">
              em minutos
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Pesquisa histórica, roteiros com retenção psicológica máxima, narração neural de cinema, curadoria de mídias 4K e edição com Parallax 2.5D. 
            <strong className="text-white font-semibold"> O LoopX automatiza 100% da criação, sem mostrar o rosto.</strong>
          </p>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/studio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:opacity-95 shadow-xl shadow-brand-500/30 border border-brand-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Sparkles className="w-5 h-5 text-brand-200 group-hover:rotate-12 transition-transform" />
              <span>Criar Meu Vídeo no Estúdio</span>
              <ArrowRight className="w-4 h-4 text-brand-200 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://chat.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold text-slate-200 bg-surface/80 hover:bg-surface-hover border border-surface-border transition-all hover:border-emerald-500/40 hover:text-emerald-400"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Comunidade VIP no WhatsApp</span>
            </a>
          </div>

          {/* Social Proof Creators Counter */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-slate-400">
            <div className="flex -space-x-2">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="Criador 1"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                alt="Criador 2"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop"
                alt="Criador 3"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop"
                alt="Criador 4"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">+3.840 criadores dark</span>
              <span>produzindo mais de 45.000 minutos de vídeo todo mês</span>
            </div>
          </div>
        </div>

        {/* Interactive Studio Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-brand-500/30 via-surface-border to-transparent shadow-2xl shadow-brand-900/30">
            <div className="rounded-[14px] bg-[#1a202c] border border-surface-border overflow-hidden">
              
              {/* Fake Window Header Bar */}
              <div className="bg-[#141923] px-4 py-3 border-b border-surface-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-slate-400 font-mono hidden sm:inline">
                    loopx-studio // Projeto #892: "O Mistério Inexplicável do Voo MH370"
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    GPU Render: Online
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">1080p 60fps</span>
                </div>
              </div>

              {/* Mockup Workspace Area */}
              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#161b24]">
                
                {/* Left: Video Player Mockup with Ken Burns & Subtitles */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-surface-border bg-black group shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop"
                      alt="Cena do documentário"
                      className="w-full h-full object-cover ken-burns-active"
                    />

                    {/* Stage Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                      <span className="text-slate-300">Etapa 6/8:</span>
                      <span className="text-brand-300 font-semibold">Movimento Parallax 2.5D</span>
                    </div>

                    {/* Word-by-Word Subtitle Display */}
                    <div className="absolute bottom-6 left-0 right-0 px-6 text-center">
                      <p className="text-sm sm:text-lg font-black tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight">
                        <span className="text-white">Em 1997, radares militares </span>
                        <span className="bg-brand-500 text-white px-1.5 py-0.5 rounded shadow-lg shadow-brand-500/50">
                          DETECTARAM
                        </span>
                        <span className="text-white"> um ruído colossal...</span>
                      </p>
                    </div>

                    {/* Timeline Progress Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-accent w-[68%]" />
                    </div>
                  </div>

                  {/* Audio Waveform & Voice Track Controls */}
                  <div className="p-3.5 rounded-xl bg-surface/90 border border-surface-border flex items-center justify-between gap-4">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="p-2.5 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500 hover:text-white transition-colors"
                      aria-label="Tocar áudio de exemplo"
                    >
                      <Play className={`w-4 h-4 ${isPlayingAudio ? "fill-white" : ""}`} />
                    </button>

                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-brand-400" />
                          Voz Neural: Marcos (Sombria & Suspense)
                        </span>
                        <span className="text-slate-400 font-mono">03:42 / 12:15</span>
                      </div>

                      {/* Waveform Visualization Bars */}
                      <div className="h-6 flex items-center gap-1">
                        {[40, 65, 80, 50, 95, 70, 85, 45, 60, 100, 75, 55, 90, 60, 40, 80, 95, 70, 50, 85, 65, 45, 90, 75, 60, 80, 55, 70, 90, 40].map((height, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              (i / 30) * 100 <= audioProgress ? "bg-brand-400" : "bg-slate-700"
                            }`}
                            style={{ height: `${isPlayingAudio ? Math.max(15, (height * (audioProgress % 40 + 60)) / 100) : height}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end text-xs text-slate-400">
                      <span className="text-emerald-400 font-medium">Auto-Ducking Ativo</span>
                      <span>Música: -14dB na fala</span>
                    </div>
                  </div>
                </div>

                {/* Right: Pipeline Stages Progress Sidebar */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Pipeline Autônomo (8 Etapas)
                      </span>
                      <span className="text-xs font-bold text-brand-300">75% Concluído</span>
                    </div>

                    {/* Step Cards List */}
                    <div className="space-y-1.5">
                      {[
                        { step: 1, title: "Pesquisa & Apuração de Fatos", done: true },
                        { step: 2, title: "Roteiro Narrativo (Gancho + Clímax)", done: true },
                        { step: 3, title: "Curadoria de Clipes 4K e Fotos", done: true },
                        { step: 4, title: "Geração da Narração Neural", done: true },
                        { step: 5, title: "Legendas Sincronizadas Palavra a Palavra", done: true },
                        { step: 6, title: "Movimento Parallax 2.5D & Ken Burns", active: true },
                        { step: 7, title: "Mixagem & SFX com Ducking", pending: true },
                        { step: 8, title: "Renderização MP4 1080p", pending: true },
                      ].map((item) => (
                        <div
                          key={item.step}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                            item.done
                              ? "bg-surface/50 border-emerald-500/20 text-slate-300"
                              : item.active
                              ? "bg-brand-500/15 border-brand-500/40 text-brand-200 font-semibold shadow-sm"
                              : "bg-surface/20 border-surface-border/40 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] w-4 text-slate-400">
                              0{item.step}
                            </span>
                            <span className="truncate">{item.title}</span>
                          </div>

                          {item.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          {item.active && (
                            <span className="flex h-2 w-2 relative shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
                            </span>
                          )}
                          {item.pending && <span className="text-[10px] text-slate-400 shrink-0">Na fila</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ready to Publish YouTube pill */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                        <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">YouTube 1-Clique</p>
                        <p className="text-[10px] text-slate-400">Capítulos e SEO prontos</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-red-300 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20">
                      Auto-Publish
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
