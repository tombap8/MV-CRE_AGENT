import { NextResponse } from "next/server";
import { ATLAS_CONSOLE_BASE_URL, ENDPOINT_ASSETS } from "@/lib/atlas/config";
import { AtlasApiError, getAtlasApiKey, handleAtlasErrorResponse, toErrorResponsePayload } from "@/lib/atlas/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type: string = body?.type;
    const url: string = body?.url;

    if (!type || !url) {
      throw new AtlasApiError("자산 등록에 type과 url이 필요합니다.", 400);
    }

    const response = await fetch(`${ATLAS_CONSOLE_BASE_URL}${ENDPOINT_ASSETS}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAtlasApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, url }),
    });

    if (!response.ok) {
      await handleAtlasErrorResponse(response);
    }

    const data = await response.json();
    const assetId = data?.id ?? data?.data?.id;
    const status = data?.status ?? data?.data?.status ?? "Processing";
    if (!assetId) {
      throw new AtlasApiError("자산 등록 응답에서 ID를 가져오지 못했습니다.", 502);
    }

    return NextResponse.json({ assetId, status });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
