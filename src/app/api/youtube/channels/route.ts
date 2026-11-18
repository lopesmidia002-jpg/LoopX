import { NextRequest, NextResponse } from "next/server";
import { ChannelManager } from "@/lib/youtube/channel-manager";

export async function GET() {
  try {
    const channels = await ChannelManager.getChannels();
    const activeChannel = await ChannelManager.getActiveChannel();
    const integrations = await ChannelManager.getApiIntegrationsStatus();

    return NextResponse.json({
      success: true,
      channels,
      activeChannel,
      integrations,
    });
  } catch (error: any) {
    console.error("[YouTube Channels GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao consultar canais" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "SWITCH") {
      if (!body.channelId) {
        return NextResponse.json(
          { success: false, error: "ID do canal é obrigatório" },
          { status: 400 }
        );
      }
      const activeChannel = await ChannelManager.setActiveChannel(body.channelId);
      return NextResponse.json({
        success: true,
        message: `Canal alterado para "${activeChannel.name}"`,
        activeChannel,
      });
    }

    if (body.action === "SAVE_KEY") {
      const { service, key } = body;
      if (!service || !key) {
        return NextResponse.json(
          { success: false, error: "Serviço e chave são obrigatórios" },
          { status: 400 }
        );
      }
      await ChannelManager.setCustomApiKey(service, key);
      return NextResponse.json({
        success: true,
        message: `Chave de API do serviço ${service} salva com sucesso`,
      });
    }

    // Criação de novo canal
    const {
      name,
      handle,
      niche,
      defaultVoiceId = "pt-br-marcos-deep",
      defaultFormat = "DOCUMENTARY",
      defaultLanguage = "PT_BR",
      autoPublish = false,
      avatarUrl = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80",
    } = body;

    const formattedHandle = handle ? (handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`) : "";
    const channelName = (name && name.trim()) || (formattedHandle ? formattedHandle.replace(/^@/, "") : "");

    if (!channelName || !formattedHandle || !niche) {
      return NextResponse.json(
        { success: false, error: "Handle do canal (@) e nicho são obrigatórios" },
        { status: 400 }
      );
    }

    const createdChannel = await ChannelManager.createChannel({
      name: channelName,
      handle: formattedHandle,
      niche,
      subscribers: 0,
      defaultVoiceId,
      defaultFormat,
      defaultLanguage,
      autoPublish,
      avatarUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Novo canal "${createdChannel.name}" criado com sucesso!`,
      channel: createdChannel,
    });
  } catch (error: any) {
    console.error("[YouTube Channels POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao processar ação de canal" },
      { status: 500 }
    );
  }
}
