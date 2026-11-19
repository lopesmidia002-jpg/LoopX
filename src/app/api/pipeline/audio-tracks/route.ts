import { NextResponse } from "next/server";
import {
  CINEMATIC_BACKGROUND_TRACKS,
  CINEMATIC_SFX_LIBRARY,
  getSuggestedSfxForScene,
  calculateAudioDucking,
} from "@/lib/pipeline/audio-engine";

export async function GET() {
  return NextResponse.json({
    success: true,
    tracks: CINEMATIC_BACKGROUND_TRACKS,
    sfxLibrary: CINEMATIC_SFX_LIBRARY,
    defaultTrackId: CINEMATIC_BACKGROUND_TRACKS[0].id,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keywords = [], narrationText = "", sceneIndex = 0, isSpeaking = false } = body;

    const suggestedSfx = getSuggestedSfxForScene({
      keywords,
      narrationText,
      sceneIndex,
    });

    const ducking = calculateAudioDucking({
      isSpeaking,
    });

    return NextResponse.json({
      success: true,
      suggestedSfx,
      ducking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro no motor de áudio" },
      { status: 500 }
    );
  }
}
