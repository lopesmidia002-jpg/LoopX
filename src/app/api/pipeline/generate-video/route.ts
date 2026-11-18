import { NextResponse } from "next/server";
import { generateImageToVideo } from "@/lib/pipeline/ai-video-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sceneId,
      imageUrl,
      currentImageUrl,
      topic = "Documentário Dark",
      keywords = [],
      narrationText = "",
      sceneIndex = 0,
      duration = 8,
    } = body;

    const targetImageUrl = imageUrl || currentImageUrl || "";

    if (!targetImageUrl && !topic && (!keywords || keywords.length === 0)) {
      return NextResponse.json(
        { success: false, error: "imageUrl, topic ou keywords é obrigatório" },
        { status: 400 }
      );
    }

    const result = await generateImageToVideo({
      imageUrl: targetImageUrl,
      topic,
      keywords: Array.isArray(keywords) ? keywords : [String(keywords)],
      narrationText,
      sceneIndex,
      duration: Number(duration) || 8,
    });

    return NextResponse.json({
      success: true,
      sceneId,
      videoUrl: result.videoUrl,
      mediaType: result.mediaType,
      motionPrompt: result.motionPrompt,
      model: result.model,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error("Erro na API de geração de vídeo por IA:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao gerar clipe de vídeo por IA" },
      { status: 500 }
    );
  }
}
