import { NextResponse } from "next/server";
import { ATLAS_CONSOLE_BASE_URL, assetStatusEndpoint } from "@/lib/atlas/config";
import { getAtlasApiKey, handleAtlasErrorResponse, toErrorResponsePayload } from "@/lib/atlas/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    const response = await fetch(`${ATLAS_CONSOLE_BASE_URL}${assetStatusEndpoint(assetId)}`, {
      headers: { Authorization: `Bearer ${getAtlasApiKey()}` },
    });

    if (!response.ok) {
      await handleAtlasErrorResponse(response);
    }

    const data = await response.json();
    const status = data?.status ?? data?.data?.status ?? "Processing";

    return NextResponse.json({ assetId, status });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
