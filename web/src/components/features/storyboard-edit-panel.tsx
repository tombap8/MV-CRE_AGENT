"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { PromptChipText, type PromptSegment } from "@/components/features/prompt-chip-text";
import { Button } from "@/components/ui/button";

interface StoryboardEditPanelProps {
  frameKey: string;
  visualSegments: PromptSegment[];
  moodSegments: PromptSegment[];
  currentGradientClassName: string;
  variantGradientClassName: string;
  onClose: () => void;
  onAcceptVariant: () => void;
}

export function StoryboardEditPanel({
  frameKey,
  visualSegments,
  moodSegments,
  currentGradientClassName,
  variantGradientClassName,
  onClose,
  onAcceptVariant,
}: StoryboardEditPanelProps) {
  const [testOpen, setTestOpen] = useState(false);

  return (
    <div key={frameKey} className="flex flex-col gap-6 rounded-xxl border border-hairline p-6">
      <button
        type="button"
        onClick={onClose}
        className="self-start rounded-full border border-hairline-strong px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface"
      >
        Close Panel
      </button>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Modify prompt</span>
        <div className="rounded-xl border border-hairline-strong p-4">
          <PromptChipText segments={visualSegments} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setTestOpen((v) => !v)}
        className="flex items-center justify-between rounded-full border border-hairline-strong px-4 py-2.5 text-sm font-medium text-ink"
      >
        Test out here
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${testOpen ? "rotate-180" : ""}`} />
      </button>
      {testOpen && (
        <p className="rounded-lg bg-surface p-3 text-sm text-steel">
          이 프롬프트로 실시간 미리보기를 테스트할 수 있습니다.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink">Modify prompt</span>
        <div className="rounded-xl border border-hairline-strong p-4">
          <PromptChipText segments={moodSegments} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-ink">Image Variants</span>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className={`h-28 w-full rounded-lg ${currentGradientClassName}`} />
            <span className="text-sm text-ink">Current Version</span>
            <Button variant="secondary" className="w-full">
              Accept Variant
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`h-28 w-full rounded-lg ${variantGradientClassName}`} />
            <span className="text-sm text-ink">Variant 1</span>
            <Button variant="secondary" className="w-full" onClick={onAcceptVariant}>
              Accept Variant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
