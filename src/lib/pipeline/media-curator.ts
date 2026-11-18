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
const VAULT_CATEGORIES: Record<string, string[]> = {
  ocean: [
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1920&q=80",
  ],
  radar: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  ],
  ice: [
    "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1920&q=80",
  ],
  military: [
    "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519074069444-1ba4ea16e676?auto=format&fit=crop&w=1920&q=80",
  ],
  space: [
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  ],
  technology: [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80",
  ],
  mystery: [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
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
