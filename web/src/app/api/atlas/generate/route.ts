import { NextResponse } from "next/server";
import { ATLAS_API_BASE_URL, ENDPOINT_GENERATE_VIDEO, MODEL_IMAGE_TO_VIDEO, MODEL_REFERENCE_TO_VIDEO } from "@/lib/atlas/config";
import { AtlasApiError, buildAtlasHeaders, handleAtlasErrorResponse, toErrorResponsePayload } from "@/lib/atlas/server";
import type { GenerateRequest } from "@/lib/atlas/types";

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body?.mode || !body?.config) {
      throw new AtlasApiError("요청에 mode와 config가 필요합니다.", 400);
    }

    const { config } = body;
    const payload: Record<string, unknown> = {
      prompt: body.prompt,
      duration: config.duration,
      resolution: config.resolution,
      ratio: config.ratio,
      bitrate_mode: config.bitrateMode,
      generate_audio: config.generateAudio,
      seed: config.seed,
      watermark: false,
      return_last_frame: false,
    };

    if (body.mode === "first-last") {
      payload.model = MODEL_IMAGE_TO_VIDEO;
      if (body.image) payload.image = body.image;
      if (body.lastImage) payload.last_image = body.lastImage;
    } else if (body.mode === "multi-reference") {
      payload.model = MODEL_REFERENCE_TO_VIDEO;
      if (body.referenceImages?.length) payload.reference_images = body.referenceImages;
    } else {
      throw new AtlasApiError("알 수 없는 생성 모드입니다.", 400);
    }

    const response = await fetch(`${ATLAS_API_BASE_URL}${ENDPOINT_GENERATE_VIDEO}`, {
      method: "POST",
      headers: buildAtlasHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleAtlasErrorResponse(response);
    }

    const data = await response.json();
    const predictionId = data?.data?.id ?? data?.id;
    if (!predictionId) {
      throw new AtlasApiError("서버에서 prediction ID를 받지 못했습니다.", 502);
    }

    return NextResponse.json({ predictionId });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
