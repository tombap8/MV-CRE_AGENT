"use client";

import { useState } from "react";
import { ClipReviewModal, type ClipVariant } from "@/components/features/clip-review-modal";
import { SceneReviewCard } from "@/components/features/scene-review-card";

interface Scene {
  id: string;
  title: string;
  gradientClassName: string;
  variants: ClipVariant[];
}

const SCENES: Scene[] = [
  {
    id: "scene-1",
    title: "Scene 1: Ancient Ruins",
    gradientClassName: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
    variants: [
      {
        id: "a",
        label: "Variant A",
        description: "Panning across the ruins with full camera motion.",
        gradientClassName: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
      },
      {
        id: "b",
        label: "Variant B",
        description: "Side panning across the ruins with full camera motion.",
        gradientClassName: "bg-gradient-to-br from-orange-300 via-amber-200 to-slate-600",
      },
    ],
  },
  {
    id: "scene-2",
    title: "Scene 2: City Lights",
    gradientClassName: "bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-950",
    variants: [
      {
        id: "a",
        label: "Variant A",
        description: "Slow push-in toward the skyline with subtle drift.",
        gradientClassName: "bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-950",
      },
      {
        id: "b",
        label: "Variant B",
        description: "Static wide shot with gentle parallax motion.",
        gradientClassName: "bg-gradient-to-br from-indigo-900 via-slate-800 to-black",
      },
    ],
  },
  {
    id: "scene-3",
    title: "Scene 3: Neon Pulse",
    gradientClassName: "bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500",
    variants: [
      {
        id: "a",
        label: "Variant A",
        description: "Fast rotating motion around the neon core.",
        gradientClassName: "bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-500",
      },
      {
        id: "b",
        label: "Variant B",
        description: "Pulsing zoom with rhythmic light bursts.",
        gradientClassName: "bg-gradient-to-br from-cyan-500 via-purple-600 to-fuchsia-500",
      },
    ],
  },
];

export default function ClipReviewPage() {
  const [openSceneId, setOpenSceneId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<Record<string, string>>({});

  const openScene = SCENES.find((scene) => scene.id === openSceneId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-4xl font-bold text-ink">Initial Clip Review</h1>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SCENES.map((scene) => {
          const acceptedVariantId = accepted[scene.id];
          const acceptedLabel = acceptedVariantId
            ? scene.variants.find((v) => v.id === acceptedVariantId)?.label ?? null
            : null;

          return (
            <SceneReviewCard
              key={scene.id}
              title={scene.title}
              gradientClassName={scene.gradientClassName}
              acceptedLabel={acceptedLabel}
              onReview={() => setOpenSceneId(scene.id)}
            />
          );
        })}
      </div>

      {openScene && (
        <ClipReviewModal
          sceneName={openScene.title}
          variants={openScene.variants}
          onClose={() => setOpenSceneId(null)}
          onAccept={(variantId) => {
            setAccepted((prev) => ({ ...prev, [openScene.id]: variantId }));
            setOpenSceneId(null);
          }}
        />
      )}
    </div>
  );
}
