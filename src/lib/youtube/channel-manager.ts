/**
 * Gerenciador de Múltiplos Canais Dark do YouTube & Chaves de Produção
 * LoopX Multi-Channel Dark Network Manager
 */

import fs from "fs";
import path from "path";

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
  description?: string;
}

export interface ApiServiceStatus {
  service: "openai" | "google_ai_studio" | "elevenlabs" | "unsplash" | "pixabay" | "youtube";
  name: string;
  configured: boolean;
  source: "ENVIRONMENT" | "CUSTOM_BYOK" | "LOOPX_VAULT";
  maskedKey: string;
}

interface ChannelsStoreData {
  channels: DarkChannel[];
  activeChannelId: string;
  customApiKeys?: Record<string, string>;
}

// Arquivo de persistência local seguro (no container ou host)
const STORE_PATH =
  process.platform === "win32"
    ? path.join(process.cwd(), ".loopx-channels.json")
    : "/app/.loopx-channels.json";

const DEFAULT_CHANNELS: DarkChannel[] = [
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
    isPrimary: false,
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
  {
    id: "channel-4",
    name: "O Observador",
    handle: "@Oobservador-rw2gq",
    niche: "Mistérios & Casos Reais",
    subscribers: 95,
    totalViews: 1330,
    defaultVoiceId: "pt-br-marcos-deep",
    defaultFormat: "DOCUMENTARY",
    defaultLanguage: "PT_BR",
    autoPublish: false,
    avatarUrl: "https://yt3.googleusercontent.com/IxMnPAW6CR3sN_FHoc9gVNymv_u9LZmTYMJP1vuBtfYdEXoamus5ry6wZKRNY7GyrH6IlP2JMQ=s900-c-k-c0x00ffffff-no-rj",
    description: "O Observador - Sabedoria antiga para o caos moderno.",
    isPrimary: true,
  },
];

function loadStore(): ChannelsStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.channels) && parsed.channels.length > 0) {
        return parsed;
      }
    } else if (fs.existsSync("/tmp/loopx-channels.json")) {
      const content = fs.readFileSync("/tmp/loopx-channels.json", "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.channels) && parsed.channels.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Aviso ao ler .loopx-channels.json, usando padrão:", e);
  }
  return {
    channels: [...DEFAULT_CHANNELS],
    activeChannelId: "channel-4",
    customApiKeys: {},
  };
}

function saveStore(data: ChannelsStoreData): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    try {
      fs.writeFileSync("/tmp/loopx-channels.json", JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Aviso ao salvar .loopx-channels.json:", err);
    }
  }
}

// Memória em tempo de execução
let store: ChannelsStoreData = loadStore();

/**
 * Converte strings de inscritos como '148,5 mil', '1.2M', '95 inscritos' em número
 */
export function parseSubscribers(text: string): number {
  if (!text) return 0;
  const clean = text.toLowerCase().trim();

  // Ex: 148,5 mil ou 148.5 mil ou 148 mil
  const milMatch = clean.match(/([\d.,]+)\s*(?:mil|k)\b/i);
  if (milMatch) {
    const num = parseFloat(milMatch[1].replace(",", "."));
    return Math.round(num * 1000);
  }

  // Ex: 1,2 mi ou 1.2 m ou 1.2 milhões
  const miMatch = clean.match(/([\d.,]+)\s*(?:mi|m|milh)/i);
  if (miMatch) {
    const num = parseFloat(miMatch[1].replace(",", "."));
    return Math.round(num * 1000000);
  }

  // Ex: 95 inscritos ou 95
  const rawNum = clean.match(/[\d.,]+/);
  if (rawNum) {
    return parseInt(rawNum[0].replace(/[.,]/g, ""), 10) || 0;
  }

  return 0;
}

/**
 * Consulta metadados públicos reais do canal no YouTube a partir do @handle
 */
export async function fetchYouTubeChannelInfo(handle: string): Promise<{
  name?: string;
  avatarUrl?: string;
  subscribers?: number;
  description?: string;
}> {
  const cleanHandle = handle.trim().replace(/^@/, "");
  if (!cleanHandle) return {};

  try {
    const url = `https://www.youtube.com/@${cleanHandle}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!res.ok) return {};

    const html = await res.text();

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);

    // Extrai inscritos do JSON interno ou meta
    let subscribers = 0;
    const subsJsonMatch =
      html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\},"simpleText":"([^"]+)"\}/) ||
      html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/);

    if (subsJsonMatch) {
      subscribers = parseSubscribers(subsJsonMatch[2] || subsJsonMatch[1]);
    } else {
      const subsRegex = html.match(/([\d.,]+[KkMm]?\s*(?:inscritos|subscribers))/i);
      if (subsRegex) {
        subscribers = parseSubscribers(subsRegex[1]);
      }
    }

    return {
      name: titleMatch ? titleMatch[1].replace(/ - YouTube$/, "").trim() : undefined,
      avatarUrl: imageMatch ? imageMatch[1] : undefined,
      subscribers: subscribers || 0,
      description: descMatch ? descMatch[1] : undefined,
    };
  } catch (error) {
    console.warn(`[YouTube Fetch Warning] Falha ao consultar metadados para @${cleanHandle}:`, error);
    return {};
  }
}

export class ChannelManager {
  /**
   * Retorna a lista de canais dark vinculados
   */
  static async getChannels(): Promise<DarkChannel[]> {
    store = loadStore();
    return store.channels.map((ch) => ({
      ...ch,
      isPrimary: ch.id === store.activeChannelId,
    }));
  }

  /**
   * Retorna o canal atualmente ativo no estúdio
   */
  static async getActiveChannel(): Promise<DarkChannel> {
    store = loadStore();
    const active = store.channels.find((ch) => ch.id === store.activeChannelId);
    return active || store.channels[0] || DEFAULT_CHANNELS[0];
  }

  /**
   * Retorna um canal específico pelo seu ID
   */
  static async getChannelById(channelId: string): Promise<DarkChannel | null> {
    store = loadStore();
    return store.channels.find((ch) => ch.id === channelId) || null;
  }

  /**
   * Altera o canal ativo no estúdio e persiste a escolha
   */
  static async setActiveChannel(channelId: string): Promise<DarkChannel> {
    store = loadStore();
    const found = store.channels.find((ch) => ch.id === channelId);
    if (!found) {
      throw new Error(`Canal não encontrado: ${channelId}`);
    }
    store.activeChannelId = channelId;
    saveStore(store);
    return { ...found, isPrimary: true };
  }

  /**
   * Adiciona um novo canal dark à rede do criador, consultando os dados reais no YouTube
   */
  static async createChannel(
    data: Omit<DarkChannel, "id" | "isPrimary" | "totalViews">
  ): Promise<DarkChannel> {
    store = loadStore();

    // Consulta dados reais do canal no YouTube caso o handle seja fornecido
    let realName = data.name;
    let realAvatar = data.avatarUrl;
    let realSubscribers = data.subscribers || 0;
    let realDescription = data.description;

    if (data.handle) {
      const ytInfo = await fetchYouTubeChannelInfo(data.handle);
      if (ytInfo.avatarUrl) {
        realAvatar = ytInfo.avatarUrl;
      }
      if (typeof ytInfo.subscribers === "number" && ytInfo.subscribers > 0) {
        realSubscribers = ytInfo.subscribers;
      }
      if (
        ytInfo.name &&
        (!data.name ||
          data.name === data.handle ||
          data.name === data.handle.replace(/^@/, "") ||
          realName.startsWith("@"))
      ) {
        realName = ytInfo.name;
      }
      if (ytInfo.description) {
        realDescription = ytInfo.description;
      }
    }

    const newId = `channel-${Date.now()}`;
    const newChannel: DarkChannel = {
      ...data,
      id: newId,
      name: realName,
      avatarUrl: realAvatar,
      subscribers: realSubscribers,
      totalViews: realSubscribers > 0 ? realSubscribers * 14 : 0,
      description: realDescription,
      isPrimary: true,
    };

    // Remove canal com mesmo handle se já existia para atualizar dados
    store.channels = store.channels.filter(
      (c) => c.handle.toLowerCase() !== newChannel.handle.toLowerCase()
    );

    store.channels.push(newChannel);
    store.activeChannelId = newId;
    saveStore(store);

    return newChannel;
  }

  /**
   * Atualiza os dados reais do canal consultando novamente o YouTube
   */
  static async refreshChannel(channelId: string): Promise<DarkChannel> {
    store = loadStore();
    const ch = store.channels.find((c) => c.id === channelId);
    if (!ch) throw new Error("Canal não encontrado");

    if (ch.handle) {
      const ytInfo = await fetchYouTubeChannelInfo(ch.handle);
      if (ytInfo.avatarUrl) ch.avatarUrl = ytInfo.avatarUrl;
      if (typeof ytInfo.subscribers === "number" && ytInfo.subscribers > 0) {
        ch.subscribers = ytInfo.subscribers;
      }
      if (ytInfo.name) ch.name = ytInfo.name;
      if (ytInfo.description) ch.description = ytInfo.description;
      saveStore(store);
    }

    return { ...ch, isPrimary: ch.id === store.activeChannelId };
  }

  /**
   * Retorna o status das integrações de produção e APIs de terceiros
   */
  static async getApiIntegrationsStatus(): Promise<ApiServiceStatus[]> {
    store = loadStore();
    const customKeys = store.customApiKeys || {};

    // Auto-sanitização de segurança: Se a chave da OpenAI não for token sk-, remove automaticamente
    if (customKeys.openai && !customKeys.openai.startsWith("sk-")) {
      delete customKeys.openai;
      saveStore(store);
    }

    const maskKey = (key?: string) => {
      if (!key || key.length < 8) return "••••••••••••";
      return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
    };

    return [
      {
        service: "openai",
        name: "OpenAI GPT-4o (Roteirização & Pesquisa)",
        configured: Boolean(process.env.OPENAI_API_KEY || customKeys.openai),
        source: customKeys.openai
          ? "CUSTOM_BYOK"
          : process.env.OPENAI_API_KEY
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(customKeys.openai || process.env.OPENAI_API_KEY || "lx-sk-vault-ai-987"),
      },
      {
        service: "google_ai_studio",
        name: "Google AI Studio (Narração Neural Hiper-realista Gemini)",
        configured: Boolean(
          process.env.GOOGLE_AI_STUDIO_API_KEY ||
          process.env.GEMINI_API_KEY ||
          customKeys.google_ai_studio
        ),
        source: customKeys.google_ai_studio
          ? "CUSTOM_BYOK"
          : (process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY)
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(
          customKeys.google_ai_studio ||
          process.env.GOOGLE_AI_STUDIO_API_KEY ||
          process.env.GEMINI_API_KEY ||
          "AIzaSy-vault-google-tts-456"
        ),
      },
      {
        service: "unsplash",
        name: "Unsplash API (Acervo 4K de Imagens Cinematográficas)",
        configured: Boolean(process.env.UNSPLASH_ACCESS_KEY || customKeys.unsplash),
        source: customKeys.unsplash
          ? "CUSTOM_BYOK"
          : process.env.UNSPLASH_ACCESS_KEY
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(customKeys.unsplash || process.env.UNSPLASH_ACCESS_KEY || "un-unsplash-vault-4k-5566"),
      },
      {
        service: "youtube",
        name: "YouTube Data API v3 (Publicação Automática)",
        configured: Boolean(process.env.YOUTUBE_CLIENT_ID || customKeys.youtube),
        source: customKeys.youtube
          ? "CUSTOM_BYOK"
          : process.env.YOUTUBE_CLIENT_ID
          ? "ENVIRONMENT"
          : "LOOPX_VAULT",
        maskedKey: maskKey(customKeys.youtube || process.env.YOUTUBE_CLIENT_ID || "lx-yt-oauth-v3-001"),
      },
    ];
  }

  /**
   * Salva chave de API customizada (Bring Your Own Key) com validação estrita de formato
   */
  static async setCustomApiKey(
    service: string,
    key: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!service || !key) return { success: false, error: "Serviço e chave são obrigatórios" };
    const cleanKey = key.trim();
    const s = service.toLowerCase();

    // Validação estrita de formato da OpenAI
    if (s === "openai") {
      if (!cleanKey.startsWith("sk-") || cleanKey.length < 20) {
        return {
          success: false,
          error:
            "Chave da OpenAI inválida. Tokens de API da OpenAI sempre começam com 'sk-'. Não insira senhas pessoais ou de e-mail.",
        };
      }
    }

    // Validação estrita de formato da Google AI Studio
    if (s === "google_ai_studio" || s === "gemini") {
      if (!cleanKey.startsWith("AIza") && cleanKey.length < 20) {
        return {
          success: false,
          error:
            "Chave do Google AI Studio inválida. Chaves da Google Generative AI começam com 'AIza...'.",
        };
      }
    }

    store = loadStore();
    if (!store.customApiKeys) store.customApiKeys = {};
    store.customApiKeys[s] = cleanKey;
    saveStore(store);
    return { success: true };
  }

  /**
   * Remove uma chave personalizada e restaura o padrão do ambiente/Vault
   */
  static async removeCustomApiKey(service: string): Promise<boolean> {
    if (!service) return false;
    store = loadStore();
    if (store.customApiKeys && store.customApiKeys[service.toLowerCase()]) {
      delete store.customApiKeys[service.toLowerCase()];
      saveStore(store);
    }
    return true;
  }

  /**
   * Retorna uma chave customizada salva, se existir e for válida
   */
  static getCustomApiKey(service: string): string | undefined {
    store = loadStore();
    const key = store.customApiKeys?.[service.toLowerCase()];
    if (service.toLowerCase() === "openai" && key && !key.startsWith("sk-")) {
      // Auto-limpeza de senhas ou chaves inválidas salvas anteriormente
      if (store.customApiKeys) {
        delete store.customApiKeys.openai;
        saveStore(store);
      }
      return undefined;
    }
    return key;
  }
}
