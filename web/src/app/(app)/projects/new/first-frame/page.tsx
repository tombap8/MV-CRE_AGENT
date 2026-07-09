"use client";

import { useState } from "react";
import { MotionControlCard } from "@/components/features/motion-control-card";
import type { Direction } from "@/components/features/motion-direction-pad";
import { PipelineStepper } from "@/components/features/pipeline-stepper";
import { LinkButton } from "@/components/ui/button";

interface SceneMotion {
  id: string;
  sceneName: string;
  gradientClassName: string;
  direction: Direction;
  intensity: number;
  speed: number;
}

const INITIAL_SCENES: SceneMotion[] = [
  {
    id: "ruins",
    sceneName: "Scene 1: Ancient Ruins",
    gradientClassName: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
    direction: "Pan Right",
    intensity: 5,
    speed: 5,
  },
  {
    id: "city",
    sceneName: "Scene 2: Future City",
    gradientClassName: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950",
    direction: "Tilt Up",
    intensity: 6,
    speed: 6,
  },
  {
    id: "rooftop",
    sceneName: "Scene 3: City Rooftop",
    gradientClassName: "bg-gradient-to-br from-slate-600 via-indigo-700 to-slate-900",
    direction: "Pan Left",
    intensity: 4,
    speed: 4,
  },
  {
    id: "neon",
    sceneName: "Scene 4: Neon Skyline",
    gradientClassName: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-400",
    direction: "Tilt Up",
    intensity: 8,
    speed: 7,
  },
  {
    id: "crowd",
    sceneName: "Scene 5: Concert Crowd",
    gradientClassName: "bg-gradient-to-br from-amber-600 via-slate-700 to-slate-900",
    direction: "Pan Right",
    intensity: 6,
    speed: 5,
  },
];

export default function FirstFramePage() {
  const [scenes, setScenes] = useState<SceneMotion[]>(INITIAL_SCENES);

  function patchScene(id: string, patch: Partial<SceneMotion>) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-24">
      <h1 className="text-4xl font-bold text-ink">Initial Clip Motion Control</h1>

      <div className="mt-6">
        <PipelineStepper currentStep={4} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {scenes.map((scene) => (
          <MotionControlCard
            key={scene.id}
            sceneName={scene.sceneName}
            gradientClassName={scene.gradientClassName}
            direction={scene.direction}
            intensity={scene.intensity}
            speed={scene.speed}
            onDirectionChange={(direction) => patchScene(scene.id, { direction })}
            onIntensityChange={(intensity) => patchScene(scene.id, { intensity })}
            onSpeedChange={(speed) => patchScene(scene.id, { speed })}
          />
        ))}
      </div>

      <div className="fixed bottom-6 right-6">
        <LinkButton href="/projects/new/timeline" variant="primary">
          Generate All Video Clips
        </LinkButton>
      </div>
    </div>
  );
}
