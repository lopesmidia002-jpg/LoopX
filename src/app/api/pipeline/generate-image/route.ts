import { NextResponse } from "next/server";
import {
  buildCinematicAiImagePrompt,
  getAiGeneratedImageUrl,
  getCuratedMediaForScene,
} from "@/lib/pipeline/media-curator";

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

    let imageUrl = getAiGeneratedImageUrl(finalPrompt, seed);
    let usedFallback = false;

    // Sonda se a API gratuita de IA está livre ou bloqueada por rate-limit (evita banner amarelo)
    try {
      const probe = await fetch(imageUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(3500),
      });
      const retryAfter = probe.headers.get("retry-after");
      const paymentReq = probe.headers.get("payment-required");

      if (probe.status === 402 || probe.status === 429 || retryAfter || paymentReq) {
        // Rate-limit do provedor de IA gratuito (1 img/45s): recorre ao acervo 4K de alta fidelidade
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
      // Timeout ou erro no gerador: usa acervo 4K
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
