export type SceneMode = "first-last" | "multi-reference";

export type ReferenceKind = "image" | "video" | "audio";

export type AssetStatus = "idle" | "uploading" | "registering" | "active" | "error";

export interface ReferenceFileItem {
  id: string;
  kind: ReferenceKind;
  file: File;
  previewUrl: string;
  assetStatus: AssetStatus;
  assetRef?: string;
  errorMessage?: string;
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
  referenceVideos?: string[];
  referenceAudios?: string[];
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

export interface AssetRegisterResponse {
  assetId: string;
  status: string;
}

export type SceneJobStatus = "idle" | "submitting" | "processing" | "succeeded" | "failed";

export type GenerationTarget = "existing" | "standalone";

export type PromptPart =
  | { type: "text"; value: string }
  | { type: "mention"; id: string; refId: string; kind: ReferenceKind };

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
