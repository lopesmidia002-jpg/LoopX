/**
 * Motor de Movimentação Cinematográfica (Ken Burns & Parallax 2.5D)
 * Etapa 6 do Pipeline do LoopX
 */

import { MotionEffect } from "../types";

export interface MotionConfig {
  effect: MotionEffect;
  durationSeconds: number;
  fps: number;
  width: number;
  height: number;
}

/**
 * Gera as instruções de filtro complexo do FFmpeg para animação cinematográfica
 */
export function getFFmpegMotionFilter(config: MotionConfig): string {
  const { effect, durationSeconds, fps = 30, width = 1920, height = 1080 } = config;
  const totalFrames = Math.round(durationSeconds * fps);

  switch (effect) {
    case "KEN_BURNS_ZOOM_IN":
      // Zoom in suave de 1.0x para 1.18x focado no centro
      return `zoompan=z='min(zoom+0.0012,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;

    case "KEN_BURNS_ZOOM_OUT":
      // Zoom out suave de 1.18x para 1.0x
      return `zoompan=z='if(lte(zoom,1.0),1.18,max(1.0,zoom-0.0012))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;

    case "KEN_BURNS_PAN_LEFT":
      // Panorâmica suave da direita para a esquerda
      return `zoompan=z=1.12:x='if(lte(on,-1),(x-1),x-0.8)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;

    case "KEN_BURNS_PAN_RIGHT":
      // Panorâmica suave da esquerda para a direita
      return `zoompan=z=1.12:x='if(lte(on,-1),(x+1),x+0.8)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;

    case "PARALLAX_25D":
      // Simulação de profundidade 2.5D com zoom progressivo e micro-shake sutil de câmera de cinema
      return `zoompan=z='min(zoom+0.0015,1.20)':x='iw/2-(iw/zoom/2)+sin(on/8)*4':y='ih/2-(ih/zoom/2)+cos(on/8)*2':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;

    case "STATIC":
    default:
      return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
  }
}

/**
 * Retorna classes CSS e keyframes correspondentes para renderização web/preview
 */
export function getCssMotionClass(effect: MotionEffect): string {
  switch (effect) {
    case "KEN_BURNS_ZOOM_IN":
      return "scale-[1.12] transition-transform duration-[8000ms] ease-out";
    case "KEN_BURNS_ZOOM_OUT":
      return "scale-100 transition-transform duration-[8000ms] ease-out";
    case "PARALLAX_25D":
      return "ken-burns-active scale-105";
    case "KEN_BURNS_PAN_RIGHT":
      return "translate-x-3 transition-transform duration-[8000ms] ease-out";
    case "KEN_BURNS_PAN_LEFT":
      return "-translate-x-3 transition-transform duration-[8000ms] ease-out";
    default:
      return "";
  }
}
