/**
 * Curadoria Automática de Mídias (Pexels & Unsplash APIs)
 * Etapa 3 do Pipeline do LoopX
 */

import { MediaType } from "../types";

export interface CuratedMediaItem {
  id: string;
  url: string;
  previewUrl: string;
  mediaType: MediaType;
  source: "PEXELS" | "UNSPLASH" | "LOOPX_VAULT";
  author: string;
  authorUrl?: string;
  width: number;
  height: number;
  duration?: number;
}

// Acervo Cinematográfico HD/4K categorizado para canais Dark (Fallback de Alta Resolução)
const VAULT_CATEGORIES: Record<string, string[]> = {
  ocean: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
  ],
  radar: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop",
  ],
  ice: [
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1600&auto=format&fit=crop",
  ],
  military: [
    "https://images.unsplash.com/photo-1579965342575-16428a7c8881?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1600&auto=format&fit=crop",
  ],
  space: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop",
  ],
  technology: [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
  ],
  mystery: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1600&auto=format&fit=crop",
  ],
};

export async function curateMediaForKeywords(params: {
  keywords: string[];
  preferredType?: MediaType;
  page?: number;
  perPage?: number;
}): Promise<CuratedMediaItem[]> {
  const { keywords, preferredType = "IMAGE", page = 1, perPage = 8 } = params;
  const query = keywords.join(" ");

  // 1. Tenta buscar no Pexels se houver PEXELS_API_KEY
  if (process.env.PEXELS_API_KEY) {
    try {
      const endpoint =
        preferredType === "VIDEO"
          ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`
          : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`;

      const response = await fetch(endpoint, {
        headers: { Authorization: process.env.PEXELS_API_KEY },
      });

      if (response.ok) {
        const data = await response.json();
        if (preferredType === "VIDEO" && data.videos?.length > 0) {
          return data.videos.map((v: any) => {
            const bestFile = v.video_files.find((f: any) => f.quality === "hd" && f.width >= 1280) || v.video_files[0];
            return {
              id: `pexels-vid-${v.id}`,
              url: bestFile.link,
              previewUrl: v.image,
              mediaType: "VIDEO" as MediaType,
              source: "PEXELS",
              author: v.user.name,
              authorUrl: v.user.url,
              width: v.width,
              height: v.height,
              duration: v.duration,
            };
          });
        } else if (data.photos?.length > 0) {
          return data.photos.map((p: any) => ({
            id: `pexels-img-${p.id}`,
            url: p.src.large2x || p.src.large,
            previewUrl: p.src.medium,
            mediaType: "IMAGE" as MediaType,
            source: "PEXELS",
            author: p.photographer,
            authorUrl: p.photographer_url,
            width: p.width,
            height: p.height,
          }));
        }
      }
    } catch (e) {
      console.warn("Aviso na chamada Pexels, recorrendo ao acervo LoopX:", e);
    }
  }

  // 2. Tenta buscar no Unsplash se houver UNSPLASH_ACCESS_KEY
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`,
        {
          headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results?.length > 0) {
          return data.results.map((p: any) => ({
            id: `unsplash-${p.id}`,
            url: p.urls.regular,
            previewUrl: p.urls.small,
            mediaType: "IMAGE" as MediaType,
            source: "UNSPLASH",
            author: p.user.name,
            authorUrl: p.user.links.html,
            width: p.width,
            height: p.height,
          }));
        }
      }
    } catch (e) {
      console.warn("Aviso na chamada Unsplash, recorrendo ao acervo LoopX:", e);
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
    author: "LoopX Curated Archive",
    width: 1920,
    height: 1080,
  }));
}
