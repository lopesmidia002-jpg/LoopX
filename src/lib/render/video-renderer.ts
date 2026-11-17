/**
 * Orquestrador de Renderização Final em MP4 (1080p 16:9)
 * Etapa 8 do Pipeline do LoopX
 */

import { SceneItem } from "../types";
import { getFFmpegMotionFilter } from "./motion-effects";
import { buildAudioDuckingFilterGraph, SOUNDTRACK_PRESETS } from "./audio-mixer";

export interface RenderPipelineResult {
  videoUrl: string;
  resolution: "1080p" | "720p" | "4k";
  durationSeconds: number;
  fileSizeBytes: number;
  ffmpegCommand: string;
}

/**
 * Constrói o comando FFmpeg completo e otimizado para renderização 1080p 60fps
 */
export function buildFFmpegRenderCommand(params: {
  scenes: SceneItem[];
  outputFilePath: string;
  soundtrackUrl?: string;
}): string {
  const { scenes, outputFilePath, soundtrackUrl = SOUNDTRACK_PRESETS.DARK_MYSTERY.url } = params;

  // Monta as entradas de arquivo (imagens das cenas + trilha sonora)
  const inputArgs = scenes.map((s) => `-loop 1 -t ${s.durationSeconds} -i "${s.mediaUrl}"`).join(" ");
  const audioInput = `-i "${soundtrackUrl}"`;

  // Monta os filtros de movimento para cada cena
  const videoFilters = scenes
    .map((s, idx) => {
      const motion = getFFmpegMotionFilter({
        effect: s.motionEffect,
        durationSeconds: s.durationSeconds,
        fps: 30,
        width: 1920,
        height: 1080,
      });
      return `[${idx}:v]${motion},setsar=1[v${idx}]`;
    })
    .join(";");

  // Concatenação de todas as cenas animadas
  const concatInputs = scenes.map((_, idx) => `[v${idx}]`).join("");
  const concatFilter = `${concatInputs}concat=n=${scenes.length}:v=1:a=0[vout]`;

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  return [
    `ffmpeg -y`,
    inputArgs,
    audioInput,
    `-filter_complex "${videoFilters};${concatFilter}"`,
    `-map "[vout]"`,
    `-map ${scenes.length}:a`,
    `-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p`,
    `-c:a aac -b:a 192k`,
    `-t ${totalDuration}`,
    `"${outputFilePath}"`,
  ].join(" ");
}
