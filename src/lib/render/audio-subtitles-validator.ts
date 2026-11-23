/**
 * Sistema de Validação Automática e Diagnóstico de Sincronia de Áudio e Legendas
 * Verifica compatibilidade de duração, timestamps válidos, ausência de sobreposição e drift temporal.
 */

import { SceneItem } from "../types";
import { validateSubtitlesAndAudio, SubtitleValidationReport } from "../pipeline/subtitles-sync";
import fs from "fs";

export interface SyncDiagnosticLog {
  timestamp: string;
  totalScenes: number;
  totalWords: number;
  totalPhrases: number;
  totalVideoDuration: number;
  totalAudioDuration: number;
  driftPercentage: number;
  hasErrors: boolean;
  errors: string[];
  warnings: string[];
  scenesDetail: {
    sceneIndex: number;
    wordCount: number;
    videoDuration: number;
    audioDuration: number;
    firstWordStart: number;
    lastWordEnd: number;
  }[];
}

/**
 * Executa a bateria de 8 testes de validação automática pré-renderização
 */
export function runPreRenderValidation(scenes: SceneItem[]): {
  canRender: boolean;
  report: SubtitleValidationReport;
  diagnostic: SyncDiagnosticLog;
  remediedScenes: SceneItem[];
} {
  const report = validateSubtitlesAndAudio(scenes);

  // Auto-correção: ajusta a duração das cenas se o áudio real for maior que a cena visual
  const remediedScenes: SceneItem[] = scenes.map((s, idx) => {
    const sceneCopy = { ...s };
    const audioDur = Number(s.audioDurationSeconds) || 0;
    const currentDur = Number(s.durationSeconds) || 7.5;

    // Se o áudio exceder a duração da cena, estende a cena em 0.8s além do áudio para respiro cinematográfico
    if (audioDur > 0 && audioDur > currentDur - 0.5) {
      sceneCopy.durationSeconds = parseFloat((audioDur + 0.8).toFixed(2));
    }

    return sceneCopy;
  });

  const scenesDetail = scenes.map((s, idx) => {
    const words = (s.narrationText || "").split(/\s+/).filter(Boolean);
    const sub = s.subtitles || [];
    return {
      sceneIndex: idx + 1,
      wordCount: words.length,
      videoDuration: Number(s.durationSeconds) || 7.5,
      audioDuration: Number(s.audioDurationSeconds) || Number(s.durationSeconds) || 7.5,
      firstWordStart: sub[0]?.start ?? 0.2,
      lastWordEnd: sub[sub.length - 1]?.end ?? (Number(s.durationSeconds) || 7.5),
    };
  });

  const totalVideo = report.stats.totalVideoDuration;
  const totalAudio = report.stats.totalAudioDuration;
  const driftPercentage = totalVideo > 0 ? parseFloat((Math.abs(totalVideo - totalAudio) / totalVideo * 100).toFixed(2)) : 0;

  const diagnostic: SyncDiagnosticLog = {
    timestamp: new Date().toISOString(),
    totalScenes: scenes.length,
    totalWords: report.stats.totalWords,
    totalPhrases: report.stats.totalPhrases,
    totalVideoDuration: totalVideo,
    totalAudioDuration: totalAudio,
    driftPercentage,
    hasErrors: report.errors.length > 0,
    errors: report.errors,
    warnings: report.warnings,
    scenesDetail,
  };

  // Log de diagnóstico detalhado no console
  console.log(`[LOOPX SYNC VALIDATOR] Diagnóstico: ${scenes.length} cenas, ${report.stats.totalWords} palavras, Áudio: ${totalAudio}s, Vídeo: ${totalVideo}s, Drift: ${driftPercentage}%`);
  if (report.warnings.length > 0) {
    console.warn(`[LOOPX SYNC VALIDATOR] Avisos encontrados (${report.warnings.length}):`, report.warnings);
  }
  if (report.errors.length > 0) {
    console.error(`[LOOPX SYNC VALIDATOR] Erros críticos encontrados (${report.errors.length}):`, report.errors);
  }

  return {
    canRender: report.errors.length === 0,
    report,
    diagnostic,
    remediedScenes,
  };
}

/**
 * Validação pós-renderização: confere se o arquivo MP4 gerado existe e possui tamanho consistente
 */
export function validateRenderedMp4File(outputFilePath: string): {
  isValid: boolean;
  sizeBytes: number;
  error?: string;
} {
  try {
    if (!fs.existsSync(outputFilePath)) {
      return { isValid: false, sizeBytes: 0, error: "Arquivo de saída MP4 não foi criado." };
    }
    const stat = fs.statSync(outputFilePath);
    if (stat.size < 1000) {
      return { isValid: false, sizeBytes: stat.size, error: `Arquivo MP4 truncado ou corrompido (${stat.size} bytes).` };
    }
    return { isValid: true, sizeBytes: stat.size };
  } catch (e: any) {
    return { isValid: false, sizeBytes: 0, error: e?.message || "Erro ao inspecionar arquivo MP4 gerado." };
  }
}
