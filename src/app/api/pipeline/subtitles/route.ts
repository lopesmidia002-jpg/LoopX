import { NextResponse } from "next/server";
import { generateSrt, syncSubtitles } from "@/lib/pipeline/subtitles-sync";
import { SceneItem } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawScenes = (body.scenes || []) as any[];

    if (!Array.isArray(rawScenes) || rawScenes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Array de cenas é obrigatório" },
        { status: 400 }
      );
    }

    // Normaliza campos para suportar tanto sceneOrder/narrationText quanto number/narration
    const scenes: SceneItem[] = rawScenes.map((s, idx) => ({
      id: s.id || `scene-${idx + 1}`,
      sceneOrder: s.sceneOrder || s.number || idx + 1,
      narrationText: s.narrationText || s.narration || "",
      durationSeconds: Number(s.durationSeconds || s.duration || 5),
      mediaUrl: s.mediaUrl || "",
      mediaType: s.mediaType || "IMAGE",
      motionEffect: s.motionEffect || "KEN_BURNS_ZOOM_IN",
      keywords: s.keywords || [],
      subtitles: s.subtitles,
    }));

    // Gera o texto formatado no padrão .SRT
    const srtContent = generateSrt(scenes);

    // Sincroniza palavra por palavra se necessário
    const syncedScenes = scenes.map((s) => ({
      ...s,
      subtitles:
        s.subtitles && s.subtitles.length > 0
          ? s.subtitles
          : syncSubtitles(s.narrationText, s.durationSeconds),
    }));

    return NextResponse.json({
      success: true,
      srt: srtContent,
      srtContent,
      syncedScenes,
    });
  } catch (error: any) {
    console.error("Erro na geração de legendas:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao gerar legendas" },
      { status: 500 }
    );
  }
}
