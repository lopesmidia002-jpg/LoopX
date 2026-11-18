import { NextResponse } from "next/server";
import { PIPELINE_STAGES } from "@/lib/constants";
import fs from "fs";
import path from "path";

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
      outputVideoUrl: "/api/render?download=true",
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
  const isDownload = searchParams.get("download") === "true";
  const jobId = searchParams.get("jobId");

  if (isDownload) {
    const candidatePaths = [
      path.join(process.cwd(), "public", "demo-render.mp4"),
      "/app/public/demo-render.mp4",
      "/tmp/demo-render.mp4",
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const fileBuffer = fs.readFileSync(p);
        const stat = fs.statSync(p);
        return new Response(fileBuffer, {
          headers: {
            "Content-Type": "video/mp4",
            "Content-Disposition": 'attachment; filename="loopx-documentario-1080p.mp4"',
            "Content-Length": stat.size.toString(),
          },
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    jobId: jobId || "job-default",
    currentStage: 8,
    progressPercentage: 100,
    status: "COMPLETED",
    outputVideoUrl: "/api/render?download=true",
    resolution: "1080p",
    durationSeconds: 645,
  });
}
