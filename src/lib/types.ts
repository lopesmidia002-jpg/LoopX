export type VideoFormat = "DOCUMENTARY" | "TOP_10";
export type Language = "PT_BR" | "EN" | "ES";
export type MediaType = "IMAGE" | "VIDEO";
export type RenderJobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED";
export type MotionEffect = 
  | "KEN_BURNS_ZOOM_IN"
  | "KEN_BURNS_ZOOM_OUT"
  | "KEN_BURNS_PAN_LEFT"
  | "KEN_BURNS_PAN_RIGHT"
  | "PARALLAX_25D"
  | "STATIC";

export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female";
  language: Language;
  tag: string;
  previewUrl: string;
  description: string;
}

export interface PipelineStageInfo {
  stage: number;
  name: string;
  shortDesc: string;
  detailedDesc: string;
  iconName: string;
  estimatedSeconds: number;
}

export interface SceneItem {
  id: string;
  sceneOrder: number;
  narrationText: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  motionEffect: MotionEffect;
  durationSeconds: number;
  keywords: string[];
  subtitles?: { word: string; start: number; end: number }[];
}

export interface PlanPricing {
  id: "STARTER" | "CREATOR" | "STUDIO" | "SCALE";
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number; // 10% discount
  minutesPerMonth: number;
  concurrentRenders: number;
  extraMinuteRate: number;
  popular?: boolean;
  priorityQueue?: boolean;
  features: string[];
}
