export type SceneMode = "first-last" | "multi-reference";

export interface ReferenceFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export interface GenerationConfig {
  resolution: string;
  ratio: string;
  duration: number;
  bitrateMode: "standard" | "high";
  generateAudio: boolean;
  seed: number;
}

export interface GenerateFirstLastRequest {
  mode: "first-last";
  prompt: string;
  config: GenerationConfig;
  image?: string;
  lastImage?: string;
}

export interface GenerateMultiReferenceRequest {
  mode: "multi-reference";
  prompt: string;
  config: GenerationConfig;
  referenceImages?: string[];
}

export type GenerateRequest = GenerateFirstLastRequest | GenerateMultiReferenceRequest;

export interface GenerateResponse {
  predictionId: string;
}

export interface PredictionStatus {
  status: string;
  resultUrl: string | null;
  error: string | null;
}

export interface BalanceInfo {
  value: number;
  currency: string;
  cash: number;
  bonus: number;
}

export type SceneJobStatus = "idle" | "submitting" | "processing" | "succeeded" | "failed";

export type GenerationTarget = "existing" | "standalone";

export type PromptPart =
  | { type: "text"; value: string }
  | { type: "mention"; id: string; refId: string };

export interface SceneEntry {
  id: string;
  sceneName: string;
  gradientClassName: string;
  firstFrameImageUrl: string | null;
  isStandalone: boolean;
  jobStatus: SceneJobStatus;
  resultUrl: string | null;
  localPath: string | null;
  errorMessage: string | null;
}
