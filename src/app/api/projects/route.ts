import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        scenes: {
          orderBy: { sceneOrder: "asc" },
        },
        renderJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Falha ao carregar projetos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topicOrIdea, format, language, voiceId, targetDurationMinutes } = body;

    // Retorna resposta mockada estruturada se o banco ainda não estiver populado com usuário
    return NextResponse.json({
      success: true,
      projectId: "proj-" + Date.now(),
      topicOrIdea,
      format,
      language,
      voiceId,
      targetDurationMinutes,
      status: "QUEUED",
      message: "Projeto criado com sucesso",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Falha ao criar projeto" },
      { status: 500 }
    );
  }
}
