/**
 * Sincronização de Legendas Palavra por Palavra e Exportação .SRT
 * Etapa 5 do Pipeline do LoopX
 * Suporte a frases dinâmicas (chunks de 4 a 6 palavras) e sincronia com cadência neural
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

/**
 * Sincroniza palavras proporcionalmente ao tamanho dos caracteres e pausas naturais de pontuação
 * respeitando a cadência real de um locutor de documentário (~135 a 150 palavras por minuto).
 */
export function syncSubtitles(narrationText: string, sceneDurationSeconds: number): WordTimestamp[] {
  const words = (narrationText || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  // Pondera peso fonético por caractere e pausas de pontuação
  const weights = words.map((w) => {
    let weight = Math.max(2, w.replace(/[.,!?;:"'—\-_]/g, "").length);
    if (/[,\-;:]/.test(w)) weight += 4; // Pausa natural de respiração (~0.3s)
    if (/[.!?]/.test(w)) weight += 7; // Pausa dramática de fim de oração (~0.55s)
    return weight;
  });

  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

  // Cadência natural: locutores falam ~2.3 a 2.5 palavras por segundo.
  // A fala real deve ocupar entre 75% e 92% da duração da cena, permitindo 2 a 5s de respiro.
  const estimatedSpeechDuration = Math.max(4.0, (words.length / 2.35) + (words.length * 0.05));
  const effectiveDuration = Math.min(
    Math.max(3.5, sceneDurationSeconds - 1.2),
    estimatedSpeechDuration
  );

  let currentTime = 0.25; // Pequeno delay de 250ms antes do início da locução

  return words.map((word, index) => {
    const fraction = weights[index] / totalWeight;
    const duration = fraction * effectiveDuration;
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
 * Agrupa palavras em frases dinâmicas curtas de 3 a 6 palavras (estilo Dark Channel / MrBeast)
 * quebrando em pontuações para leitura confortável e sincronia visual perfeita.
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

    // Quebra em pontuação se já tiver ao menos 3 palavras, ou ao atingir o limite
    const shouldBreak =
      isLastWord ||
      hasStrongPunctuation ||
      reachedWordLimit ||
      (hasCommaPunctuation && currentGroup.length >= 3);

    if (shouldBreak) {
      const phraseWords = currentGroup.map((g) => g.word);
      const start = currentGroup[0].start;
      // Mantém a legenda visível por 200ms após a última palavra para transição suave
      const end = parseFloat((currentGroup[currentGroup.length - 1].end + 0.18).toFixed(2));

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

  return phrases;
}

/**
 * Converte as cenas do projeto em um arquivo no formato padrão .SRT (SubRip)
 * com quebra em frases rítmicas curtas de 4 a 6 palavras em vez de parágrafos inteiros.
 */
export function generateSrt(scenes: SceneItem[]): string {
  let srtContent = "";
  let subtitleIndex = 1;
  let accumulatedTime = 0.0;

  for (const scene of scenes) {
    const sceneDuration = Number(scene.durationSeconds) || 7.5;
    const wordTimestamps =
      scene.subtitles && scene.subtitles.length > 0
        ? scene.subtitles
        : syncSubtitles(scene.narrationText, sceneDuration);

    const phrases = buildSubtitlePhrases(wordTimestamps);

    if (phrases.length === 0) {
      // Fallback para cena sem texto
      const startTime = accumulatedTime;
      const endTime = accumulatedTime + sceneDuration;
      srtContent += `${subtitleIndex}\n`;
      srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
      srtContent += `${scene.narrationText.trim()}\n\n`;
      subtitleIndex++;
    } else {
      for (const phrase of phrases) {
        const startTime = accumulatedTime + phrase.start;
        const endTime = Math.min(accumulatedTime + sceneDuration, accumulatedTime + phrase.end);

        srtContent += `${subtitleIndex}\n`;
        srtContent += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
        srtContent += `${phrase.text.trim()}\n\n`;
        subtitleIndex++;
      }
    }

    accumulatedTime += sceneDuration;
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
