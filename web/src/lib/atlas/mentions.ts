import type { PromptPart, ReferenceFileItem, ReferenceKind } from "@/lib/atlas/types";

export interface ResolvedPrompt {
  text: string;
  brokenParts: PromptPart[];
}

/**
 * Mentions are resolved by stable file ID, not frozen ordinal text — a mention
 * always finds the referenced file's CURRENT position in the array, so removing
 * or reordering other files never points a mention at the wrong file. If the
 * referenced file itself was removed, the mention is reported as broken.
 */
export function resolvePromptParts(
  parts: PromptPart[],
  images: ReferenceFileItem[],
  videos: ReferenceFileItem[],
  audios: ReferenceFileItem[]
): ResolvedPrompt {
  const listByKind: Record<ReferenceKind, ReferenceFileItem[]> = {
    image: images,
    video: videos,
    audio: audios,
  };

  const brokenParts: PromptPart[] = [];
  const text = parts
    .map((part) => {
      if (part.type === "text") return part.value;
      const liveIndex = listByKind[part.kind].findIndex((item) => item.id === part.refId);
      if (liveIndex === -1) {
        brokenParts.push(part);
        return "";
      }
      return `${part.kind} ${liveIndex + 1}`;
    })
    .join("");

  return { text, brokenParts };
}

export function liveMentionLabel(
  part: { kind: ReferenceKind; refId: string },
  images: ReferenceFileItem[],
  videos: ReferenceFileItem[],
  audios: ReferenceFileItem[]
): { label: string; broken: boolean } {
  const listByKind: Record<ReferenceKind, ReferenceFileItem[]> = {
    image: images,
    video: videos,
    audio: audios,
  };
  const liveIndex = listByKind[part.kind].findIndex((item) => item.id === part.refId);
  if (liveIndex === -1) {
    return { label: `${part.kind} (삭제됨)`, broken: true };
  }
  return { label: `${part.kind} ${liveIndex + 1}`, broken: false };
}
