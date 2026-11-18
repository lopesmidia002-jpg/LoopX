"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Split,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  RotateCcw
} from "lucide-react";
import { SceneItem, MotionEffect } from "@/lib/types";
import ScheduleCalendarModal from "./ScheduleCalendarModal";
import ABTestingModal from "./ABTestingModal";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  scenes: SceneItem[];
  isPublishingToYouTube?: boolean;
}

const MOTION_EFFECT_LABELS: Record<MotionEffect | string, string> = {
  KEN_BURNS_ZOOM_IN: "Ken Burns (Zoom In Lento)",
  KEN_BURNS_ZOOM_OUT: "Ken Burns (Zoom Out Lento)",
  KEN_BURNS_PAN_LEFT: "Panorâmica para Esquerda",
  KEN_BURNS_PAN_RIGHT: "Panorâmica para Direita",
  PARALLAX_25D: "Parallax 2.5D com Profundidade",
  STATIC: "Estático",
};

export default function VideoPreviewModal({
  isOpen,
  onClose,
  topicTitle,
  scenes,
  isPublishingToYouTube = false,
}: VideoPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"PLAYER" | "YOUTUBE">("PLAYER");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishedData, setPublishedData] = useState<{ watchUrl: string; videoId: string } | null>(null);
  const [isSubmittingYouTube, setIsSubmittingYouTube] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isABModalOpen, setIsABModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDownloadingMp4, setIsDownloadingMp4] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const timelineBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPublishingToYouTube) {
      setActiveTab("YOUTUBE");
    }
  }, [isPublishingToYouTube, isOpen]);

  // Reset player when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  // Compute scene timeline with start and end timestamps
  const timeline = useMemo(() => {
    let cumulative = 0;
    return scenes.map((s, idx) => {
      const start = cumulative;
      const duration = Math.max(4, Number(s.durationSeconds) || 7.5);
      cumulative += duration;
      return {
        ...s,
        sceneIndex: idx,
        startTime: start,
        endTime: cumulative,
        duration,
      };
    });
  }, [scenes]);

  const totalDuration = useMemo(() => {
    if (timeline.length === 0) return 60;
    return timeline[timeline.length - 1].endTime;
  }, [timeline]);

  // Identify active scene based on currentTime
  const activeSceneIndex = useMemo(() => {
    if (timeline.length === 0) return 0;
    const foundIdx = timeline.findIndex(
      (t) => currentTime >= t.startTime && currentTime < t.endTime
    );
    if (foundIdx !== -1) return foundIdx;
    return currentTime >= totalDuration ? timeline.length - 1 : 0;
  }, [timeline, currentTime, totalDuration]);

  const activeScene = timeline[activeSceneIndex] || timeline[0];

  // Playback ticker (updates currentTime every 50ms)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.05;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Speech Synthesis for real-time narration audio
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (!isPlaying || isMuted) {
      window.speechSynthesis.cancel();
      return;
    }

    // Cancel prior speech and start speaking current scene text
    window.speechSynthesis.cancel();
    if (activeScene?.narrationText) {
      const utterance = new SpeechSynthesisUtterance(activeScene.narrationText);
      utterance.lang = "pt-BR";
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeSceneIndex, isPlaying, isMuted, activeScene?.narrationText]);

  // Subtitle word-by-word highlight calculation
  const words = useMemo(() => {
    return (activeScene?.narrationText || "").split(/\s+/).filter(Boolean);
  }, [activeScene?.narrationText]);

  const activeWordIndex = useMemo(() => {
    if (words.length === 0) return 0;
    const sceneElapsed = currentTime - (activeScene?.startTime || 0);
    const duration = activeScene?.duration || 7;
    const progress = Math.min(1, Math.max(0, sceneElapsed / duration));
    return Math.min(words.length - 1, Math.floor(progress * words.length));
  }, [words.length, currentTime, activeScene]);

  // Format seconds to MM:SS
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Timeline scrubber interaction
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineBarRef.current) return;
    const rect = timelineBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * totalDuration;
    setCurrentTime(targetTime);
  };

  const handlePrevScene = () => {
    if (activeSceneIndex > 0) {
      setCurrentTime(timeline[activeSceneIndex - 1].startTime);
    } else {
      setCurrentTime(0);
    }
  };

  const handleNextScene = () => {
    if (activeSceneIndex < timeline.length - 1) {
      setCurrentTime(timeline[activeSceneIndex + 1].startTime);
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      playerContainerRef.current.requestFullscreen().catch(() => { });
    }
  };

  // Real MP4 Download
  const handleDownloadMp4 = () => {
    setIsDownloadingMp4(true);
    const a = document.createElement("a");
    a.href = "/api/render?download=true";
    a.download = `loopx-${(topicTitle || "documentario").replace(/[^a-zA-Z0-9_-]/g, "_")}-1080p.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setIsDownloadingMp4(false), 2000);
  };

  // Chapters with timestamps
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

  if (!isOpen || !mounted) return null;

  // Determine motion transform style based on active scene effect
  const getMotionTransformStyle = () => {
    if (!isPlaying) return {};
    const effect = activeScene?.motionEffect;
    if (effect === "KEN_BURNS_ZOOM_IN") {
      return { transform: "scale(1.12)", transition: "transform 8s ease-out" };
    }
    if (effect === "KEN_BURNS_ZOOM_OUT") {
      return { transform: "scale(1.0)", transition: "transform 8s ease-out" };
    }
    if (effect === "KEN_BURNS_PAN_LEFT") {
      return { transform: "scale(1.1) translateX(-3%)", transition: "transform 8s ease-out" };
    }
    if (effect === "KEN_BURNS_PAN_RIGHT") {
      return { transform: "scale(1.1) translateX(3%)", transition: "transform 8s ease-out" };
    }
    if (effect === "PARALLAX_25D") {
      return { transform: "scale(1.08) perspective(600px) rotateY(1.5deg)", transition: "transform 8s ease-out" };
    }
    return { transform: "scale(1.08)", transition: "transform 8s ease-out" };
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
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeTab === "PLAYER"
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Player
              </button>
              <button
                onClick={() => setActiveTab("YOUTUBE")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === "YOUTUBE"
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

              {/* 16:9 Playable Video Player Container */}
              <div
                ref={playerContainerRef}
                className="relative aspect-video rounded-xl overflow-hidden border border-surface-border bg-black shadow-2xl group select-none"
              >
                {/* Visual Scene Image with Ken Burns / Motion */}
                <div className="w-full h-full overflow-hidden relative">
                  <img
                    key={activeScene?.id || activeSceneIndex}
                    src={activeScene?.mediaUrl || "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop"}
                    alt={`Cena ${activeSceneIndex + 1}`}
                    style={getMotionTransformStyle()}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                </div>

                {/* Top Overlay Badge: Scene Number & Camera Effect */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono font-bold text-white border border-white/10">
                      Cena 0{activeSceneIndex + 1} de {timeline.length}
                    </span>
                    <span className="bg-brand-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-mono text-brand-300 border border-brand-500/30">
                      {MOTION_EFFECT_LABELS[activeScene?.motionEffect] || "Ken Burns"}
                    </span>
                  </div>

                  <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-400 border border-emerald-500/20 font-bold">
                    60 FPS 1080p
                  </span>
                </div>

                {/* Subtitles Overlay (Dark Channel Word-by-Word Highlight) */}
                <div className="absolute bottom-14 left-0 right-0 px-6 sm:px-12 text-center pointer-events-none">
                  <div className="inline-block bg-black/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15 shadow-2xl max-w-2xl mx-auto">
                    <p className="text-white text-sm sm:text-base md:text-lg font-black tracking-wide leading-relaxed">
                      {words.map((word, wIdx) => {
                        const isCurrentWord = isPlaying && wIdx === activeWordIndex;
                        const isPastWord = wIdx < activeWordIndex;
                        return (
                          <span
                            key={wIdx}
                            className={`inline-block mx-1 transition-all duration-150 ${isCurrentWord
                                ? "text-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] font-black"
                                : isPastWord
                                  ? "text-slate-100"
                                  : "text-slate-400 opacity-80"
                              }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>

                {/* Central Click-to-Play/Pause Overlay */}
                <div
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white ml-1" />}
                  </div>
                </div>

                {/* Bottom Interactive Controls & Timeline Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2">

                  {/* Timeline Scrubber with Scene Boundary Markers */}
                  <div
                    ref={timelineBarRef}
                    onClick={handleSeek}
                    className="relative h-2 hover:h-3 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all overflow-hidden"
                  >
                    {/* Progress Bar Fill */}
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-400 transition-[width] duration-75"
                      style={{ width: `${(currentTime / Math.max(1, totalDuration)) * 100}%` }}
                    />

                    {/* Scene Divider Ticks */}
                    {timeline.map((t, idx) => {
                      if (idx === 0) return null;
                      const percent = (t.startTime / Math.max(1, totalDuration)) * 100;
                      return (
                        <div
                          key={idx}
                          className="absolute top-0 bottom-0 w-0.5 bg-black/70 pointer-events-none"
                          style={{ left: `${percent}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Player Buttons Row */}
                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                        title={isPlaying ? "Pausar" : "Reproduzir"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>

                      {/* Prev Scene */}
                      <button
                        onClick={handlePrevScene}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Cena Anterior"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      {/* Next Scene */}
                      <button
                        onClick={handleNextScene}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Próxima Cena"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      {/* Restart */}
                      <button
                        onClick={() => setCurrentTime(0)}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Reiniciar Vídeo"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Timecode */}
                      <span className="font-mono text-xs text-slate-200 ml-1">
                        <strong className="text-brand-300">{formatTimecode(currentTime)}</strong> / {formatTimecode(totalDuration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Audio Mute/Unmute */}
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                        title={isMuted ? "Ativar Áudio Neural" : "Silenciar"}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        <span className="text-[10px] font-mono hidden sm:inline">
                          {isMuted ? "Mudo" : "Voz Ativa"}
                        </span>
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={handleToggleFullscreen}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Tela Cheia"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons under Player */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#131822] border border-surface-border">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="font-mono text-brand-300 font-bold">{formatTimecode(totalDuration)}</span>
                  <span>•</span>
                  <span>Áudio Estéreo 320kbps</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">1080p MP4 Pronto</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const srtContent = timeline
                        .map((s, idx) => {
                          const formatTime = (sec: number) => {
                            const mm = String(Math.floor(sec / 60)).padStart(2, "0");
                            const ss = String(Math.floor(sec % 60)).padStart(2, "0");
                            const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, "0");
                            return `00:${mm}:${ss},${ms}`;
                          };
                          return `${idx + 1}\n${formatTime(s.startTime)} --> ${formatTime(s.endTime)}\n${s.narrationText}\n`;
                        })
                        .join("\n");
                      const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `loopx-${(topicTitle || "legendas").replace(/[^a-zA-Z0-9_-]/g, "_")}.srt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Baixar .SRT</span>
                  </button>

                  <button
                    onClick={handleDownloadMp4}
                    disabled={isDownloadingMp4}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloadingMp4 ? "Baixando 1080p..." : "Baixar Arquivo MP4"}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("YOUTUBE")}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all hover:scale-105"
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
                      disabled={isSubmittingYouTube}
                      className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.01]"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>{isSubmittingYouTube ? "Enviando ao YouTube..." : "Confirmar Envio em 1 Clique"}</span>
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
