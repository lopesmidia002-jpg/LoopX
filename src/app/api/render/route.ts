import { NextResponse } from "next/server";
import { PIPELINE_STAGES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, topic } = body;

    return NextResponse.json({
      success: true,
      renderJobId: "job-" + Date.now(),
      projectId,
      topic,
      currentStage: 1,
      totalStages: 8,
      progressPercentage: 12,
      stages: PIPELINE_STAGES,
      status: "PROCESSING",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Falha ao iniciar renderização" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  return NextResponse.json({
    success: true,
    jobId: jobId || "job-default",
    currentStage: 8,
    progressPercentage: 100,
    status: "COMPLETED",
    outputVideoUrl: "https://actions.google.com/sounds/v1/science_fiction/alien_hum.ogg",
    resolution: "1080p",
    durationSeconds: 645,
  });
}
