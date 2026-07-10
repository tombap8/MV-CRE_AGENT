export const ATLAS_API_BASE_URL = "https://api.atlascloud.ai/api/v1";
export const ATLAS_PUBLIC_BASE_URL = "https://api.atlascloud.ai/public/v1";

export const ENDPOINT_BALANCE = "/balance";

export const BALANCE_POLL_INTERVAL_MS = 5 * 60 * 1000;
export const BALANCE_LOW_THRESHOLD = 5;
export const BALANCE_CRITICAL_THRESHOLD = 1;

export const MODEL_IMAGE_TO_VIDEO = "bytedance/seedance-2.0/image-to-video";
export const MODEL_REFERENCE_TO_VIDEO = "bytedance/seedance-2.0/reference-to-video";

export const ENDPOINT_GENERATE_VIDEO = "/model/generateVideo";

export function predictionEndpoint(predictionId: string) {
  return `/model/prediction/${predictionId}`;
}

export const MAX_REFERENCE_IMAGES = 9;

export const MAX_IMAGE_SIZE_BYTES = 30 * 1024 * 1024;

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

export const GENERATION_POLL_INTERVAL_MS = 3000;
export const GENERATION_MAX_POLL_ATTEMPTS = 100;

export const TERMINAL_SUCCESS_STATUSES = new Set(["completed", "succeeded"]);
export const TERMINAL_FAILURE_STATUSES = new Set(["failed", "timeout"]);
