import type { ReferenceFileItem, ReferenceKind } from "@/lib/atlas/types";

export function createReferenceFileItem(kind: ReferenceKind, file: File): ReferenceFileItem {
  return {
    id: crypto.randomUUID(),
    kind,
    file,
    previewUrl: kind === "image" ? URL.createObjectURL(file) : "",
    assetStatus: kind === "image" ? "active" : "idle",
  };
}

export async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
