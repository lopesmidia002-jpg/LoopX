import { NextResponse } from "next/server";
import { RenderQueueManager } from "@/lib/render/queue";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId = "proj-default",
      userId,
      isPriority = false,
      maxConcurrentRenders = 1,
    } = body;

    // Enfileira o job no gerenciador
    const job = await RenderQueueManager.enqueueJob({
      projectId,
      userId,
      isPriority,
      maxConcurrentRenders,
    });

    // Salva ou atualiza no Prisma se o projeto existir
    try {
      await prisma.renderJob.create({
        data: {
          id: job.id,
          projectId,
          status: "PROCESSING",
          currentStage: 1,
          totalStages: 8,
          progressPercentage: 5,
          isPriority,
          resolution: "1080p",
          aspectRatio: "16:9",
        },
      });
    } catch (e) {
      // Continua com o job em memória
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao enfileirar trabalho de renderização" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (jobId) {
    const job = RenderQueueManager.getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Trabalho não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, job });
  }

  // Lista todos os trabalhos em execução
  const activeJobs = RenderQueueManager.listActiveJobs();
  return NextResponse.json({ success: true, activeJobs });
}
