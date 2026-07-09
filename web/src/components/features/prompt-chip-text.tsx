"use client";

import { useState } from "react";

export type PromptSegment = { text: string } | { chip: string[] };

export function PromptChipText({ segments }: { segments: PromptSegment[] }) {
  const [indices, setIndices] = useState<number[]>(() => segments.map(() => 0));

  return (
    <p className="leading-relaxed text-ink">
      {segments.map((seg, i) =>
        "chip" in seg ? (
          <button
            key={i}
            type="button"
            onClick={() =>
              setIndices((prev) => prev.map((v, j) => (j === i ? (v + 1) % seg.chip.length : v)))
            }
            className="mx-1 inline-flex rounded-full bg-coral-light px-2.5 py-0.5 text-sm font-medium text-coral-dark transition-colors hover:bg-coral-light/70"
          >
            {seg.chip[indices[i]]}
          </button>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  );
}
