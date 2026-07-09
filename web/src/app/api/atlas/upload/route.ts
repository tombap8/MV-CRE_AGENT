import { NextResponse } from "next/server";
import {
  ATLAS_API_BASE_URL,
  ENDPOINT_UPLOAD_MEDIA,
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/atlas/config";
import { AtlasApiError, getAtlasApiKey, handleAtlasErrorResponse, toErrorResponsePayload } from "@/lib/atlas/server";

const SIZE_LIMIT_BY_KIND: Record<string, number> = {
  image: MAX_IMAGE_SIZE_BYTES,
  video: MAX_VIDEO_SIZE_BYTES,
  audio: MAX_AUDIO_SIZE_BYTES,
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "image");

    if (!(file instanceof File)) {
      throw new AtlasApiError("업로드할 파일이 없습니다.", 400);
    }

    const limit = SIZE_LIMIT_BY_KIND[kind] ?? MAX_IMAGE_SIZE_BYTES;
    if (file.size > limit) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const limitMb = (limit / (1024 * 1024)).toFixed(0);
      throw new AtlasApiError(`파일 크기(${sizeMb}MB)가 제한(${limitMb}MB)을 초과합니다.`, 400);
    }

    const upstreamForm = new FormData();
    upstreamForm.set("file", file, file.name);

    const response = await fetch(`${ATLAS_API_BASE_URL}${ENDPOINT_UPLOAD_MEDIA}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAtlasApiKey()}` },
      body: upstreamForm,
    });

    if (!response.ok) {
      await handleAtlasErrorResponse(response);
    }

    const data = await response.json();
    const fileUrl = data?.data?.url ?? data?.data?.file_url ?? data?.url;
    if (!fileUrl) {
      throw new AtlasApiError("파일 업로드는 성공했지만 URL을 가져오지 못했습니다.", 502);
    }

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
