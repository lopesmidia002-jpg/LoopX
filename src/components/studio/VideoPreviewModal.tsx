"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Play, 
  Pause, 
  Download, 
  Youtube, 
  Check, 
  Share2, 
  Sparkles, 
  Clock, 
  Layers,
  Copy,
  CheckCircle2,
  Calendar,
  Split
} from "lucide-react";
import { SceneItem } from "@/lib/types";
import ScheduleCalendarModal from "./ScheduleCalendarModal";
import ABTestingModal from "./ABTestingModal";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  scenes: SceneItem[];
  isPublishingToYouTube?: boolean;
}

export default function VideoPreviewModal({
  isOpen,
  onClose,
  topicTitle,
  scenes,
  isPublishingToYouTube = false,
}: VideoPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"PLAYER" | "YOUTUBE">("PLAYER");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishedData, setPublishedData] = useState<{ watchUrl: string; videoId: string } | null>(null);
  const [isSubmittingYouTube, setIsSubmittingYouTube] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isABModalOpen, setIsABModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Auto-generate Chapters with timestamps
  const chaptersText = scenes
    .map((scene, idx) => {
      const minutes = Math.floor((idx * 35) / 60);
      const seconds = (idx * 35) % 60;
      const timecode = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      return `${timecode} - ${scene.narrationText.slice(0, 45)}...`;
    })
    .join("\n");

  const handleCopyChapters = () => {
    navigator.clipboard.writeText(chaptersText);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  const handlePublishYouTube = async () => {
    setIsSubmittingYouTube(true);
    try {
      const res = await fetch("/api/youtube/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${topicTitle || "Documentário Completo"} (YOUTUBE DARK)`,
          description: `Documentário completo produzido pelo LoopX.\n\n${chaptersText}`,
          privacyStatus: "unlisted",
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setPublishedData({
          watchUrl: data.result.watchUrl,
          videoId: data.result.videoId,
        });
        setPublishedSuccess(true);
      }
    } catch (e) {
      console.error("Erro ao publicar:", e);
    } finally {
      setIsSubmittingYouTube(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex min-h-screen items-center justify-center">
      <div className="bg-[#181e29] border border-surface-border rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-fadeIn my-auto">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#131822] border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-300 font-bold bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/25">
              1080p 60fps Full HD
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-md">
              {topicTitle || "Vídeo Renderizado"}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs toggle */}
            <div className="inline-flex rounded-lg bg-surface p-1 border border-surface-border">
              <button
                onClick={() => setActiveTab("PLAYER")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  activeTab === "PLAYER"
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Player
              </button>
              <button
                onClick={() => setActiveTab("YOUTUBE")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "YOUTUBE"
                    ? "bg-red-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Publicar YouTube</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {activeTab === "PLAYER" ? (
            <div className="space-y-6">
              
              {/* 16:9 Video Player Simulation */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-surface-border bg-black shadow-2xl group">
                <img
                  src={scenes[0]?.mediaUrl || "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop"}
                  alt="Player preview"
                  className={`w-full h-full object-cover ${isPlaying ? "ken-burns-active" : ""}`}
                />

                {/* Subtitles Overlay */}
                <div className="absolute bottom-6 left-0 right-0 px-8 text-center">
                  <span className="bg-black/85 backdrop-blur-md text-white text-sm sm:text-lg font-black px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                    "{scenes[0]?.narrationText || "Narrativa cinematográfica gerada automaticamente pelo LoopX..."}"
                  </span>
                </div>

                {/* Play/Pause Overlay */}
                <div 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 bg-black/30 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-xl">
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white ml-1" />}
                  </div>
                </div>

                {/* Player Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                  <div className="h-full bg-brand-500 w-[45%]" />
                </div>
              </div>

              {/* Action Buttons under Player */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#131822] border border-surface-border">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="font-mono text-brand-300 font-bold">10:45</span>
                  <span>•</span>
                  <span>Áudio Estéreo 320kbps</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">1080p MP4 Pronto</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const srtContent = scenes
                        .map((s, idx) => {
                          const startSec = idx * 8;
                          const endSec = (idx + 1) * 8;
                          const formatTime = (sec: number) => {
                            const mm = String(Math.floor(sec / 60)).padStart(2, "0");
                            const ss = String(sec % 60).padStart(2, "0");
                            return `00:${mm}:${ss},000`;
                          };
                          return `${idx + 1}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${s.narrationText}\n`;
                        })
                        .join("\n");
                      const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "loopx-legendas.srt";
                      a.click();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Baixar .SRT</span>
                  </button>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Download iniciado: loopx-documentario-1080p.mp4");
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo MP4</span>
                  </a>

                  <button
                    onClick={() => setActiveTab("YOUTUBE")}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Publicar no Canal</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* YouTube 1-Click Publishing View */
            <div className="space-y-6">
              {publishedSuccess ? (
                <div className="p-8 text-center rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-white">
                    Vídeo Publicado com Sucesso no YouTube!
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                    O vídeo foi enviado como <strong>Não-Listado / Rascunho</strong> com todos os títulos, descrições e capítulos prontos para monetização.
                  </p>

                  {publishedData && (
                    <div className="mt-4 p-3 bg-[#131822] rounded-xl border border-surface-border inline-flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">Link Direto:</span>
                      <a
                        href={publishedData.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-red-400 hover:text-red-300 underline"
                      >
                        {publishedData.watchUrl}
                      </a>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPublishedSuccess(false)}
                      className="px-6 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-bold text-white"
                    >
                      Voltar ao Estúdio
                    </button>
                    {publishedData && (
                      <a
                        href={publishedData.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        <Youtube className="w-4 h-4" />
                        <span>Abrir no YouTube</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 uppercase tracking-wider">
                      Título Otimizado para CTR (YouTube SEO):
                    </label>
                    <input
                      type="text"
                      defaultValue={`${topicTitle || "O Mistério Inexplicável"} (DOCUMENTÁRIO COMPLETO)`}
                      className="w-full bg-[#12161f] border border-surface-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Capítulos Automáticos (Timestamps):
                      </label>
                      <button
                        onClick={handleCopyChapters}
                        className="text-xs text-brand-300 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedChapters ? "Copiado!" : "Copiar Capítulos"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      readOnly
                      value={chaptersText}
                      className="w-full bg-[#12161f] border border-surface-border rounded-xl p-3 font-mono text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Privacidade no YouTube:
                      </label>
                      <select className="w-full bg-[#12161f] border border-surface-border rounded-xl p-2.5 text-xs text-white">
                        <option>Rascunho (Revisar no YouTube Studio)</option>
                        <option>Não-Listado (Apenas com o Link)</option>
                        <option>Público Imediato</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Canal Conectado:
                      </label>
                      <div className="bg-[#12161f] border border-surface-border rounded-xl p-2.5 text-xs text-slate-300 flex items-center justify-between">
                        <span>Dark Mysteries Oficial (@darkmysteries)</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Conectado</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={handlePublishYouTube}
                      className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.01]"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>Confirmar Envio em 1 Clique</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="px-5 py-3.5 rounded-xl bg-surface hover:bg-surface-hover text-brand-300 hover:text-white border border-brand-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Agendar Lançamento</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsABModalOpen(true)}
                      className="px-5 py-3.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Split className="w-4 h-4" />
                      <span>Teste A/B</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Schedule Calendar Modal */}
        <ScheduleCalendarModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          defaultTitle={topicTitle}
        />

        {/* A/B Testing Modal */}
        <ABTestingModal
          isOpen={isABModalOpen}
          onClose={() => setIsABModalOpen(false)}
          currentProjectTopic={topicTitle}
          currentProjectTitle={topicTitle}
        />
      </div>
    </div>,
    document.body
  );
}
