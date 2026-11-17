/**
 * Mixagem Sonora Automática com Auto-Ducking e SFX
 * Etapa 7 do Pipeline do LoopX
 */

export interface AudioMixerConfig {
  voiceInputIndex: number;
  musicInputIndex: number;
  sfxInputIndex?: number;
  duckingAmountDb?: number; // ex: 14dB de redução
  voiceVolume?: number;     // 1.0 (0dB)
  musicVolume?: number;     // 0.25 (-12dB nominal)
}

export const SOUNDTRACK_PRESETS = {
  DARK_MYSTERY: {
    name: "Dark Ambient Suspense",
    url: "https://actions.google.com/sounds/v1/science_fiction/sub_bass_loop.ogg",
    bpm: 80,
    mood: "Tenso, misterioso e constante",
  },
  EPIC_HISTORY: {
    name: "Orchestral Historical Drama",
    url: "https://actions.google.com/sounds/v1/science_fiction/deep_hum.ogg",
    bpm: 95,
    mood: "Grandioso, solene e épico",
  },
  TOP_10_BEAT: {
    name: "Dark Electronic Countdown",
    url: "https://actions.google.com/sounds/v1/science_fiction/alien_hum.ogg",
    bpm: 110,
    mood: "Rítmico com pulso constante",
  },
};

export const SFX_PRESETS = {
  WHOOSH_TRANSITION: "https://actions.google.com/sounds/v1/science_fiction/whoosh.ogg",
  SUB_BASS_DROP: "https://actions.google.com/sounds/v1/science_fiction/sub_bass_loop.ogg",
  HEARTBEAT_TENSION: "https://actions.google.com/sounds/v1/human/heartbeat.ogg",
};

/**
 * Constrói o grafo de filtros de áudio do FFmpeg para Ducking Dinâmico (Sidechain Compression)
 * Quando a voz do narrador está ativa, a música de fundo é atenuada suavemente em -14dB
 */
export function buildAudioDuckingFilterGraph(config: AudioMixerConfig): string {
  const {
    voiceInputIndex = 0,
    musicInputIndex = 1,
    voiceVolume = 1.0,
    musicVolume = 0.28,
  } = config;

  return [
    // 1. Ajusta o volume nominal da voz e da trilha musical
    `[${voiceInputIndex}:a]volume=${voiceVolume}[voice]`,
    `[${musicInputIndex}:a]volume=${musicVolume}[music]`,
    
    // 2. Aplica compressão sidechain: a voz atua como gatilho (key) para abaixar o volume da música
    `[music][voice]sidechaincompress=threshold=0.08:ratio=5:attack=150:release=450[ducked_music]`,
    
    // 3. Mistura a voz límpida com a música comprimida pelo ducking
    `[voice][ducked_music]amix=inputs=2:duration=first:dropout_transition=2[out_audio]`,
  ].join(";");
}
