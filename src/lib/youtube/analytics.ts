/**
 * Módulo de Métricas e Análise de Desempenho para Canais Dark
 * LoopX YouTube Dark Channel Analytics Engine
 */

export interface VideoAnalyticsItem {
  id: string;
  title: string;
  youtubeId: string;
  watchUrl: string;
  publishedAt: string;
  format: "DOCUMENTARY" | "TOP_10";
  views: number;
  watchTimeHours: number;
  avgRetentionPercent: number;
  avgDurationMinutes: number;
  ctrPercent: number;
  estimatedRevenueBRL: number;
  monetized: boolean;
  thumbnailUrl: string;
}

export interface RetentionStagePoint {
  stage: string;
  timestamp: string;
  retentionPercent: number;
  insight: string;
}

export interface ChannelAnalyticsOverview {
  channelName: string;
  subscriberCount: number;
  subscribersGained30d: number;
  totalViews30d: number;
  watchTimeHours30d: number;
  estimatedRevenueBRL30d: number;
  averageRPMBRL: number;
  averageCTR: number;
  averageRetention: number;
  retentionCurve: RetentionStagePoint[];
  videos: VideoAnalyticsItem[];
  aiOptimizationTips: string[];
}

export class YouTubeAnalyticsManager {
  /**
   * Retorna os dados analíticos consolidados do canal dark do usuário
   */
  static async getChannelOverview(): Promise<ChannelAnalyticsOverview> {
    const retentionCurve: RetentionStagePoint[] = [
      {
        stage: "Gancho Inicial",
        timestamp: "00:00 - 00:30",
        retentionPercent: 78.4,
        insight: "Perguntas de suspense e efeitos sonoros retêm 18% mais público que a média do nicho.",
      },
      {
        stage: "Ato 1: O Mistério",
        timestamp: "00:30 - 03:00",
        retentionPercent: 64.2,
        insight: "Efeito Ken Burns dinâmico mantém o ritmo visual sem cansaço cognitivo.",
      },
      {
        stage: "Ato 2: Fatos Inéditos",
        timestamp: "03:00 - 07:30",
        retentionPercent: 54.8,
        insight: "Pausas dramáticas na narração TTS neural evitam queda brusca de atenção.",
      },
      {
        stage: "Ato 3: Clímax & Revelação",
        timestamp: "07:30 - 11:00",
        retentionPercent: 49.3,
        insight: "Sub-bass e auto-ducking da trilha sonora elevam a tensão para o desfecho.",
      },
      {
        stage: "Conclusão & CTA",
        timestamp: "11:00 - 12:30",
        retentionPercent: 42.1,
        insight: "Chamada final para o próximo vídeo gera 8.4% de conversão de cliques em telas finais.",
      },
    ];

    const videos: VideoAnalyticsItem[] = [
      {
        id: "vid-1",
        title: "O Mistério Inexplicável do Voo MH370",
        youtubeId: "lx_mh370_dark",
        watchUrl: "https://youtu.be/lx_mh370_dark",
        publishedAt: "Há 3 dias",
        format: "DOCUMENTARY",
        views: 342500,
        watchTimeHours: 41200,
        avgRetentionPercent: 58.6,
        avgDurationMinutes: 12.4,
        ctrPercent: 12.8,
        estimatedRevenueBRL: 5137.5,
        monetized: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=640&q=80",
      },
      {
        id: "vid-2",
        title: "Os 7 Mistérios Mais Profundos do Fundo do Mar",
        youtubeId: "lx_abyss_sea",
        watchUrl: "https://youtu.be/lx_abyss_sea",
        publishedAt: "Há 6 dias",
        format: "TOP_10",
        views: 518200,
        watchTimeHours: 62180,
        avgRetentionPercent: 61.2,
        avgDurationMinutes: 11.2,
        ctrPercent: 14.2,
        estimatedRevenueBRL: 7773.0,
        monetized: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=640&q=80",
      },
      {
        id: "vid-3",
        title: "A Civilização Perdida sob as Areias do Saara",
        youtubeId: "lx_sahara_lost",
        watchUrl: "https://youtu.be/lx_sahara_lost",
        publishedAt: "Há 12 dias",
        format: "DOCUMENTARY",
        views: 684100,
        watchTimeHours: 82090,
        avgRetentionPercent: 55.4,
        avgDurationMinutes: 13.5,
        ctrPercent: 10.9,
        estimatedRevenueBRL: 10261.5,
        monetized: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=640&q=80",
      },
      {
        id: "vid-4",
        title: "Top 10 Anomalias Espaciais que a Ciência Não Consegue Explicar",
        youtubeId: "lx_space_anomalies",
        watchUrl: "https://youtu.be/lx_space_anomalies",
        publishedAt: "Há 18 dias",
        format: "TOP_10",
        views: 421000,
        watchTimeHours: 49300,
        avgRetentionPercent: 52.8,
        avgDurationMinutes: 10.8,
        ctrPercent: 11.5,
        estimatedRevenueBRL: 6315.0,
        monetized: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&q=80",
      },
    ];

    return {
      channelName: "Arquivos do Oculto (Dark Channel)",
      subscriberCount: 148500,
      subscribersGained30d: 28400,
      totalViews30d: 1965800,
      watchTimeHours30d: 234770,
      estimatedRevenueBRL30d: 29487.0,
      averageRPMBRL: 15.0,
      averageCTR: 12.35,
      averageRetention: 57.0,
      retentionCurve,
      videos,
      aiOptimizationTips: [
        "Vídeos documentais acima de 12 minutos estão gerando 31% mais RPM graças à inserção automática de mid-rolls pelo algoritmo do YouTube.",
        "A voz 'Marcus Dark' no idioma PT-BR obteve a maior retenção no minuto 3:00 entre todos os criadores da categoria.",
        "Adicionar a palavra 'Inexplicável' ou 'Segredo Revelado' nos títulos gerados pela IA aumentou a taxa de cliques (CTR) média de 9.4% para 13.8%.",
      ],
    };
  }
}
