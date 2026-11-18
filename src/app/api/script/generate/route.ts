import { NextResponse } from "next/server";
import { conductResearch } from "@/lib/ai/researcher";
import { generateCinematicScript } from "@/lib/ai/scriptwriter";
import { prisma } from "@/lib/prisma";
import { VideoFormat, Language } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic,
      format = "DOCUMENTARY",
      language = "PT_BR",
      voiceId = "pt-br-marcos-deep",
      targetDurationMinutes,
      targetDuration,
      customScript,
      visualStyle = "STOCK_4K",
    } = body;

    const duration = Number(targetDurationMinutes || targetDuration) || 10;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Tópico ou ideia é obrigatório" },
        { status: 400 }
      );
    }

    // Etapa 1: Pesquisa automática e apuração de fatos
    const researchData = await conductResearch({
      topic: topic.trim(),
      format: format as VideoFormat,
      language: language as Language,
    });

    // Etapa 2: Escrita do roteiro estruturado com arco narrativo
    const scriptData = await generateCinematicScript({
      topic: topic.trim(),
      format: format as VideoFormat,
      language: language as Language,
      targetDurationMinutes: duration,
      researchData,
      customScript,
      visualStyle: (visualStyle as any) || "STOCK_4K",
    });

    // Tenta persistir o projeto e cenas no banco de dados se houver usuário
    let persistedProjectId = "proj-" + Date.now();
    try {
      // Busca ou cria usuário padrão do estúdio
      const defaultUser = await prisma.user.upsert({
        where: { email: "criador@loopx.com" },
        update: {},
        create: {
          email: "criador@loopx.com",
          name: "Criador Dark Studio",
        },
      });

      const newProject = await prisma.project.create({
        data: {
          userId: defaultUser.id,
          title: scriptData.title,
          topicOrIdea: topic.trim(),
          customScript: customScript || null,
          format: format as VideoFormat,
          language: language as Language,
          voiceId,
          targetDurationMinutes: Number(targetDurationMinutes) || 10,
          status: "CURATING_MEDIA",
          scenes: {
            create: scriptData.scenes.map((s) => ({
              sceneOrder: s.sceneOrder,
              narrationText: s.narrationText,
              keywords: s.keywords,
              mediaUrl: s.mediaUrl,
              mediaType: s.mediaType,
              motionEffect: s.motionEffect,
              durationSeconds: s.durationSeconds,
              subtitlesJson: s.subtitles as any,
            })),
          },
        },
      });

      persistedProjectId = newProject.id;
    } catch (dbError) {
      console.warn("Aviso ao persistir no banco (usando id mockado):", dbError);
    }

    return NextResponse.json({
      success: true,
      projectId: persistedProjectId,
      research: researchData,
      script: scriptData,
      scenes: scriptData.scenes,
      title: scriptData.title,
      youtubeDescription: scriptData.youtubeDescription,
    });
  } catch (error: any) {
    console.error("Erro na geração de pesquisa e roteiro:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha interna ao gerar roteiro" },
      { status: 500 }
    );
  }
}
