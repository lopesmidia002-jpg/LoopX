import { NextResponse } from "next/server";
import { buildCinematicAiImagePrompt, getAiGeneratedImageUrl } from "@/lib/pipeline/media-curator";

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
    const finalPrompt =
      customPrompt && typeof customPrompt === "string" && customPrompt.trim().length > 3
        ? customPrompt.trim()
        : buildCinematicAiImagePrompt(
            topic,
            Array.isArray(keywords) ? keywords : [String(keywords)],
            sceneIndex,
            narrationText
          );

    const imageUrl = getAiGeneratedImageUrl(finalPrompt, seed);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: finalPrompt,
      seed,
    });
  } catch (error: any) {
    console.error("Erro na API de geração de imagem:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao gerar imagem por IA" },
      { status: 500 }
    );
  }
}
