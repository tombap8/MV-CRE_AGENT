import { NextResponse } from "next/server";
import { updateScene } from "@/lib/db/scenes";
import type { SceneEntry } from "@/lib/atlas/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patch: Partial<SceneEntry> = await request.json();
  const updated = updateScene(id, patch);

  if (!updated) {
    return NextResponse.json({ message: "씬을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ scene: updated });
}
