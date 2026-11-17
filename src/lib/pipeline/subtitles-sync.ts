/**
 * Sincronização de Legendas Palavra por Palavra e Exportação .SRT
 * Etapa 5 do Pipeline do LoopX
 */

import { SceneItem } from "../types";

export interface WordTimestamp {
  word: string;
  start: number; // segundos
  end: number;   // segundos
}

/**
 * Sincroniza palavras proporcionalmente ao tamanho dos caracteres e pausas
 */
export function syncSubtitles(narrationText: string, audioDurationSeconds: number): WordTimestamp[] {
  const words = narrationText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  // Calcula peso relativo por caractere (palavras longas duram mais que preposições)
  const weights = words.map((w) => {
    let weight = w.length;
    if (w.includes(",") || w.includes(";") || w.includes("...")) weight += 2; // Pausa sutil
    if (w.includes(".") || w.includes("!") || w.includes("?")) weight += 4; // Pausa de fim de frase
    return Math.max(1, weight);
  });

  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  let currentTime = 0.0;

  return words.map((word, index) => {
    const fraction = weights[index] / totalWeight;
    const duration = fraction * audioDurationSeconds;
    const start = parseFloat(currentTime.toFixed(2));
    const end = parseFloat((currentTime + duration).toFixed(2));
    currentTime += duration;

    return {
      word,
      start,
      end,
    };
  });
}

/**
 * Converte as cenas do projeto em um arquivo no formato padrão .SRT (SubRip)
 */
export function generateSrt(scenes: SceneItem[]): string {
  let srtContent = "";
  let subtitleIndex = 1;
  let accumulatedTime = 0.0;

  for (const scene of scenes) {
    const startTime = accumulatedTime;
    const endTime = accumulatedTime + scene.durationSeconds;

    srtContent += `${subtitleIndex}\n`;
    srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
    srtContent += `${scene.narrationText.trim()}\n\n`;

    accumulatedTime = endTime;
    subtitleIndex++;
  }

  return srtContent.trim();
}

/**
 * Formata segundos no formato HH:MM:SS,mmm exigido pelo padrão .SRT
 */
export function formatSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(milliseconds).padStart(3, "0");

  return `${hh}:${mm}:${ss},${mmm}`;
}
