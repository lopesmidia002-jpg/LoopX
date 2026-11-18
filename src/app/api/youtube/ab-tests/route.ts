import { NextRequest, NextResponse } from "next/server";
import { ABTestingManager, CreateABExperimentInput } from "@/lib/youtube/ab-testing";

export const dynamic = "force-dynamic";

/**
 * GET /api/youtube/ab-tests
 * Consulta experimentos ou gera sugestões de variantes com IA
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const experimentId = searchParams.get("id");
    const channelId = searchParams.get("channelId");
    const generate = searchParams.get("generate");
    const topic = searchParams.get("topic");
    const title = searchParams.get("title");

    // Gerador de variantes via IA
    if (generate === "true" || (topic && !experimentId)) {
      const suggestions = await ABTestingManager.generateAIVariants(
        topic || "Mistérios e Conspirações",
        title || "Documentário Completo"
      );
      return NextResponse.json({ success: true, aiSuggestions: suggestions });
    }

    // Busca de experimento único por ID
    if (experimentId) {
      const experiment = await ABTestingManager.getExperimentById(experimentId);
      if (!experiment) {
        return NextResponse.json(
          { success: false, error: "Experimento não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, experiment });
    }

    // Listagem geral
    const experiments = await ABTestingManager.getExperiments(channelId || undefined);
    return NextResponse.json({
      success: true,
      experiments,
      count: experiments.length,
    });
  } catch (error: any) {
    console.error("Erro ao processar GET /api/youtube/ab-tests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/ab-tests
 * Criação, inicialização, pausa e conclusão de testes A/B
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "CREATE";

    switch (action) {
      case "CREATE": {
        const input: CreateABExperimentInput = {
          projectId: body.projectId,
          videoTitle: body.videoTitle || "Novo Vídeo Dark",
          channelId: body.channelId,
          metricTarget: body.metricTarget || "CTR",
          minImpressions: body.minImpressions || 10000,
          variants: body.variants || [],
        };

        if (!input.variants || input.variants.length < 2) {
          return NextResponse.json(
            { success: false, error: "Um teste A/B requer pelo menos 2 variantes (A e B)" },
            { status: 400 }
          );
        }

        const experiment = await ABTestingManager.createExperiment(input);
        return NextResponse.json({ success: true, experiment });
      }

      case "START": {
        if (!body.experimentId) {
          return NextResponse.json(
            { success: false, error: "experimentId é obrigatório" },
            { status: 400 }
          );
        }
        const experiment = await ABTestingManager.startExperiment(body.experimentId);
        return NextResponse.json({ success: true, experiment });
      }

      case "STOP": {
        if (!body.experimentId) {
          return NextResponse.json(
            { success: false, error: "experimentId é obrigatório" },
            { status: 400 }
          );
        }
        const experiment = await ABTestingManager.stopExperiment(body.experimentId);
        return NextResponse.json({ success: true, experiment });
      }

      case "CONCLUDE": {
        if (!body.experimentId) {
          return NextResponse.json(
            { success: false, error: "experimentId é obrigatório" },
            { status: 400 }
          );
        }
        const experiment = await ABTestingManager.concludeExperiment(
          body.experimentId,
          body.winnerVariantId
        );
        return NextResponse.json({ success: true, experiment });
      }

      case "GENERATE_AI": {
        const suggestions = await ABTestingManager.generateAIVariants(
          body.topic || "Mistério Oculto",
          body.title || "Documentário Completo"
        );
        return NextResponse.json({ success: true, aiSuggestions: suggestions });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Ação não reconhecida: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Erro ao processar POST /api/youtube/ab-tests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}
