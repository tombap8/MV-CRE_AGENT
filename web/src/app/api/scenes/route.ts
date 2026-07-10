import { NextResponse } from "next/server";
import { insertScene, listScenes } from "@/lib/db/scenes";
import type { SceneEntry } from "@/lib/atlas/types";

export async function GET() {
  return NextResponse.json({ scenes: listScenes() });
}

export async function POST(request: Request) {
  const scene: SceneEntry = await request.json();
  return NextResponse.json({ scene: insertScene(scene) });
}
