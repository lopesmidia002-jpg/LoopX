/**
 * Gerenciador de Múltiplos Canais Dark do YouTube & Chaves de Produção
 * LoopX Multi-Channel Dark Network Manager
 */

export interface DarkChannel {
  id: string;
  name: string;
  handle: string;
  niche: string;
  subscribers: number;
  totalViews: number;
  defaultVoiceId: string;
  defaultFormat: "DOCUMENTARY" | "TOP_10";
  defaultLanguage: "PT_BR" | "EN" | "ES";
  autoPublish: boolean;
  avatarUrl: string;
  isPrimary: boolean;
}

export interface ApiServiceStatus {
  service: "openai" | "google_ai_studio" | "elevenlabs" | "unsplash" | "pixabay" | "youtube";
  name: string;
  configured: boolean;
  source: "ENVIRONMENT" | "CUSTOM_BYOK" | "LOOPX_VAULT";
  maskedKey: string;
}

// Armazenamento em memória (sincronizado com preferências do usuário)
let channelsStorage: DarkChannel[] = [
  {
    id: "channel-1",
    name: "Arquivos do Oculto",
    handle: "@arquivosdooculto",
    niche: "Mistérios & História Proibida",
    subscribers: 148500,
    totalViews: 1965800,
    defaultVoiceId: "pt-br-marcos-deep",
    defaultFormat: "DOCUMENTARY",
    defaultLanguage: "PT_BR",
    autoPublish: false,
    avatarUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80",
    isPrimary: true,
  },
  {
    id: "channel-2",
    name: "Abismo Submarino",
    handle: "@abismosubmarino",
    niche: "Natureza Profunda & Criaturas Abissais",
    subscribers: 84200,
    totalViews: 940000,
    defaultVoiceId: "pt-br-thiago-narrador",
    defaultFormat: "TOP_10",
    defaultLanguage: "PT_BR",
    autoPublish: true,
    avatarUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&q=80",
    isPrimary: false,
  },
  {
    id: "channel-3",
    name: "Cosmos Infinito",
    handle: "@cosmosinfinitobr",
    niche: "Astronomia & Mistérios Espaciais",
    subscribers: 42100,
    totalViews: 512000,
    defaultVoiceId: "pt-br-marcos-deep",
    defaultFormat: "DOCUMENTARY",
    defaultLanguage: "PT_BR",
    autoPublish: false,
    avatarUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80",
    isPrimary: false,
  },
];

let activeChannelId = "channel-1";

// Cache de chaves BYOK personalizadas
const customApiKeys: Record<string, string> = {};

export class ChannelManager {
  /**
   * Retorna a lista de canais dark vinculados
   */
  static async getChannels(): Promise<DarkChannel[]> {
    return channelsStorage.map((ch) => ({
      ...ch,
      isPrimary: ch.id === activeChannelId,
    }));
  }

  /**
   * Retorna o canal atualmente ativo no estúdio
   */
  static async getActiveChannel(): Promise<DarkChannel> {
    const active = channelsStorage.find((ch) => ch.id === activeChannelId);
    return active || channelsStorage[0];
  }

  /**
   * Altera o canal ativo no estúdio
   */
  static async setActiveChannel(channelId: string): Promise<DarkChannel> {
    const found = channelsStorage.find((ch) => ch.id === channelId);
    if (!found) {
      throw new Error(`Canal não encontrado: ${channelId}`);
    }
    activeChannelId = channelId;
    return { ...found, isPrimary: true };
  }

  /**
   * Adiciona um novo canal dark à rede do criador
   */
  static async createChannel(
    data: Omit<DarkChannel, "id" | "isPrimary" | "totalViews">
  ): Promise<DarkChannel> {
    const newId = `channel-${Date.now()}`;
    const newChannel: DarkChannel = {
      ...data,
      id: newId,
      totalViews: 0,
      isPrimary: false,
    };
    channelsStorage.push(newChannel);
    return newChannel;
  }

  /**
   * Retorna o status das integrações de produção e APIs de terceiros
   */
  static async getApiIntegrationsStatus(): Promise<ApiServiceStatus[]> {
    const maskKey = (key?: string) => {
      if (!key || key.length < 8) return "••••••••••••";
      return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
    };

    return [
      {
        service: "openai",
        name: "OpenAI GPT-4o (Roteirização & Pesquisa)",
        configured: Boolean(process.env.OPENAI_API_KEY || customApiKeys.openai),
        source: customApiKeys.openai
          ? "CUSTOM_BYOK"
          : process.env.OPENAI_API_KEY
            ? "ENVIRONMENT"
            : "LOOPX_VAULT",
        maskedKey: maskKey(customApiKeys.openai || process.env.OPENAI_API_KEY || "lx-sk-vault-ai-987"),
      },
      {
        service: "google_ai_studio",
        name: "Google AI Studio (Narração Neural Hiper-realista Gemini)",
        configured: Boolean(
          process.env.GOOGLE_AI_STUDIO_API_KEY ||
          process.env.GEMINI_API_KEY ||
          customApiKeys.google_ai_studio
        ),
        source: customApiKeys.google_ai_studio
          ? "CUSTOM_BYOK"
          : (process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY)
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(
          customApiKeys.google_ai_studio ||
          process.env.GOOGLE_AI_STUDIO_API_KEY ||
          process.env.GEMINI_API_KEY ||
          "AIzaSy-vault-google-tts-456"
        ),
      },
      {
        service: "unsplash",
        name: "Unsplash API (Acervo 4K de Imagens Cinematográficas)",
        configured: Boolean(process.env.UNSPLASH_ACCESS_KEY || customApiKeys.unsplash),
        source: customApiKeys.unsplash
          ? "CUSTOM_BYOK"
          : process.env.UNSPLASH_ACCESS_KEY
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(customApiKeys.unsplash || process.env.UNSPLASH_ACCESS_KEY || "un-unsplash-vault-4k-5566"),
      },
      {
        service: "youtube",
        name: "YouTube Data API v3 (Publicação Automática)",
        configured: Boolean(process.env.YOUTUBE_CLIENT_ID || customApiKeys.youtube),
        source: customApiKeys.youtube
          ? "CUSTOM_BYOK"
          : process.env.YOUTUBE_CLIENT_ID
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(customApiKeys.youtube || process.env.YOUTUBE_CLIENT_ID || "lx-yt-oauth-v3-001"),
      },
    ];
  }

  /**
   * Salva chave de API customizada (Bring Your Own Key)
   */
  static async setCustomApiKey(service: string, key: string): Promise < boolean > {
  if(!service || !key) return false;
customApiKeys[service.toLowerCase()] = key.trim();
return true;
  }
}
