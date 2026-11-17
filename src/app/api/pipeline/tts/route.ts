import { NextResponse } from "next/server";
import { synthesizeNeuralVoice } from "@/lib/pipeline/tts-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voiceId, language } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Texto da narração é obrigatório" },
        { status: 400 }
      );
    }

    const ttsResult = await synthesizeNeuralVoice({
      text,
      voiceId,
      language,
    });

    return NextResponse.json({
      success: true,
      ...ttsResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha na síntese de voz" },
      { status: 500 }
    );
  }
}
