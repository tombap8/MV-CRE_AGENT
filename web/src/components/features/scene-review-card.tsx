"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SceneReviewCardProps {
  title: string;
  gradientClassName: string;
  acceptedLabel: string | null;
  onReview: () => void;
}

export function SceneReviewCard({
  title,
  gradientClassName,
  acceptedLabel,
  onReview,
}: SceneReviewCardProps) {
  const [pan, setPan] = useState<"left" | "right">("right");

  return (
    <div className="flex flex-col gap-4 rounded-xxl border border-hairline p-4">
      <div className={`h-40 w-full rounded-xl ${gradientClassName}`} />
      <h3 className="text-lg font-semibold text-ink">{title}</h3>

      <div className="flex items-center justify-center gap-1 rounded-full bg-surface p-1 text-sm">
        <button
          type="button"
          onClick={() => setPan("left")}
          className={`rounded-full px-4 py-1.5 font-medium ${
            pan === "left" ? "bg-canvas text-ink shadow-sm" : "text-steel"
          }`}
        >
          Pan Left
        </button>
        <button
          type="button"
          onClick={() => setPan("right")}
          className={`rounded-full px-4 py-1.5 font-medium ${
            pan === "right" ? "bg-canvas text-ink shadow-sm" : "text-steel"
          }`}
        >
          Pan Right
        </button>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-slate">Motion Intensity</span>
        <div className="flex items-center gap-3">
          <input type="range" min={1} max={10} defaultValue={6} className="w-full accent-brand-blue" />
          <span className="text-steel">10</span>
        </div>
      </label>

      {acceptedLabel ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-700">
          ✓ Clip Selected: {acceptedLabel}
        </span>
      ) : (
        <Button variant="primary" className="w-full" onClick={onReview}>
          Review Clips
        </Button>
      )}
    </div>
  );
}
