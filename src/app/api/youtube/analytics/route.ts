import { NextRequest, NextResponse } from "next/server";
import { YouTubeAnalyticsManager } from "@/lib/youtube/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId") || undefined;
    const analytics = await YouTubeAnalyticsManager.getChannelOverview(channelId);
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
