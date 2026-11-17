"use client";

import React, { useState } from "react";
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
  Image as ImageIcon
} from "lucide-react";
import { SceneItem, MotionEffect } from "@/lib/types";

interface StoryboardEditorProps {
  scenes: SceneItem[];
  onUpdateScene: (sceneId: string, updatedFields: Partial<SceneItem>) => void;
  onOpenPreviewModal: () => void;
  onOpenYouTubePublishModal: () => void;
  topicTitle: string;
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
}: StoryboardEditorProps) {
  const [activeMediaModalSceneId, setActiveMediaModalSceneId] = useState<string | null>(null);

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
            Alterne qualquer imagem/vídeo ou refine o texto da narração sem precisar re-renderizar todo o vídeo.
          </p>
        </div>

        {/* Global Actions: Preview, Download, YouTube */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenPreviewModal}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-white text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Assistir Prévia</span>
          </button>

          <button
            onClick={onOpenPreviewModal}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar MP4 1080p</span>
          </button>

          <button
            onClick={onOpenYouTubePublishModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          >
            <Youtube className="w-4 h-4" />
            <span>Publicar no YouTube</span>
          </button>
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

                <button
                  onClick={() => setActiveMediaModalSceneId(scene.id)}
                  className="text-xs font-semibold text-brand-300 hover:text-white flex items-center gap-1 bg-[#141923] px-2.5 py-1 rounded-lg border border-surface-border transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Trocar Mídia</span>
                </button>
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

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setActiveMediaModalSceneId(scene.id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Escolher Outra Foto/Vídeo</span>
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
                Legenda Palavra por Palavra Sincronizada
              </span>
              <span className="font-mono text-slate-400">
                {scene.keywords.slice(0, 2).join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Media Swapper Modal */}
      {activeMediaModalSceneId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1a202c] border border-surface-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-400" />
                <span>Escolher Nova Mídia para a Cena</span>
              </h4>
              <button
                onClick={() => setActiveMediaModalSceneId(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Selecione uma das mídias 4K curadas automaticamente para esta cena:
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {SAMPLE_MEDIA_LIBRARY.map((url, idx) => (
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

            <div className="text-right">
              <button
                onClick={() => setActiveMediaModalSceneId(null)}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
