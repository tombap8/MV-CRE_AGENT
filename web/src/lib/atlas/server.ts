export class AtlasApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export function getAtlasApiKey(): string {
  const apiKey = process.env.ATLAS_API_KEY?.trim();
  if (!apiKey) {
    throw new AtlasApiError(
      "API 키가 설정되지 않았습니다. web/.env.local 파일에 ATLAS_API_KEY=... 를 추가해주세요.",
      500
    );
  }
  return apiKey;
}

export function buildAtlasHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getAtlasApiKey()}`,
    "Content-Type": "application/json",
  };
}

export async function handleAtlasErrorResponse(response: Response): Promise<never> {
  const code = response.status;
  let detail = "";
  try {
    const body = await response.json();
    detail = body?.message ?? "";
  } catch {
    detail = (await response.text().catch(() => "")).slice(0, 200);
  }

  if (code === 401 || code === 403) {
    throw new AtlasApiError(
      "API 키가 유효하지 않습니다. web/.env.local의 ATLAS_API_KEY를 확인해주세요.",
      code
    );
  }
  if (code === 429) {
    throw new AtlasApiError(
      "크레딧 잔액이 부족합니다. Atlas Cloud 콘솔에서 크레딧을 충전해주세요.",
      code
    );
  }
  if (code === 422) {
    throw new AtlasApiError(`요청 파라미터가 올바르지 않습니다. 상세: ${detail}`, code);
  }
  if (code >= 400 && code < 500) {
    throw new AtlasApiError(`요청 오류가 발생했습니다. (코드: ${code}) 상세: ${detail}`, code);
  }
  throw new AtlasApiError(
    `Atlas Cloud 서버 오류가 발생했습니다. (코드: ${code}) 상세: ${detail || "(응답 본문 없음)"} 잠시 후 다시 시도해주세요.`,
    code
  );
}

export function toErrorResponsePayload(error: unknown) {
  if (error instanceof AtlasApiError) {
    return { message: error.message, status: error.status };
  }
  return { message: "알 수 없는 오류가 발생했습니다.", status: 500 };
}
