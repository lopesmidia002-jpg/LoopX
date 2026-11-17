"use client";

import React, { useState } from "react";
import { Play, X, Clock, Eye, Sparkles } from "lucide-react";
import { SHOWCASE_VIDEOS } from "@/lib/constants";

export default function Showcase() {
  const [selectedVideo, setSelectedVideo] = useState<typeof SHOWCASE_VIDEOS[0] | null>(null);

  return (
    <section id="mostruario" className="py-24 relative bg-[#131822] border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Showcase de Canais Dark
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Produções criadas 100% pelo LoopX
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Veja exemplos reais de documentários e listas Top 10 que acumulam milhões de visualizações e monetização máxima no YouTube.
          </p>
        </div>

        {/* 3x2 Grid of 16:9 Thumbnails */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {SHOWCASE_VIDEOS.map((video, idx) => (
            <div
              key={idx}
              className="group glass-surface rounded-2xl overflow-hidden border border-surface-border hover:border-brand-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              {/* Thumbnail Container 16:9 with Ken Burns hover */}
              <div className="relative aspect-video overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-13 h-13 rounded-full bg-brand-500/90 text-white p-3.5 shadow-xl shadow-brand-500/40 transform group-hover:scale-110 transition-transform flex items-center justify-center">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-brand-400" />
                  <span>{video.duration}</span>
                </div>

                {/* Category Pill */}
                <div className="absolute top-2.5 left-2.5 bg-brand-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                  {video.category}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 mb-2">
                    {video.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {video.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    {video.views}
                  </span>
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="text-brand-300 hover:text-white font-semibold underline transition-colors"
                  >
                    Ver prévia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Preview Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1a202c] border border-surface-border rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-fadeIn">
              
              {/* Modal Header */}
              <div className="p-4 bg-[#141923] border-b border-surface-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-brand-300 uppercase">
                    {selectedVideo.category} • {selectedVideo.duration}
                  </span>
                  <h4 className="text-base font-bold text-white truncate max-w-lg">
                    {selectedVideo.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Box */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover ken-burns-active"
                />
                
                {/* Word Subtitles simulation */}
                <div className="absolute bottom-6 left-0 right-0 px-8 text-center">
                  <span className="bg-black/85 backdrop-blur-md text-white text-base sm:text-xl font-black px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                    "O que a ciência escondeu durante mais de 70 anos..."
                  </span>
                </div>

                <div className="absolute top-4 left-4 bg-brand-500/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Renderizado com Remotion 1080p 60fps</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#161b24] flex items-center justify-between text-xs text-slate-300">
                <span>Roteiro, narração, efeitos e mídias gerados automaticamente em 9 minutos.</span>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
