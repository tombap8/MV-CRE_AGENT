import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { AtlasApiError, toErrorResponsePayload } from "@/lib/atlas/server";

function sanitizeFilenamePart(input: string): string {
  const cleaned = input
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9가-힣 _-]/g, "_")
    .trim()
    .replace(/\s+/g, "_");
  return cleaned || "video";
}

function buildTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url: string = body?.url;
    const label: string = body?.label ?? "video";

    if (!url) {
      throw new AtlasApiError("다운로드할 URL이 없습니다.", 400);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new AtlasApiError(`영상 다운로드에 실패했습니다. (코드: ${response.status})`, response.status);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `${buildTimestamp()}_${sanitizeFilenamePart(label)}.mp4`;

    const outputsDir = path.join(process.cwd(), "..", "outputs");
    await mkdir(outputsDir, { recursive: true });
    await writeFile(path.join(outputsDir, filename), buffer);

    return NextResponse.json({ localPath: `outputs/${filename}` });
  } catch (error) {
    const payload = toErrorResponsePayload(error);
    return NextResponse.json({ message: payload.message }, { status: payload.status });
  }
}
