import { NextResponse } from "next/server";
import { ATLAS_API_BASE_URL, predictionEndpoint } from "@/lib/atlas/config";
import { buildAtlasHeaders, handleAtlasErrorResponse, toErrorResponsePayload } from "@/lib/atlas/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  try {
    const { predictionId } = await params;

    const response = await fetch(`${ATLAS_API_BASE_URL}${predictionEndpoint(predictionId)}`, {
      headers: buildAtlasHeaders(),
    });

    if (!response.ok) {
      await handleAtlasErrorResponse(response);
    }

    const data = await response.json();
    const record = data?.data ?? {};
    const outputs: string[] = record.outputs ?? [];

    return NextResponse.json({
      status: record.status ?? "processing",
      resultUrl: outputs[0] ?? null,
      error: record.error ?? record.message ?? null,
    });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
