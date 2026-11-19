/**
 * Motor de Áudio, Trilha Sonora Cinematográfica e Efeitos Sonoros (SFX)
 * LoopX Cinematic Audio Studio - Etapa 5 & Pós-Produção
 */

export interface BackgroundMusicTrack {
  id: string;
  name: string;
  genre: "DARK_MYSTERY" | "DEEP_ABYSS" | "CYBER_CONSPIRACY" | "ANCIENT_OCCULT" | "EPIC_TENSION";
  mood: string;
  url: string;
  recommendedVolume: number; // 0.0 a 1.0
  duckingVolume: number; // volume quando a voz neural estiver falando
}

export interface SoundEffectItem {
  id: string;
  name: string;
  category: "RADAR_SONAR" | "SUB_BASS_DROP" | "CINEMATIC_RISER" | "THUNDER_STORM" | "ATMOSPHERIC_WIND";
  keywords: string[];
  url: string;
  defaultVolume: number;
}

/**
 * Trilhas Sonoras Documentais Licenciadas Livres de Royalties para Canais Dark
 */
export const CINEMATIC_BACKGROUND_TRACKS: BackgroundMusicTrack[] = [
  {
    id: "track-dark-mystery-1",
    name: "Dark Mystery Drone (Conspiração & Arquivos Secretos)",
    genre: "DARK_MYSTERY",
    mood: "Tensão psicológica contínua e atmosfera opressiva",
    url: "https://actions.google.com/sounds/v1/science_fiction/deep_hum.ogg",
    recommendedVolume: 0.55,
    duckingVolume: 0.15,
  },
  {
    id: "track-deep-abyss-2",
    name: "Abismo Oceânico (Sub-Bass & Frequências Subaquáticas)",
    genre: "DEEP_ABYSS",
    mood: "Sensação de profundidade abissal e isolamento absoluto",
    url: "https://actions.google.com/sounds/v1/weather/ocean_wind_calm.ogg",
    recommendedVolume: 0.50,
    duckingVolume: 0.12,
  },
  {
    id: "track-cyber-conspiracy-3",
    name: "Radar & Satélites (Pulsos Tecnológicos Militares)",
    genre: "CYBER_CONSPIRACY",
    mood: "Radares de tráfego aéreo, códigos e interceptações",
    url: "https://actions.google.com/sounds/v1/science_fiction/alien_hum.ogg",
    recommendedVolume: 0.48,
    duckingVolume: 0.14,
  },
  {
    id: "track-ancient-occult-4",
    name: "Maldições Históricas (Atmosfera Sobrenatural)",
    genre: "ANCIENT_OCCULT",
    mood: "Ecos arqueológicos e mistérios esquecidos no tempo",
    url: "https://actions.google.com/sounds/v1/ambiences/wind_and_trees.ogg",
    recommendedVolume: 0.52,
    duckingVolume: 0.15,
  },
];

/**
 * Biblioteca de Efeitos Sonoros Diegéticos Cinematográficos (SFX)
 */
export const CINEMATIC_SFX_LIBRARY: SoundEffectItem[] = [
  {
    id: "sfx-radar-sonar",
    name: "Ping de Radar Militar & Sonar",
    category: "RADAR_SONAR",
    keywords: ["radar", "sonar", "militar", "console", "tela", "frequencia", "sinal", "transponder", "torre", "aeroporto"],
    url: "https://actions.google.com/sounds/v1/science_fiction/alien_spaceship_sonar.ogg",
    defaultVolume: 0.70,
  },
  {
    id: "sfx-sub-bass-drop",
    name: "Sub-Bass Drop Cinematográfico (Impacto & Revelação)",
    keywords: ["misterio", "segredo", "desaparecimento", "curva", "queda", "morte", "abismo", "choque", "desconhecido"],
    category: "SUB_BASS_DROP",
    url: "https://actions.google.com/sounds/v1/impacts/low_thud.ogg",
    defaultVolume: 0.85,
  },
  {
    id: "sfx-cinematic-riser",
    name: "Riser de Tensão Dramática",
    keywords: ["investigacao", "dossie", "arquivo", "satelite", "documento", "provas", "revelado", "conclusao"],
    category: "CINEMATIC_RISER",
    url: "https://actions.google.com/sounds/v1/science_fiction/force_field_hum.ogg",
    defaultVolume: 0.65,
  },
  {
    id: "sfx-thunder-storm",
    name: "Trovão Distante e Tempestade Noturna",
    keywords: ["oceano", "tempestade", "noite", "ondas", "navio", "mar", "marinha", "chuva", "busca"],
    category: "THUNDER_STORM",
    url: "https://actions.google.com/sounds/v1/weather/rolling_thunder.ogg",
    defaultVolume: 0.60,
  },
  {
    id: "sfx-atmospheric-wind",
    name: "Vento em Altitude Elevada / Cabine de Avião",
    keywords: ["aviao", "voo", "cabine", "altitude", "ceu", "turbulencia", "cockpit", "vento", "espaco"],
    category: "ATMOSPHERIC_WIND",
    url: "https://actions.google.com/sounds/v1/weather/high_altitude_wind.ogg",
    defaultVolume: 0.55,
  },
];

/**
 * Seleciona automaticamente o efeito sonoro diegético mais adequado para o contexto da cena
 */
export function getSuggestedSfxForScene(params: {
  keywords?: string[];
  narrationText?: string;
  sceneIndex?: number;
}): SoundEffectItem {
  const { keywords = [], narrationText = "", sceneIndex = 0 } = params;
  const combinedText = `${keywords.join(" ")} ${narrationText}`.toLowerCase();

  for (const sfx of CINEMATIC_SFX_LIBRARY) {
    if (sfx.keywords.some((kw) => combinedText.includes(kw.toLowerCase()))) {
      return sfx;
    }
  }

  // Fallback cíclico cinematográfico
  return CINEMATIC_SFX_LIBRARY[sceneIndex % CINEMATIC_SFX_LIBRARY.length];
}

/**
 * Calcula volumes de mixagem e Audio Ducking dinâmico
 */
export function calculateAudioDucking(params: {
  isSpeaking: boolean;
  baseVolume?: number;
  trackId?: string;
}): { bgmVolume: number; narrationVolume: number } {
  const { isSpeaking, baseVolume = 0.55, trackId } = params;
  const track = CINEMATIC_BACKGROUND_TRACKS.find((t) => t.id === trackId);
  const targetNormal = track?.recommendedVolume ?? baseVolume;
  const targetDucked = track?.duckingVolume ?? 0.15;

  return {
    bgmVolume: isSpeaking ? targetDucked : targetNormal,
    narrationVolume: 1.0,
  };
}
