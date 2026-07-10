import type { PromptPart, ReferenceFileItem } from "@/lib/atlas/types";

export interface ResolvedPrompt {
  text: string;
  brokenParts: PromptPart[];
}

/**
 * Mentions are resolved by stable file ID, not frozen ordinal text — a mention
 * always finds the referenced image's CURRENT position in the array, so removing
 * or reordering other images never points a mention at the wrong file. If the
 * referenced image itself was removed, the mention is reported as broken.
 */
export function resolvePromptParts(parts: PromptPart[], images: ReferenceFileItem[]): ResolvedPrompt {
  const brokenParts: PromptPart[] = [];
  const text = parts
    .map((part) => {
      if (part.type === "text") return part.value;
      const liveIndex = images.findIndex((item) => item.id === part.refId);
      if (liveIndex === -1) {
        brokenParts.push(part);
        return "";
      }
      return `image ${liveIndex + 1}`;
    })
    .join("");

  return { text, brokenParts };
}

export function liveMentionLabel(
  part: { refId: string },
  images: ReferenceFileItem[]
): { label: string; broken: boolean } {
  const liveIndex = images.findIndex((item) => item.id === part.refId);
  if (liveIndex === -1) {
    return { label: "image (삭제됨)", broken: true };
  }
  return { label: `image ${liveIndex + 1}`, broken: false };
}
