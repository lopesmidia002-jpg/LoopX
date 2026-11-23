/**
 * Orquestrador de Renderização Final em MP4 (1080p 16:9 60 FPS)
 * Etapa 8 do Pipeline do LoopX
 * Suporte a vídeo multi-pistas: clipes MP4, Ken Burns 60 FPS, Audio Ducking, SFX e Legendas Hardcoded
 */

import { SceneItem } from "../types";
import { SOUNDTRACK_PRESETS } from "./audio-mixer";
import { executeFFmpegRender, buildMultiTrackFFmpegArgs, RenderJobResult } from "./render-executor";

export interface RenderPipelineResult {
  videoUrl: string;
  resolution: "1080p" | "720p" | "4k";
  durationSeconds: number;
  fileSizeBytes: number;
  ffmpegCommand: string;
}

export { executeFFmpegRender, buildMultiTrackFFmpegArgs };
export type { RenderJobResult };

/**
 * Constrói o comando FFmpeg completo e otimizado para renderização 1080p 60fps
 * com suporte híbrido a clipes MP4 e imagens Ken Burns
 */
export function buildFFmpegRenderCommand(params: {
  scenes: SceneItem[];
  outputFilePath: string;
  soundtrackUrl?: string;
  srtPath?: string;
}): string {
  const { scenes, outputFilePath, soundtrackUrl = SOUNDTRACK_PRESETS.DARK_MYSTERY.url, srtPath } = params;
  const args = buildMultiTrackFFmpegArgs({
    scenes,
    outputFilePath,
    srtPath,
    bgmTrackUrl: soundtrackUrl,
  });

  return ["ffmpeg", ...args.map((a) => (a.includes(" ") || a.includes(";") || a.includes(":") ? `"${a}"` : a))].join(" ");
}
