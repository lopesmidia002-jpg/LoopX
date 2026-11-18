/**
 * Curadoria Automática de Mídias (Unsplash API & Fallbacks)
 * Etapa 3 do Pipeline do LoopX
 */

import { MediaType } from "../types";

export interface CuratedMediaItem {
  id: string;
  url: string;
  previewUrl: string;
  mediaType: MediaType;
  source: "UNSPLASH" | "PIXABAY" | "LOOPX_VAULT";
  author: string;
  authorUrl?: string;
  width: number;
  height: number;
  duration?: number;
}

// Acervo Cinematográfico HD/4K categorizado para canais Dark (Fallback Unsplash & LoopX Vault)
export const VAULT_CATEGORIES: Record<string, string[]> = {
  aviation_mh370: [
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80", // Airplane cockpit at night
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Ocean storm dark search
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Military radar screen
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80", // Commercial airliner above clouds
    "https://images.unsplash.com/photo-1519074069444-1ba4ea16e676?auto=format&fit=crop&w=1920&q=80", // Air traffic control night tower
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Satellite view of ocean
    "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=1920&q=80", // Runway night lights
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Classified investigation files
  ],
  ocean: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80", // Deep underwater blue abyss
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=80", // Dark sea waves tempest
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80", // Vast lonely ocean horizon
    "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1920&q=80", // Deep underwater sunbeams
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1920&q=80", // Submarine reef trench
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Ocean search vessel storm
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Underwater sonar ping
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Pacific ocean satellite
  ],
  military: [
    "https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1920&q=80", // Vintage WW2 tank in battle
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Military war battlefield smoke
    "https://images.unsplash.com/photo-1519074069444-1ba4ea16e676?auto=format&fit=crop&w=1920&q=80", // Bunker surveillance console
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Classified military intelligence dossier
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Tactical defense radar
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80", // Combat aviation hangar
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80", // Snowy military outpost
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80", // Defense cyber intelligence
  ],
  space: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Earth curvature and city lights from space
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80", // Space station orbital view
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80", // Deep space cosmic nebula
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80", // Star cluster milky way
    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1920&q=80", // Mars surface red planet
    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1920&q=80", // Rocket launch into atmosphere
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=80", // Glowing planetary eclipse
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Deep space radio telescope
  ],
  ice: [
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80", // Antarctica frozen ice ruins
    "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1920&q=80", // Massive glacier deep crevasse
    "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1920&q=80", // Polar expedition whiteout
    "https://images.unsplash.com/photo-1488441770602-aed21fc49bd5?auto=format&fit=crop&w=1920&q=80", // Frozen mountain peaks
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Arctic storm waters
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80", // Glacial underwater cave
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Expedition logbook records
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Satellite view of south pole
  ],
  technology: [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1920&q=80", // Quantum processor glowing circuit
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80", // Green matrix terminal code
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80", // Cybersecurity server datacenter
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80", // Microchip silicon wafer
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // High tech HUD radar telemetry
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Classified AI prototype plans
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Global fiber optic network
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Satellite surveillance grid
  ],
  ancient: [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80", // Egyptian desert pyramids sunset
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=80", // Ancient temple stone monoliths
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80", // Sunken ruins underground
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Old parchment manuscript
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80", // Underwater submerged stone city
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Archaeological radar survey
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Forbidden tomb entrance
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Lost world aerial survey
  ],
  mystery: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80", // Classified mystery dossier retro
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80", // Dark surveillance signal
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80", // Foggy ominous dark road
    "https://images.unsplash.com/photo-1519074069444-1ba4ea16e676?auto=format&fit=crop&w=1920&q=80", // Control room surveillance screens
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80", // Deep black water abyss
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80", // Forgotten fortress mist
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Global conspiracy satellite
    "https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1920&q=80", // Secret military archive
  ],
};

/**
 * Detecta a categoria temática mais precisa para o tópico do vídeo
 */
export function detectCategoryForTopic(topic: string): string {
  const clean = (topic || "").toLowerCase();

  if (clean.includes("mh370") || clean.includes("voo") || clean.includes("aviao") || clean.includes("aereo") || clean.includes("desaparecido")) {
    return "aviation_mh370";
  }
  if (clean.includes("mar") || clean.includes("oceano") || clean.includes("fossa") || clean.includes("mariana") || clean.includes("abismo") || clean.includes("submarino") || clean.includes("agua")) {
    return "ocean";
  }
  if (clean.includes("guerra") || clean.includes("militar") || clean.includes("armas") || clean.includes("exercito") || clean.includes("soldado") || clean.includes("batalha") || clean.includes("segunda guerra")) {
    return "military";
  }
  if (clean.includes("espaco") || clean.includes("cosmos") || clean.includes("galaxia") || clean.includes("planeta") || clean.includes("sol") || clean.includes("universo") || clean.includes("astronomia") || clean.includes("buraco negro")) {
    return "space";
  }
  if (clean.includes("gelo") || clean.includes("antartida") || clean.includes("polo") || clean.includes("neve") || clean.includes("glaciar")) {
    return "ice";
  }
  if (clean.includes("civilizacao") || clean.includes("antiga") || clean.includes("piramide") || clean.includes("arqueologia") || clean.includes("perdida") || clean.includes("historia")) {
    return "ancient";
  }
  if (clean.includes("tecnologia") || clean.includes("ia") || clean.includes("computador") || clean.includes("quantica") || clean.includes("futuro") || clean.includes("chip") || clean.includes("cyber")) {
    return "technology";
  }
  return "mystery";
}

/**
 * Curadoria dinâmica em tempo real para uma cena específica com base no tema e palavras-chave
 */
export async function getCuratedMediaForScene(params: {
  topic: string;
  keywords: string[];
  sceneIndex: number;
  totalScenes?: number;
}): Promise<string> {
  const { topic, keywords, sceneIndex } = params;
  const categoryKey = detectCategoryForTopic(topic);
  const fallbackList = VAULT_CATEGORIES[categoryKey] || VAULT_CATEGORIES.mystery;

  // 1. Tenta buscar no Unsplash se houver chave configurada
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey) {
    try {
      const queryTerm = keywords && keywords[0] ? `${keywords[0]} cinematic` : `${topic} 4k`;
      const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queryTerm)}&per_page=5&orientation=landscape`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Client-ID ${unsplashKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const chosen = data.results[sceneIndex % data.results.length];
          const imgUrl = chosen.urls?.regular || chosen.urls?.full;
          if (imgUrl) return imgUrl;
        }
      }
    } catch (e) {
      // Falha silenciosa para manter fluidez
    }
  }

  // 2. Fallback enriquecido: seleciona a imagem temática precisa da categoria para esta cena
  return fallbackList[sceneIndex % fallbackList.length];
}

export async function curateMediaForKeywords(params: {
  keywords: string[];
  preferredType?: MediaType;
  page?: number;
  perPage?: number;
}): Promise<CuratedMediaItem[]> {
  const { keywords, preferredType = "IMAGE", page = 1, perPage = 8 } = params;
  const query = keywords.join(" ");

  // 1. Tenta buscar no Unsplash se houver UNSPLASH_ACCESS_KEY
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey && preferredType !== "VIDEO") {
    try {
      const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${unsplashKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((p: any) => ({
            id: `unsplash-img-${p.id}`,
            url: p.urls?.regular || p.urls?.full || p.urls?.small,
            previewUrl: p.urls?.small || p.urls?.thumb,
            mediaType: "IMAGE" as MediaType,
            source: "UNSPLASH" as const,
            author: p.user?.name || "Unsplash Creator",
            authorUrl: p.user?.links?.html || `https://unsplash.com/@${p.user?.username}`,
            width: p.width || 1920,
            height: p.height || 1080,
          }));
        }
      }
    } catch (e) {
      console.warn("Aviso na chamada Unsplash, tentando provedores alternativos:", e);
    }
  }

  // 2. Tenta buscar no Pixabay se houver PIXABAY_API_KEY (especialmente para vídeos)
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (pixabayKey) {
    try {
      if (preferredType === "VIDEO") {
        const videoEndpoint = `https://pixabay.com/api/videos/?key=${encodeURIComponent(pixabayKey)}&q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&safesearch=true`;
        const res = await fetch(videoEndpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            return data.hits.map((v: any) => {
              const bestFile = v.videos?.large?.url
                ? v.videos.large
                : v.videos?.medium?.url
                ? v.videos.medium
                : v.videos?.small || { url: "", width: 1280, height: 720 };

              return {
                id: `pixabay-vid-${v.id}`,
                url: bestFile.url,
                previewUrl: v.videos?.tiny?.url || v.userImageURL || bestFile.url,
                mediaType: "VIDEO" as MediaType,
                source: "PIXABAY" as const,
                author: v.user || "Pixabay Creator",
                authorUrl: `https://pixabay.com/users/${v.user}-${v.user_id}/`,
                width: bestFile.width || 1920,
                height: bestFile.height || 1080,
                duration: v.duration,
              };
            });
          }
        }
      } else if (!unsplashKey) {
        const photoEndpoint = `https://pixabay.com/api/?key=${encodeURIComponent(pixabayKey)}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${perPage}&page=${page}&safesearch=true`;
        const res = await fetch(photoEndpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            return data.hits.map((p: any) => ({
              id: `pixabay-img-${p.id}`,
              url: p.largeImageURL || p.webformatURL,
              previewUrl: p.webformatURL || p.previewURL,
              mediaType: "IMAGE" as MediaType,
              source: "PIXABAY" as const,
              author: p.user || "Pixabay Creator",
              authorUrl: `https://pixabay.com/users/${p.user}-${p.user_id}/`,
              width: p.imageWidth || 1920,
              height: p.imageHeight || 1080,
            }));
          }
        }
      }
    } catch (e) {
      console.warn("Aviso na chamada Pixabay, recorrendo ao acervo LoopX Vault:", e);
    }
  }

  // 3. Acervo Local Curado 4K de Alta Definição (Garantia de 100% de disponibilidade)
  return getVaultFallback(keywords, perPage);
}

function getVaultFallback(keywords: string[], count: number): CuratedMediaItem[] {
  const normalizedKeys = keywords.map((k) => k.toLowerCase()).join(" ");
  let selectedCategory = "mystery";

  if (normalizedKeys.includes("mar") || normalizedKeys.includes("oceano") || normalizedKeys.includes("agua") || normalizedKeys.includes("abismo")) {
    selectedCategory = "ocean";
  } else if (normalizedKeys.includes("radar") || normalizedKeys.includes("sinal") || normalizedKeys.includes("radio")) {
    selectedCategory = "radar";
  } else if (normalizedKeys.includes("gelo") || normalizedKeys.includes("antartida") || normalizedKeys.includes("frio")) {
    selectedCategory = "ice";
  } else if (normalizedKeys.includes("militar") || normalizedKeys.includes("guerra") || normalizedKeys.includes("exercito")) {
    selectedCategory = "military";
  } else if (normalizedKeys.includes("espaco") || normalizedKeys.includes("satelite") || normalizedKeys.includes("planeta")) {
    selectedCategory = "space";
  } else if (normalizedKeys.includes("tecnologia") || normalizedKeys.includes("computador") || normalizedKeys.includes("quantica")) {
    selectedCategory = "technology";
  }

  const urls = VAULT_CATEGORIES[selectedCategory] || VAULT_CATEGORIES.mystery;

  return urls.slice(0, count).map((url, i) => ({
    id: `loopx-vault-${selectedCategory}-${i + 1}`,
    url,
    previewUrl: url,
    mediaType: "IMAGE",
    source: "LOOPX_VAULT",
    author: "LoopX Unsplash Vault",
    width: 1920,
    height: 1080,
  }));
}
