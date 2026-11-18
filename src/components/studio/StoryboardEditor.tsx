"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Film, 
  Sparkles, 
  Camera, 
  RefreshCw, 
  Play, 
  Download, 
  Youtube, 
  Check, 
  Layers, 
  Clock, 
  Volume2, 
  ArrowRight,
  Edit3,
  Image as ImageIcon,
  FileText,
  Search,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { SceneItem, MotionEffect } from "@/lib/types";

interface StoryboardEditorProps {
  scenes: SceneItem[];
  onUpdateScene: (sceneId: string, updatedFields: Partial<SceneItem>) => void;
  onOpenPreviewModal: () => void;
  onOpenYouTubePublishModal: () => void;
  topicTitle: string;
  onNewProject?: () => void;
}

const MOTION_EFFECT_LABELS: Record<MotionEffect, string> = {
  KEN_BURNS_ZOOM_IN: "Ken Burns (Zoom In Lento)",
  KEN_BURNS_ZOOM_OUT: "Ken Burns (Zoom Out Lento)",
  KEN_BURNS_PAN_LEFT: "Panorâmica para Esquerda",
  KEN_BURNS_PAN_RIGHT: "Panorâmica para Direita",
  PARALLAX_25D: "Parallax 2.5D com Profundidade",
  STATIC: "Estático",
};

const SAMPLE_MEDIA_LIBRARY = [
  "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579965342575-16428a7c8881?q=80&w=1200&auto=format&fit=crop",
];

export default function StoryboardEditor({
  scenes,
  onUpdateScene,
  onOpenPreviewModal,
  onOpenYouTubePublishModal,
  topicTitle,
  onNewProject,
}: StoryboardEditorProps) {
  const [activeMediaModalSceneId, setActiveMediaModalSceneId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"AI" | "STOCK">("AI");
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [generatingAiImageSceneId, setGeneratingAiImageSceneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchingMedia, setSearchingMedia] = useState(false);
  const [curatedResults, setCuratedResults] = useState<string[]>(SAMPLE_MEDIA_LIBRARY);
  const [playingAudioSceneId, setPlayingAudioSceneId] = useState<string | null>(null);
  const [isExportingSrt, setIsExportingSrt] = useState(false);
  const [isDownloadingMp4, setIsDownloadingMp4] = useState(false);
  const [mounted, setMounted] = useState(false);

  const totalDurationSeconds = React.useMemo(() => {
    return scenes.reduce((acc, s) => acc + (Number(s.durationSeconds) || 7), 0);
  }, [scenes]);

  const totalWords = React.useMemo(() => {
    return scenes.reduce((acc, s) => {
      const w = (s.narrationText || "").split(/\s+/).filter(Boolean).length;
      return acc + w;
    }, 0);
  }, [scenes]);

  const formatDurationDisplay = (sec: number) => {
    const mm = Math.floor(sec / 60);
    const ss = Math.floor(sec % 60);
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Download do arquivo .SRT real
  const handleDownloadSrt = async () => {
    try {
      setIsExportingSrt(true);
      const res = await fetch("/api/pipeline/subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes }),
      });
      const data = await res.json();
      if (data.success && data.srt) {
        const blob = new Blob([data.srt], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `loopx-legendas-${Date.now()}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Erro ao exportar SRT:", e);
    } finally {
      setIsExportingSrt(false);
    }
  };

  // Geração de imagem inédita por IA (Flux)
  const handleGenerateAiImageForScene = async (sceneId: string, customPrompt?: string) => {
    const targetScene = scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    try {
      setGeneratingAiImageSceneId(sceneId);
      const res = await fetch("/api/pipeline/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicTitle || "Documentário Dark",
          keywords: targetScene.keywords,
          narrationText: targetScene.narrationText,
          customPrompt,
          sceneIndex: targetScene.sceneOrder - 1,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        onUpdateScene(sceneId, { mediaUrl: data.imageUrl });
      }
    } catch (e) {
      console.error("Erro ao gerar imagem por IA:", e);
    } finally {
      setGeneratingAiImageSceneId(null);
    }
  };

  // Buscar mídias curadas via API Pexels / Unsplash / LoopX Vault
  const handleSearchCuratedMedia = async (query: string) => {
    if (!query.trim()) return;
    try {
      setSearchingMedia(true);
      const res = await fetch("/api/pipeline/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: query.split(" "), perPage: 9 }),
      });
      const data = await res.json();
      if (data.success && data.items?.length > 0) {
        setCuratedResults(data.items.map((item: any) => item.url));
      }
    } catch (e) {
      console.error("Erro ao buscar mídias:", e);
    } finally {
      setSearchingMedia(false);
    }
  };

  // Ouvir narração neural da cena com TTS
  const handlePlaySceneAudio = async (sceneId: string, narration: string) => {
    if (playingAudioSceneId === sceneId) {
      setPlayingAudioSceneId(null);
      return;
    }
    setPlayingAudioSceneId(sceneId);

    try {
      const res = await fetch("/api/pipeline/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narration, voiceId: "pt-br-marcos-deep" }),
      });
      const data = await res.json();
      if (data.success && data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setPlayingAudioSceneId(null);
        audio.play().catch(() => setPlayingAudioSceneId(null));
      } else {
        setTimeout(() => setPlayingAudioSceneId(null), 3000);
      }
    } catch (e) {
      setPlayingAudioSceneId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Editor Action Header */}
      <div className="glass-surface rounded-2xl p-6 border border-surface-border mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              Etapa 3 de 3 • Storyboard & Exportação
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white line-clamp-1">
            {topicTitle || "Roteiro & Storyboard de Cenas"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Alterne qualquer imagem/vídeo, ouça a narração neural ou exporte as legendas sincronizadas palavra por palavra.
          </p>
        </div>

        {/* Global Actions: Preview, Download SRT, Download MP4, YouTube */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenPreviewModal}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-white text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Assistir Prévia</span>
          </button>

          <button
            onClick={handleDownloadSrt}
            disabled={isExportingSrt}
            className="px-3.5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:text-brand-300"
          >
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            <span>{isExportingSrt ? "Gerando .SRT..." : "Baixar .SRT"}</span>
          </button>

          <button
            onClick={handleDownloadMp4}
            disabled={isDownloadingMp4}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingMp4 ? "Baixando 1080p..." : "Baixar MP4 1080p"}</span>
          </button>

          <button
            onClick={onOpenYouTubePublishModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Youtube className="w-4 h-4" />
            <span>Publicar no YouTube</span>
          </button>

          {onNewProject && (
            <button
              onClick={onNewProject}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Projeto</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Creation Metrics Overview */}
      <div className="glass-surface rounded-2xl p-5 border border-surface-border mb-8 shadow-xl bg-gradient-to-r from-[#12161f] via-surface to-[#12161f]">
        <div className="flex items-center justify-between mb-3 border-b border-surface-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Métricas de Produção do Vídeo
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Renderização Acelerada Ativa
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#141923] p-3 rounded-xl border border-surface-border/70 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Duração Total</span>
            <span className="text-base font-black text-brand-300 font-mono mt-0.5">
              {formatDurationDisplay(totalDurationSeconds)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand-400" />
              <span>{totalDurationSeconds.toFixed(0)} segundos</span>
            </span>
          </div>

          <div className="bg-[#141923] p-3 rounded-xl border border-surface-border/70 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Cenas Geradas</span>
            <span className="text-base font-black text-white font-mono mt-0.5">
              0{scenes.length} Cenas
            </span>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>Curadoria 4K</span>
            </span>
          </div>

          <div className="bg-[#141923] p-3 rounded-xl border border-surface-border/70 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Palavras Narradas</span>
            <span className="text-base font-black text-amber-300 font-mono mt-0.5">
              {totalWords} palavras
            </span>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Roteiro Sincronizado</span>
            </span>
          </div>

          <div className="bg-[#141923] p-3 rounded-xl border border-surface-border/70 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Resolução & Taxa</span>
            <span className="text-base font-black text-white font-mono mt-0.5">
              1080p 60fps
            </span>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Film className="w-3 h-3 text-blue-400" />
              <span>16:9 Full HD</span>
            </span>
          </div>

          <div className="bg-[#141923] p-3 rounded-xl border border-surface-border/70 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Mixagem & Voz</span>
            <span className="text-base font-black text-purple-300 font-mono mt-0.5">
              Neural 320k
            </span>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span>Ducking Automático</span>
            </span>
          </div>

          <div className="bg-[#141923] p-3 rounded-xl border border-surface-border/70 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CTR & Retenção</span>
            <span className="text-base font-black text-emerald-400 font-mono mt-0.5">
              84.2% Est.
            </span>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Gancho Magnético</span>
            </span>
          </div>
        </div>
      </div>

      {/* Storyboard Scene Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="glass-surface rounded-2xl p-5 border border-surface-border hover:border-brand-500/40 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Scene Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-brand-300 bg-brand-500/10 px-2.5 py-0.5 rounded-md border border-brand-500/20">
                  Cena 0{scene.sceneOrder} • {scene.durationSeconds.toFixed(1)}s
                </span>

                <div className="flex items-center gap-2">
                  {/* TTS Voice preview button */}
                  <button
                    onClick={() => handlePlaySceneAudio(scene.id, scene.narrationText)}
                    className="p-1.5 rounded-lg bg-[#141923] border border-surface-border text-slate-300 hover:text-white transition-colors"
                    title="Ouvir narração neural desta cena"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingAudioSceneId === scene.id ? "text-brand-400 animate-pulse" : ""}`} />
                  </button>

                  {/* Quick AI Image generation button */}
                  <button
                    onClick={() => handleGenerateAiImageForScene(scene.id)}
                    disabled={generatingAiImageSceneId === scene.id}
                    className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1 bg-[#1e152e] hover:bg-[#2a1c42] px-2.5 py-1 rounded-lg border border-purple-500/30 transition-colors disabled:opacity-50"
                    title="Pintar nova imagem inédita com IA (Flux) para esta cena"
                  >
                    {generatingAiImageSceneId === scene.id ? (
                      <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    )}
                    <span>Gerar IA</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveMediaModalSceneId(scene.id);
                      setModalTab("AI");
                      setAiPromptInput(scene.keywords?.join(", ") || "");
                      setCuratedResults(SAMPLE_MEDIA_LIBRARY);
                    }}
                    className="text-xs font-semibold text-brand-300 hover:text-white flex items-center gap-1 bg-[#141923] px-2.5 py-1 rounded-lg border border-surface-border transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Trocar Mídia</span>
                  </button>
                </div>
              </div>

              {/* Media Thumbnail Container with Ken Burns */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-surface-border bg-black mb-4 group">
                <img
                  src={scene.mediaUrl}
                  alt={`Cena ${scene.sceneOrder}`}
                  className="w-full h-full object-cover ken-burns-active"
                />

                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white border border-white/10 font-mono">
                  {MOTION_EFFECT_LABELS[scene.motionEffect]}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleGenerateAiImageForScene(scene.id)}
                    disabled={generatingAiImageSceneId === scene.id}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {generatingAiImageSceneId === scene.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Gerar com IA</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveMediaModalSceneId(scene.id);
                      setModalTab("STOCK");
                      setCuratedResults(SAMPLE_MEDIA_LIBRARY);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#141923] border border-surface-border text-white text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-surface"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Acervo 4K</span>
                  </button>
                </div>
              </div>

              {/* Narration Script Textarea */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                  Texto da Narração:
                </label>
                <textarea
                  rows={3}
                  value={scene.narrationText}
                  onChange={(e) =>
                    onUpdateScene(scene.id, { narrationText: e.target.value })
                  }
                  className="w-full bg-[#141923] border border-surface-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Motion Effect Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                  Efeito de Câmera Cinematográfico:
                </label>
                <select
                  value={scene.motionEffect}
                  onChange={(e) =>
                    onUpdateScene(scene.id, { motionEffect: e.target.value as MotionEffect })
                  }
                  className="w-full bg-[#141923] border border-surface-border rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="KEN_BURNS_ZOOM_IN">Ken Burns (Zoom In Lento)</option>
                  <option value="KEN_BURNS_ZOOM_OUT">Ken Burns (Zoom Out Lento)</option>
                  <option value="KEN_BURNS_PAN_LEFT">Panorâmica para Esquerda</option>
                  <option value="KEN_BURNS_PAN_RIGHT">Panorâmica para Direita</option>
                  <option value="PARALLAX_25D">Parallax 2.5D com Profundidade</option>
                  <option value="STATIC">Estático</option>
                </select>
              </div>
            </div>

            {/* Subtitles alignment tags */}
            <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <Check className="w-3 h-3" />
                Legenda Sincronizada ({scene.subtitles?.length || 0} palavras)
              </span>
              <span className="font-mono text-slate-400">
                {scene.keywords.slice(0, 2).join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Media Swapper Modal with Search and AI Image Generator */}
      {activeMediaModalSceneId && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex min-h-screen items-center justify-center">
          <div className="relative bg-[#1a202c] border border-surface-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Central de Imagens da Cena</h4>
                  <p className="text-[11px] text-slate-400">Gere uma imagem inédita com IA ou selecione do acervo 4K</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMediaModalSceneId(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            {/* Modal Tabs: IA Generativa vs Acervo 4K */}
            <div className="flex gap-2 p-1 bg-[#12161f] rounded-xl border border-surface-border mb-4">
              <button
                type="button"
                onClick={() => setModalTab("AI")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modalTab === "AI"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>IA Generativa (Flux 4K)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("STOCK")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  modalTab === "STOCK"
                    ? "bg-brand-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Acervo Fotográfico 4K (Unsplash)</span>
              </button>
            </div>

            {modalTab === "AI" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Prompt Visual para a IA (Crie ou Edite):
                  </label>
                  <textarea
                    rows={3}
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="Ex: Sala de controle de radar militar deserta na tempestade, luzes verdes volumétricas, cinematográfico 16:9 8k..."
                    className="w-full bg-[#12161f] border border-surface-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dica: A IA Flux gera imagens foto-realistas inéditas em proporção cinematográfica 16:9 (1280x720) sem custo.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={generatingAiImageSceneId === activeMediaModalSceneId}
                    onClick={async () => {
                      await handleGenerateAiImageForScene(activeMediaModalSceneId, aiPromptInput);
                      setActiveMediaModalSceneId(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {generatingAiImageSceneId === activeMediaModalSceneId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Pintar Imagem com IA e Aplicar à Cena</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Live Search Input */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchCuratedMedia(searchQuery)}
                      placeholder="Buscar acervo (ex: radar militar, oceano tempestade, espaço)..."
                      className="w-full bg-[#12161f] border border-surface-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchCuratedMedia(searchQuery)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    {searchingMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Buscar</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 max-h-72 overflow-y-auto pr-1">
                  {curatedResults.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onUpdateScene(activeMediaModalSceneId, { mediaUrl: url });
                        setActiveMediaModalSceneId(null);
                      }}
                      className="relative aspect-video rounded-xl overflow-hidden border border-surface-border hover:border-brand-500 cursor-pointer group shadow"
                    >
                      <img src={url} alt="Mídia de exemplo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Selecionar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-right mt-4 pt-3 border-t border-surface-border">
              <button
                onClick={() => setActiveMediaModalSceneId(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
