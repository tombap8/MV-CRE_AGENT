import { NextResponse } from "next/server";
import { ATLAS_PUBLIC_BASE_URL, ENDPOINT_BALANCE } from "@/lib/atlas/config";
import { AtlasApiError, getAtlasApiKey, handleAtlasErrorResponse, toErrorResponsePayload } from "@/lib/atlas/server";

export async function GET() {
  try {
    const response = await fetch(`${ATLAS_PUBLIC_BASE_URL}${ENDPOINT_BALANCE}`, {
      headers: { Authorization: `Bearer ${getAtlasApiKey()}` },
    });

    if (!response.ok) {
      await handleAtlasErrorResponse(response);
    }

    const raw = await response.json();
    const available = raw?.available ?? {};
    const cash = raw?.cash ?? {};
    const bonus = raw?.bonus ?? {};

    if (available.value === undefined) {
      throw new AtlasApiError("잔액 정보를 가져올 수 없습니다. API 응답 형식을 확인해주세요.", 502);
    }

    return NextResponse.json({
      value: Number(available.value),
      currency: available.currency ?? "usd",
      cash: Number(cash.value ?? 0),
      bonus: Number(bonus.value ?? 0),
    });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
