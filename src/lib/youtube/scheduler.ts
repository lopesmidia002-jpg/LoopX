/**
 * Motor de Agendamento Automático de Vídeos e Calendário Semanal
 * LoopX YouTube Video Scheduler Engine
 */

export interface ScheduledPost {
  id: string;
  projectId: string;
  title: string;
  channelId: string;
  channelName: string;
  scheduledFor: string; // ISO string
  status: "SCHEDULED" | "PUBLISHED" | "CANCELED";
  videoFormat: "DOCUMENTARY" | "TOP_10";
  thumbnailUrl: string;
  privacyStatus: "public" | "unlisted" | "private";
  createdAt: string;
}

export interface CalendarSlot {
  dayOfWeek: string;
  recommendedTime: string;
  retentionScore: number;
  scheduledPost?: ScheduledPost;
}

// Armazenamento em memória sincronizado no contêiner
let scheduledPostsStorage: ScheduledPost[] = [
  {
    id: "sched-1",
    projectId: "proj-demo-1",
    title: "O Mistério Inexplicável do Voo MH370",
    channelId: "channel-1",
    channelName: "Arquivos do Oculto",
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    status: "SCHEDULED",
    videoFormat: "DOCUMENTARY",
    thumbnailUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=640&q=80",
    privacyStatus: "public",
    createdAt: new Date().toISOString(),
  },
  {
    id: "sched-2",
    projectId: "proj-demo-2",
    title: "As 10 Fosas Abissais Mais Profundas do Oceano",
    channelId: "channel-2",
    channelName: "Abismo Submarino",
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Em 3 dias
    status: "SCHEDULED",
    videoFormat: "TOP_10",
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=640&q=80",
    privacyStatus: "public",
    createdAt: new Date().toISOString(),
  },
];

export class ScheduleManager {
  /**
   * Retorna todas as publicações agendadas
   */
  static async getScheduledPosts(): Promise<ScheduledPost[]> {
    return scheduledPostsStorage.filter((p) => p.status === "SCHEDULED");
  }

  /**
   * Cria um novo agendamento de vídeo
   */
  static async schedulePost(input: {
    projectId: string;
    title: string;
    channelId?: string;
    channelName?: string;
    scheduledFor: string;
    videoFormat?: "DOCUMENTARY" | "TOP_10";
    thumbnailUrl?: string;
    privacyStatus?: "public" | "unlisted" | "private";
  }): Promise<ScheduledPost> {
    const {
      projectId,
      title,
      channelId = "channel-1",
      channelName = "Arquivos do Oculto",
      scheduledFor,
      videoFormat = "DOCUMENTARY",
      thumbnailUrl = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=640&q=80",
      privacyStatus = "public",
    } = input;

    const newPost: ScheduledPost = {
      id: `sched-${Date.now()}`,
      projectId,
      title,
      channelId,
      channelName,
      scheduledFor: new Date(scheduledFor).toISOString(),
      status: "SCHEDULED",
      videoFormat,
      thumbnailUrl,
      privacyStatus,
      createdAt: new Date().toISOString(),
    };

    scheduledPostsStorage.push(newPost);
    return newPost;
  }

  /**
   * Cancela uma publicação agendada
   */
  static async cancelScheduledPost(id: string): Promise<boolean> {
    const post = scheduledPostsStorage.find((p) => p.id === id);
    if (!post) return false;
    post.status = "CANCELED";
    return true;
  }

  /**
   * Retorna os melhores slots da semana para publicação em canais Dark
   */
  static async getWeeklyCalendarSlots(): Promise<CalendarSlot[]> {
    const activePosts = scheduledPostsStorage.filter((p) => p.status === "SCHEDULED");

    return [
      {
        dayOfWeek: "Segunda-feira",
        recommendedTime: "18:30",
        retentionScore: 84,
      },
      {
        dayOfWeek: "Terça-feira",
        recommendedTime: "18:00",
        retentionScore: 98,
        scheduledPost: activePosts[0],
      },
      {
        dayOfWeek: "Quarta-feira",
        recommendedTime: "19:00",
        retentionScore: 86,
      },
      {
        dayOfWeek: "Quinta-feira",
        recommendedTime: "18:00",
        retentionScore: 97,
        scheduledPost: activePosts[1],
      },
      {
        dayOfWeek: "Sexta-feira",
        recommendedTime: "19:30",
        retentionScore: 89,
      },
      {
        dayOfWeek: "Sábado",
        recommendedTime: "14:00",
        retentionScore: 82,
      },
      {
        dayOfWeek: "Domingo",
        recommendedTime: "19:00",
        retentionScore: 99,
      },
    ];
  }
}
