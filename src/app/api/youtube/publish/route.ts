import { NextResponse } from "next/server";
import { publishToYouTube } from "@/lib/youtube/publisher";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      privacyStatus = "unlisted",
      projectId,
      chapters = [],
      tags = ["documentario", "dark channels", "loopx"],
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, error: "Título do vídeo é obrigatório" },
        { status: 400 }
      );
    }

    const result = await publishToYouTube({
      title,
      description: description || `Documentário completo gerado com IA pelo LoopX.`,
      privacyStatus,
      tags,
      chapters,
    });

    // Se houver projectId, atualiza o projeto no banco com a URL do YouTube
    if (projectId) {
      try {
        await prisma.project.update({
          where: { id: projectId },
          data: {
            youtubePublishedUrl: result.watchUrl,
            status: "COMPLETED",
          },
        });
      } catch (e) {
        // Continua mesmo sem projeto no banco
      }
    }

    return NextResponse.json({
      success: true,
      message: "Vídeo publicado com sucesso no YouTube!",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao publicar no YouTube" },
      { status: 500 }
    );
  }
}
