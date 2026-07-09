"use client";

import { useState } from "react";
import { ConfigSummaryCard } from "@/components/features/config-summary-card";
import { GenerationProgressModal } from "@/components/features/generation-progress-modal";
import { StyleCard, type StyleTone } from "@/components/features/style-card";
import { Button } from "@/components/ui/button";

interface StyleOption {
  id: string;
  title: string;
  tone: StyleTone;
  gradientClassName: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "anime",
    title: "Anime Style",
    tone: "teal",
    gradientClassName: "bg-gradient-to-br from-slate-800 via-orange-500 to-rose-500",
  },
  {
    id: "realistic",
    title: "Realistic Render",
    tone: "coral",
    gradientClassName: "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-700",
  },
  {
    id: "abstract",
    title: "Abstract Flows",
    tone: "rose",
    gradientClassName: "bg-gradient-to-br from-pink-400 via-fuchsia-400 to-sky-400",
  },
  {
    id: "retro",
    title: "Retro Film",
    tone: "rose",
    gradientClassName: "bg-gradient-to-br from-amber-300 via-rose-400 to-purple-500",
  },
  {
    id: "neon",
    title: "Neon Waves",
    tone: "teal",
    gradientClassName: "bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500",
  },
  {
    id: "cinematic",
    title: "Cinematic Look",
    tone: "coral",
    gradientClassName: "bg-gradient-to-br from-slate-900 via-amber-700 to-slate-700",
  },
];

export default function StyleSelectionPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <>
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 transition-all lg:grid-cols-[1fr_360px] ${
          isGenerating ? "pointer-events-none opacity-40 grayscale" : ""
        }`}
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-ink">Visual Style Selection</h1>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STYLE_OPTIONS.map((option) => (
              <StyleCard
                key={option.id}
                title={option.title}
                tone={option.tone}
                gradientClassName={option.gradientClassName}
                selected={selectedId === option.id}
                onSelect={() => setSelectedId(option.id)}
              />
            ))}
          </div>
        </div>

        <ConfigSummaryCard
          musicTitle="Synthwave Dreams"
          musicFile="uploaded_file.wav"
          tags={["Synthwave", "115 BPM", "Retro", "Energetic"]}
          footer={
            selectedId ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setIsGenerating(true)}
              >
                Start Video Generation
              </Button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-hairline px-6 py-3 text-sm font-medium text-muted"
              >
                스타일을 먼저 선택하세요
              </button>
            )
          }
        />
      </div>

      {isGenerating && (
        <GenerationProgressModal
          clipCount={4}
          progress={65}
          etaLabel="2m 15s"
          onCancel={() => setIsGenerating(false)}
        />
      )}
    </>
  );
}
