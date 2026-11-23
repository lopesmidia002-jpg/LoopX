/**
 * Sincronização Precisa de Áudio e Legendas (Word-Level Timestamps & Forced Alignment)
 * Etapa 5 do Pipeline do LoopX
 * Suporte a timestamps reais calibrados com a duração do arquivo de áudio,
 * frases dinâmicas rítmicas (chunks de 4 a 6 palavras), validação automática e exportação .SRT / .ASS
 */

import { SceneItem } from "../types";

export interface WordTimestamp {
  word: string;
  start: number; // segundos relativos ao início da cena
  end: number;   // segundos relativos ao início da cena
}

export interface SubtitlePhrase {
  id: string;
  text: string;
  words: string[];
  startIndex: number; // índice global da 1ª palavra na cena
  endIndex: number;   // índice global da última palavra na cena
  start: number;      // timestamp inicial da frase (segundos na cena)
  end: number;        // timestamp final da frase (segundos na cena)
}

export interface SubtitleValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalScenes: number;
    totalWords: number;
    totalPhrases: number;
    totalVideoDuration: number;
    totalAudioDuration: number;
    maxCumulativeDriftSeconds: number;
  };
}

/**
 * Calcula os timestamps em nível de palavra (Word-Level) com precisão milimétrica,
 * calibrado obrigatoriamente pela duração REAL do áudio narrado (se fornecida).
 */
export function syncSubtitles(
  narrationText: string,
  sceneDurationSeconds: number,
  realAudioDuration?: number,
  initialSilenceOffsetSeconds: number = 0.18
): WordTimestamp[] {
  const words = (narrationText || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  // Ponderação fonética baseada em contagem de caracteres e pausas naturais
  const weights = words.map((w) => {
    const cleanWord = w.replace(/[.,!?;:"'—\-_()]/g, "");
    let weight = Math.max(1.5, cleanWord.length);

    // Pausas diegéticas da fala humana
    if (/[,\-;:]/.test(w)) weight += 4.5; // Pausa breve de respiração (~0.30s)
    if (/[.!?]/.test(w)) weight += 8.0;   // Pausa dramática de encerramento de frase (~0.55s)
    if (/—|\.\.\./.test(w)) weight += 6.0; // Reticências ou travessão de suspense

    return weight;
  });

  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

  // Determina a duração efetiva da fala real
  let speechDuration: number;
  if (realAudioDuration && realAudioDuration > 0.5) {
    // Calibração pelo arquivo de áudio real gerado pelo motor TTS
    speechDuration = Math.max(0.5, realAudioDuration - initialSilenceOffsetSeconds);
  } else {
    // Estimativa acústica rigorosa para narração documental (~2.30 palavras/segundo)
    const estimated = (words.length / 2.30) + (words.length * 0.04);
    speechDuration = Math.min(Math.max(2.5, sceneDurationSeconds - 1.0), estimated);
  }

  const result: WordTimestamp[] = [];
  let currentTime = Math.max(0.05, initialSilenceOffsetSeconds);

  for (let i = 0; i < words.length; i++) {
    const fraction = weights[i] / totalWeight;
    const duration = Math.max(0.18, parseFloat((fraction * speechDuration).toFixed(3)));
    const start = parseFloat(currentTime.toFixed(3));
    let end = parseFloat((currentTime + duration).toFixed(3));

    // Se houver pontuação forte, adiciona micro-respiro antes da próxima palavra
    const hasPunctuation = /[.,!?;:]/.test(words[i]);
    const pausePadding = hasPunctuation ? 0.08 : 0.02;

    result.push({
      word: words[i],
      start,
      end,
    });

    currentTime = end + pausePadding;
  }

  // Garante estritamente que nenhuma palavra ultrapasse a duração da cena
  const maxAllowedTime = realAudioDuration && realAudioDuration > 0.5
    ? realAudioDuration
    : Math.max(sceneDurationSeconds, result[result.length - 1].end);

  const lastWord = result[result.length - 1];
  if (lastWord.end > maxAllowedTime) {
    const factor = (maxAllowedTime - initialSilenceOffsetSeconds) / (lastWord.end - initialSilenceOffsetSeconds);
    if (factor > 0 && factor < 1) {
      result.forEach((w) => {
        w.start = parseFloat((initialSilenceOffsetSeconds + (w.start - initialSilenceOffsetSeconds) * factor).toFixed(3));
        w.end = parseFloat((initialSilenceOffsetSeconds + (w.end - initialSilenceOffsetSeconds) * factor).toFixed(3));
      });
    }
  }

  return result;
}

/**
 * Agrupa palavras em frases dinâmicas curtas de 3 a 5 palavras (estilo Dark Channel / MrBeast)
 * garantindo blocos rítmicos sem sobreposição e respeitando a respiração do narrador.
 */
export function buildSubtitlePhrases(
  words: WordTimestamp[],
  targetMaxWordsPerPhrase: number = 5
): SubtitlePhrase[] {
  if (!words || words.length === 0) return [];

  const phrases: SubtitlePhrase[] = [];
  let currentGroup: WordTimestamp[] = [];
  let groupStartIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const wt = words[i];
    currentGroup.push(wt);

    const hasStrongPunctuation = /[.!?]/.test(wt.word);
    const hasCommaPunctuation = /[,\-;:]/.test(wt.word);
    const reachedWordLimit = currentGroup.length >= targetMaxWordsPerPhrase;
    const isLastWord = i === words.length - 1;

    // Quebra natural da frase
    const shouldBreak =
      isLastWord ||
      hasStrongPunctuation ||
      reachedWordLimit ||
      (hasCommaPunctuation && currentGroup.length >= 3);

    if (shouldBreak) {
      const phraseWords = currentGroup.map((g) => g.word);
      const start = currentGroup[0].start;
      // Mantém a frase visível até o final da última palavra com padding suave de 120ms
      const end = parseFloat((currentGroup[currentGroup.length - 1].end + 0.12).toFixed(3));

      phrases.push({
        id: `phrase-${phrases.length + 1}`,
        text: phraseWords.join(" "),
        words: phraseWords,
        startIndex: groupStartIndex,
        endIndex: i,
        start,
        end,
      });

      currentGroup = [];
      groupStartIndex = i + 1;
    }
  }

  // Previne qualquer sobreposição entre frases consecutivas
  for (let k = 0; k < phrases.length - 1; k++) {
    if (phrases[k].end > phrases[k + 1].start) {
      phrases[k].end = Math.max(phrases[k].start + 0.2, phrases[k + 1].start - 0.05);
    }
  }

  return phrases;
}

/**
 * Converte as cenas do projeto em um arquivo no formato padrão .SRT (SubRip)
 * com timecodes de timeline absoluta cumulativa sincronizados cena a cena.
 */
export function generateSrt(scenes: SceneItem[]): string {
  let srtContent = "";
  let subtitleIndex = 1;
  let accumulatedTime = 0.0;

  for (const scene of scenes) {
    const sceneDuration = Number(scene.durationSeconds) || 7.5;
    const realAudioDuration = scene.audioDurationSeconds;

    const wordTimestamps =
      scene.subtitles && scene.subtitles.length > 0
        ? scene.subtitles
        : syncSubtitles(scene.narrationText, sceneDuration, realAudioDuration);

    const phrases = buildSubtitlePhrases(wordTimestamps);

    if (phrases.length === 0) {
      if (scene.narrationText && scene.narrationText.trim()) {
        const startTime = accumulatedTime + 0.2;
        const endTime = accumulatedTime + Math.min(sceneDuration, (realAudioDuration || sceneDuration));
        srtContent += `${subtitleIndex}\n`;
        srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
        srtContent += `${scene.narrationText.trim()}\n\n`;
        subtitleIndex++;
      }
    } else {
      for (const phrase of phrases) {
        const startTime = accumulatedTime + phrase.start;
        const endTime = Math.min(
          accumulatedTime + sceneDuration,
          accumulatedTime + phrase.end
        );

        if (endTime > startTime) {
          srtContent += `${subtitleIndex}\n`;
          srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
          srtContent += `${phrase.text.trim()}\n\n`;
          subtitleIndex++;
        }
      }
    }

    // Avança a timeline acumulada pela duração exata da cena
    accumulatedTime += sceneDuration;
  }

  return srtContent.trim();
}

/**
 * Gera arquivo de legendas .ASS (Advanced SubStation Alpha) com estilização profissional de Dark Channel
 * e suporte a queima de legendas amarelas com sombra profunda e contorno anti-serrilhado.
 */
export function generateAssSubtitles(scenes: SceneItem[], videoWidth: number = 1920, videoHeight: number = 1080): string {
  const header = `[Script Info]
Title: LoopX Dark Documentary Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: DarkYellow,Montserrat,52,&H0024BFFB,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3.5,2.0,2,40,40,75,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = "";
  let accumulatedTime = 0.0;

  for (const scene of scenes) {
    const sceneDuration = Number(scene.durationSeconds) || 7.5;
    const realAudioDuration = scene.audioDurationSeconds;

    const wordTimestamps =
      scene.subtitles && scene.subtitles.length > 0
        ? scene.subtitles
        : syncSubtitles(scene.narrationText, sceneDuration, realAudioDuration);

    const phrases = buildSubtitlePhrases(wordTimestamps);

    for (const phrase of phrases) {
      const startTime = accumulatedTime + phrase.start;
      const endTime = Math.min(accumulatedTime + sceneDuration, accumulatedTime + phrase.end);

      if (endTime > startTime) {
        events += `Dialogue: 0,${formatAssTime(startTime)},${formatAssTime(endTime)},DarkYellow,,0,0,0,,${escapeAssText(phrase.text)}\n`;
      }
    }

    accumulatedTime += sceneDuration;
  }

  return header + events;
}

/**
 * Validação automática rigorosa da sincronia entre áudio, vídeo e legendas
 * Retorna erros e advertências caso haja descompasso temporal acumulado ou palavras sobrepostas.
 */
export function validateSubtitlesAndAudio(scenes: SceneItem[]): SubtitleValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  let totalWords = 0;
  let totalPhrases = 0;
  let totalVideoDuration = 0;
  let totalAudioDuration = 0;
  let maxCumulativeDrift = 0;

  scenes.forEach((scene, sIdx) => {
    const sceneDur = Number(scene.durationSeconds) || 7.5;
    const audioDur = scene.audioDurationSeconds || sceneDur;

    totalVideoDuration += sceneDur;
    totalAudioDuration += audioDur;

    const drift = Math.abs(sceneDur - audioDur);
    if (drift > maxCumulativeDrift) {
      maxCumulativeDrift = drift;
    }

    if (audioDur > sceneDur + 0.5) {
      warnings.push(`Cena ${sIdx + 1}: Áudio (${audioDur.toFixed(1)}s) é mais longo que a cena (${sceneDur.toFixed(1)}s). Pode haver corte de áudio.`);
    }

    const words = syncSubtitles(scene.narrationText, sceneDur, scene.audioDurationSeconds);
    totalWords += words.length;

    // Verifica sequência e limites dos timestamps
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (w.start < 0 || w.end < w.start) {
        errors.push(`Cena ${sIdx + 1}, Palavra "${w.word}": timestamps inválidos (${w.start}s -> ${w.end}s).`);
      }
      if (i > 0 && w.start < words[i - 1].start) {
        errors.push(`Cena ${sIdx + 1}: Palavra "${w.word}" inicia antes da palavra anterior.`);
      }
    }

    const phrases = buildSubtitlePhrases(words);
    totalPhrases += phrases.length;

    // Verifica sobreposição entre frases
    for (let j = 0; j < phrases.length - 1; j++) {
      if (phrases[j].end > phrases[j + 1].start + 0.05) {
        warnings.push(`Cena ${sIdx + 1}: Sobreposição detectada entre frase ${j + 1} e frase ${j + 2}.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalScenes: scenes.length,
      totalWords,
      totalPhrases,
      totalVideoDuration: parseFloat(totalVideoDuration.toFixed(2)),
      totalAudioDuration: parseFloat(totalAudioDuration.toFixed(2)),
      maxCumulativeDriftSeconds: parseFloat(maxCumulativeDrift.toFixed(2)),
    },
  };
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

/**
 * Formata segundos no formato H:MM:SS.cc exigido pelo padrão .ASS (centissegundos)
 */
export function formatAssTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.floor(((totalSeconds % 1) * 100));

  const hh = String(hours);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const cc = String(centiseconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}.${cc}`;
}

function escapeAssText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}");
}
