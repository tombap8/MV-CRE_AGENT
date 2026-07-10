import {
  GENERATION_MAX_POLL_ATTEMPTS,
  GENERATION_POLL_INTERVAL_MS,
  TERMINAL_FAILURE_STATUSES,
  TERMINAL_SUCCESS_STATUSES,
} from "@/lib/atlas/config";
import type { BalanceInfo, GenerateRequest, PredictionStatus } from "@/lib/atlas/types";

export class AtlasClientError extends Error {}

async function parseJsonOrThrow(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AtlasClientError(data?.message ?? `요청이 실패했습니다. (코드: ${response.status})`);
  }
  return data;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? result);
    };
    reader.onerror = () => reject(new AtlasClientError("파일을 읽는 중 오류가 발생했습니다."));
    reader.readAsDataURL(file);
  });
}

/**
 * The reference-to-video model expects each reference_images entry to be a
 * valid `image_url`-shaped string (a data URI works), unlike the image-to-video
 * model's `image`/`last_image` fields which take a bare base64 payload.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new AtlasClientError("파일을 읽는 중 오류가 발생했습니다."));
    reader.readAsDataURL(file);
  });
}

export async function getBalance(): Promise<BalanceInfo> {
  const response = await fetch("/api/atlas/balance");
  return (await parseJsonOrThrow(response)) as BalanceInfo;
}

export async function downloadGeneratedVideo(url: string, label: string): Promise<string> {
  const response = await fetch("/api/atlas/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, label }),
  });
  const data = await parseJsonOrThrow(response);
  return data.localPath as string;
}

export async function submitGeneration(req: GenerateRequest): Promise<string> {
  const response = await fetch("/api/atlas/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const data = await parseJsonOrThrow(response);
  return data.predictionId as string;
}

export async function getGenerationStatus(predictionId: string): Promise<PredictionStatus> {
  const response = await fetch(`/api/atlas/generate/${predictionId}`);
  return (await parseJsonOrThrow(response)) as PredictionStatus;
}

export async function pollGenerationUntilComplete(
  predictionId: string,
  onStatusChange?: (status: string) => void
): Promise<string> {
  for (let attempt = 0; attempt < GENERATION_MAX_POLL_ATTEMPTS; attempt++) {
    const { status, resultUrl, error } = await getGenerationStatus(predictionId);
    onStatusChange?.(status);

    if (TERMINAL_SUCCESS_STATUSES.has(status)) {
      if (!resultUrl) throw new AtlasClientError("영상 생성은 완료됐지만 결과 URL을 가져오지 못했습니다.");
      return resultUrl;
    }
    if (TERMINAL_FAILURE_STATUSES.has(status)) {
      throw new AtlasClientError(error ?? "영상 생성에 실패했습니다.");
    }

    await new Promise((resolve) => setTimeout(resolve, GENERATION_POLL_INTERVAL_MS));
  }

  throw new AtlasClientError("영상 생성이 제한 시간 내에 완료되지 않았습니다.");
}
