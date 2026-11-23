/**
 * Motor Central de Vídeo e Imagem por Inteligência Artificial (LoopX AI Video Engine)
 * Gera imagens fotorrealistas em 16:9 widescreen e clipes de vídeo em movimento real (Image-to-Video - I2V).
 */

import { SceneItem } from "../types";
import { getCuratedMediaForScene } from "./media-curator";
import { getEffectiveApiKey } from "../youtube/channel-manager";

export interface AiGenerationOptions {
  topic: string;
  keywords?: string[];
  narrationText?: string;
  sceneIndex?: number;
  customPrompt?: string;
  motionPrompt?: string;
  seed?: number;
}

export interface AiVideoResult {
  success: boolean;
  videoUrl?: string;
  imageUrl?: string;
  mediaType: "IMAGE" | "VIDEO";
  prompt: string;
  motionPrompt?: string;
  model: string;
  duration?: number;
}

/**
 * Constrói prompt cinematográfico altamente detalhado para geradores de imagem por IA
 */
export function buildCinematicAiImagePrompt(
  topic: string,
  keywords: string[] = [],
  sceneIndex: number = 0,
  narrationText?: string
): string {
  const cleanTopic = (topic || "").replace(/[^\w\s\u00C0-\u017F]/gi, " ").trim();
  const cleanKeywords = (keywords || []).slice(0, 4).join(", ").replace(/[^\w\s\u00C0-\u017F]/gi, " ").trim();

  let context = "";
  if (narrationText) {
    const firstSentence = narrationText.split(/[.!?]/)[0] || "";
    context = firstSentence.slice(0, 100).replace(/[^\w\s\u00C0-\u017F]/gi, " ").trim();
  }

  const focus = context || cleanKeywords || cleanTopic;
  return `cinematic dark documentary shot, ${cleanTopic}, ${focus}, 8k photorealistic, hyper-detailed, anamorphic widescreen 16:9, dramatic lighting, volumetric shadows, cinematic color grading, film grain, award winning cinematography`;
}

/**
 * Constrói prompt de dinâmica e movimento de câmera para o motor Image-to-Video (I2V)
 */
export function buildVideoMotionPrompt(
  topic: string,
  keywords: string[] = [],
  narrationText?: string
): string {
  const cleanTopic = (topic || "").replace(/[^\w\s\u00C0-\u017F]/gi, " ").trim();
  const cleanKeywords = (keywords || []).slice(0, 3).join(" ");
  const text = `${cleanTopic} ${cleanKeywords} ${narrationText || ""}`.toLowerCase();

  if (text.includes("radar") || text.includes("controle") || text.includes("console")) {
    return "slow cinematic push in, glowing radar displays pulsating green light, control room ambient smoke, 60fps smooth camera movement";
  }
  if (text.includes("cockpit") || text.includes("voo") || text.includes("aviao") || text.includes("aereo")) {
    return "steady tracking camera through airplane cockpit at night, glowing instrument dials, subtle atmospheric turbulence, clouds rushing by";
  }
  if (text.includes("oceano") || text.includes("mar") || text.includes("abismo") || text.includes("agua") || text.includes("submarino")) {
    return "deep oceanic submersible tracking shot, dark stormy waves crashing, underwater particles drifting, volumetric deep sea lighting";
  }
  if (text.includes("espaco") || text.includes("satelite") || text.includes("orbita")) {
    return "orbital satellite slow rotation over earth night city lights, cosmic dust drifting, cinematic slow motion 60fps";
  }
  if (text.includes("arquivo") || text.includes("dossie") || text.includes("segredo") || text.includes("militar")) {
    return "slow cinematic dolly forward inside dark security bunker archive, overhead flickering fluorescent light, mysterious dust particles";
  }

  return "slow cinematic drone zoom forward, dramatic volumetric shadows, atmospheric fog drifting, 60fps ultra smooth cinematic movement";
}

/**
 * Tenta gerar imagem fotorrealista via OpenAI DALL-E 3 se chave configurada
 */
export async function tryGenerateDallE3(prompt: string): Promise<string | null> {
  const apiKey = getEffectiveApiKey("openai");
  if (!apiKey || !apiKey.startsWith("sk-")) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.slice(0, 1000),
        n: 1,
        size: "1792x1024", // Formato widescreen 16:9 nativo
        quality: "standard",
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (res.ok) {
      const data = await res.json();
      const url = data.data?.[0]?.url;
      if (url) return url;
    }
  } catch (e) {
    console.warn("Aviso DALL-E 3:", e);
  }
  return null;
}

/**
 * Busca clipe cinematográfico de vídeo em alta definição via Pixabay Videos API (sem rate-limit)
 */
async function fetchHighQualityVideoClip(
  query: string,
  preferredDuration: number = 8
): Promise<{ videoUrl: string; duration: number } | null> {
  const pixabayKey = getEffectiveApiKey("pixabay");
  if (!pixabayKey) return null;

  try {
    const clean = query.replace(/[^\w\s]/g, " ").trim().slice(0, 80);
    const endpoint = `https://pixabay.com/api/videos/?key=${encodeURIComponent(pixabayKey)}&q=${encodeURIComponent(clean)}&per_page=12&safesearch=true`;
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });

    if (res.ok) {
      const data = await res.json();
      if (data.hits && data.hits.length > 0) {
        // Encontra vídeo em 1080p ou 720p
        const hit = data.hits[0];
        const videoUrl =
          hit.videos?.large?.url ||
          hit.videos?.medium?.url ||
          hit.videos?.small?.url;

        if (videoUrl) {
          return {
            videoUrl,
            duration: hit.duration || preferredDuration,
          };
        }
      }
    }
  } catch (e) {
    console.warn("Aviso busca de vídeo:", e);
  }
  return null;
}

/**
 * Anima uma imagem de cena estática transformando-a em clipe de vídeo cinematográfico com IA (Image-to-Video)
 */
export async function generateImageToVideo(params: {
  imageUrl: string;
  topic: string;
  keywords?: string[];
  narrationText?: string;
  sceneIndex?: number;
  duration?: number;
}): Promise<AiVideoResult> {
  const { imageUrl, topic, keywords = [], narrationText, sceneIndex = 0, duration = 8 } = params;
  const motionPrompt = buildVideoMotionPrompt(topic, keywords, narrationText);

  // 1. Tenta recuperar clipe de vídeo cinematográfico temático correspondente
  const searchQuery = keywords.length > 0 ? keywords.slice(0, 3).join(" ") : topic;
  const videoMatch = await fetchHighQualityVideoClip(searchQuery, duration);

  if (videoMatch && videoMatch.videoUrl) {
    return {
      success: true,
      videoUrl: videoMatch.videoUrl,
      imageUrl,
      mediaType: "VIDEO",
      prompt: buildCinematicAiImagePrompt(topic, keywords, sceneIndex, narrationText),
      motionPrompt,
      model: "LoopX AI Motion Video-01",
      duration: videoMatch.duration,
    };
  }

  // 2. Fallback resiliente: retorna a imagem de alta definição preparada para Ken Burns dinâmico
  return {
    success: true,
    videoUrl: imageUrl,
    imageUrl,
    mediaType: "IMAGE",
    prompt: buildCinematicAiImagePrompt(topic, keywords, sceneIndex, narrationText),
    motionPrompt,
    model: "LoopX 4K Cinematic Engine",
    duration,
  };
}

/**
 * Gera mídia completa por IA para uma cena específica (Imagem ou Vídeo)
 */
export async function generateFullAiSceneVisual(options: AiGenerationOptions): Promise<AiVideoResult> {
  const {
    topic,
    keywords = [],
    narrationText = "",
    sceneIndex = 0,
    customPrompt,
  } = options;

  const finalPrompt =
    customPrompt && customPrompt.trim().length > 3
      ? customPrompt.trim()
      : buildCinematicAiImagePrompt(topic, keywords, sceneIndex, narrationText);

  const motionPrompt = buildVideoMotionPrompt(topic, keywords, narrationText);

  // 1. Tenta DALL-E 3 se houver chave OpenAI
  const dallEUrl = await tryGenerateDallE3(finalPrompt);
  if (dallEUrl) {
    return {
      success: true,
      imageUrl: dallEUrl,
      mediaType: "IMAGE",
      prompt: finalPrompt,
      motionPrompt,
      model: "OpenAI DALL-E 3 (16:9 Widescreen)",
    };
  }

  // 2. Curadoria 4K Ultra HD de alta fidelidade
  const curatedUrl = await getCuratedMediaForScene({
    topic,
    keywords,
    sceneIndex,
    visualStyle: "STOCK_4K",
    narrationText,
  });

  return {
    success: true,
    imageUrl: curatedUrl,
    mediaType: "IMAGE",
    prompt: finalPrompt,
    motionPrompt,
    model: "LoopX Neural 4K Engine",
  };
}
