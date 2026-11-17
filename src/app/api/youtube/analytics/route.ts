import { NextResponse } from "next/server";
import { YouTubeAnalyticsManager } from "@/lib/youtube/analytics";

export async function GET() {
  try {
    const analytics = await YouTubeAnalyticsManager.getChannelOverview();
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error: any) {
    console.error("[YouTube Analytics Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro ao consultar métricas do canal",
      },
      { status: 500 }
    );
  }
}
