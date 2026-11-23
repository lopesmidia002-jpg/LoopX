import { NextResponse } from "next/server";
import {
  buildCinematicAiImagePrompt,
  getAiGeneratedImageUrl,
  getCuratedMediaForScene,
} from "@/lib/pipeline/media-curator";
import { tryGenerateDallE3 } from "@/lib/pipeline/ai-video-generator";
import { getEffectiveApiKey } from "@/lib/youtube/channel-manager";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic = "Mistério Documental",
      keywords = [],
      customPrompt,
      sceneIndex = 0,
      narrationText,
    } = body;

    const seed = Math.floor(Math.random() * 999999);
    const normalizedKeywords = Array.isArray(keywords) ? keywords : [String(keywords)];
    const finalPrompt =
      customPrompt && typeof customPrompt === "string" && customPrompt.trim().length > 3
        ? customPrompt.trim()
        : buildCinematicAiImagePrompt(topic, normalizedKeywords, sceneIndex, narrationText);

    // 1. Prioridade Máxima: OpenAI DALL-E 3 se houver chave configurada (BYOK ou ambiente)
    const openAiKey = getEffectiveApiKey("openai");
    if (openAiKey && openAiKey.startsWith("sk-")) {
      const dallEUrl = await tryGenerateDallE3(finalPrompt);
      if (dallEUrl) {
        return NextResponse.json({
          success: true,
          imageUrl: dallEUrl,
          prompt: finalPrompt,
          seed,
          model: "OpenAI DALL-E 3 (16:9 Widescreen)",
          usedFallback: false,
          rateLimited: false,
        });
      }
    }

    // 2. Pollinations AI com suporte à chave de alta cota e proteção estrita contra banner de 45s
    const pollinationsKey = getEffectiveApiKey("pollinations");
    let imageUrl = getAiGeneratedImageUrl(finalPrompt, seed, pollinationsKey);
    let usedFallback = false;

    // Sonda ativa: se a API gratuita estiver em rate-limit (402, 429 ou headers de bloqueio), recorre ao acervo 4K
    try {
      const probe = await fetch(imageUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      const retryAfter = probe.headers.get("retry-after");
      const paymentReq = probe.headers.get("payment-required");
      const contentType = probe.headers.get("content-type") || "";

      if (
        probe.status !== 200 ||
        Boolean(retryAfter) ||
        Boolean(paymentReq) ||
        contentType.includes("json")
      ) {
        imageUrl = await getCuratedMediaForScene({
          topic,
          keywords: normalizedKeywords,
          sceneIndex,
          visualStyle: "STOCK_4K",
          narrationText,
        });
        usedFallback = true;
      }
    } catch {
      // Timeout ou indisponibilidade na IA: recorre com segurança ao acervo 4K de alta fidelidade
      imageUrl = await getCuratedMediaForScene({
        topic,
        keywords: normalizedKeywords,
        sceneIndex,
        visualStyle: "STOCK_4K",
        narrationText,
      });
      usedFallback = true;
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: finalPrompt,
      seed,
      usedFallback,
      rateLimited: usedFallback,
    });
  } catch (error: any) {
    console.error("Erro na API de geração de imagem:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao gerar imagem por IA" },
      { status: 500 }
    );
  }
}
