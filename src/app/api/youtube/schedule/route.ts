import { NextRequest, NextResponse } from "next/server";
import { ScheduleManager } from "@/lib/youtube/scheduler";

export async function GET() {
  try {
    const scheduledPosts = await ScheduleManager.getScheduledPosts();
    const calendarSlots = await ScheduleManager.getWeeklyCalendarSlots();

    return NextResponse.json({
      success: true,
      scheduledPosts,
      calendarSlots,
    });
  } catch (error: any) {
    console.error("[Schedule GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao consultar agendamentos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "CANCEL") {
      if (!body.id) {
        return NextResponse.json(
          { success: false, error: "ID do agendamento é obrigatório" },
          { status: 400 }
        );
      }
      const canceled = await ScheduleManager.cancelScheduledPost(body.id);
      return NextResponse.json({
        success: canceled,
        message: canceled ? "Agendamento cancelado com sucesso" : "Agendamento não encontrado",
      });
    }

    const {
      projectId,
      title,
      scheduledFor,
      channelId,
      channelName,
      videoFormat,
      privacyStatus,
    } = body;

    if (!projectId || !title || !scheduledFor) {
      return NextResponse.json(
        { success: false, error: "projectId, title e scheduledFor são obrigatórios" },
        { status: 400 }
      );
    }

    const post = await ScheduleManager.schedulePost({
      projectId,
      title,
      scheduledFor,
      channelId,
      channelName,
      videoFormat,
      privacyStatus,
    });

    return NextResponse.json({
      success: true,
      message: `Vídeo agendado com sucesso para ${new Date(scheduledFor).toLocaleString("pt-BR")}`,
      scheduledPost: post,
    });
  } catch (error: any) {
    console.error("[Schedule POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Falha ao agendar vídeo" },
      { status: 500 }
    );
  }
}
