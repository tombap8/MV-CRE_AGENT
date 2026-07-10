export const ATLAS_API_BASE_URL = "https://api.atlascloud.ai/api/v1";
export const ATLAS_CONSOLE_BASE_URL = "https://console.atlascloud.ai/api/v1";

export const MODEL_IMAGE_TO_VIDEO = "bytedance/seedance-2.0/image-to-video";
export const MODEL_REFERENCE_TO_VIDEO = "bytedance/seedance-2.0/reference-to-video";

export const ENDPOINT_UPLOAD_MEDIA = "/model/uploadMedia";
export const ENDPOINT_GENERATE_VIDEO = "/model/generateVideo";

export function predictionEndpoint(predictionId: string) {
  return `/model/prediction/${predictionId}`;
}

export const ENDPOINT_ASSETS = "/sd/assets";

export function assetStatusEndpoint(assetId: string) {
  return `/sd/assets/${assetId}`;
}

export const MAX_REFERENCE_IMAGES = 9;
export const MAX_REFERENCE_VIDEOS = 3;
export const MAX_REFERENCE_AUDIOS = 3;

export const MAX_IMAGE_SIZE_BYTES = 30 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024;

export const MAX_VIDEO_DURATION_SEC = 15;
export const MAX_AUDIO_TOTAL_DURATION_SEC = 15;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/gif",
  "image/heic",
  "image/heif",
];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
export const ALLOWED_AUDIO_TYPES = ["audio/wav", "audio/mpeg", "audio/x-wav"];

export const ASSET_POLL_INTERVAL_MS = 3000;
export const ASSET_MAX_POLL_ATTEMPTS = 40;

export const GENERATION_POLL_INTERVAL_MS = 3000;
export const GENERATION_MAX_POLL_ATTEMPTS = 100;

export const TERMINAL_SUCCESS_STATUSES = new Set(["completed", "succeeded"]);
export const TERMINAL_FAILURE_STATUSES = new Set(["failed", "timeout"]);
