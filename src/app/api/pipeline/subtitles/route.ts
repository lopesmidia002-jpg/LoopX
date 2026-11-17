import { NextResponse } from "next/server";
import { generateSrt, syncSubtitles } from "@/lib/pipeline/subtitles-sync";
import { SceneItem } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenes = [] } = body as { scenes: SceneItem[] };

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Array de cenas é obrigatório" },
        { status: 400 }
      );
    }

    // Gera o texto formatado no padrão .SRT
    const srtContent = generateSrt(scenes);

    // Sincroniza palavra por palavra se necessário
    const syncedScenes = scenes.map((s) => ({
      ...s,
      subtitles: s.subtitles && s.subtitles.length > 0 ? s.subtitles : syncSubtitles(s.narrationText, s.durationSeconds),
    }));

    return NextResponse.json({
      success: true,
      srt: srtContent,
      syncedScenes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao gerar legendas" },
      { status: 500 }
    );
  }
}
