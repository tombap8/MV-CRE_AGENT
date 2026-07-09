"use client";

import { useState } from "react";
import { useRef } from "react";
import { PipelineStepper } from "@/components/features/pipeline-stepper";
import { SceneCard, type Scene } from "@/components/features/scene-card";
import { LinkButton } from "@/components/ui/button";

const INITIAL_SCENES: Scene[] = [
  {
    id: "scene-1",
    lyricLabel: "Verse 1",
    bold: false,
    lyricLines: [
      "Neon lights are calling out my name",
      "Racing through a digital flame",
      "Static dreams light up the radio",
      "Every heartbeat starts to overflow",
    ],
    background: "Misty ancient ruins at sunrise",
    visualPrompt: "A lone figure walks through old stone columns",
    cameraMood: "Panning",
  },
  {
    id: "scene-2",
    lyricLabel: "Chorus",
    bold: true,
    lyricLines: [
      "We're alive in the afterglow",
      "Running wild where the neon flows",
      "Hold on tight, let the rhythm go",
      "This is our synthwave show",
    ],
    background: "Dynamic, glowing futuristic city skyline",
    visualPrompt: "Vibrant light trails of a flying vehicle",
    cameraMood: "Panning",
  },
  {
    id: "scene-3",
    lyricLabel: "Bridge",
    bold: false,
    lyricLines: [
      "Bring me back to that violet skyline",
      "Where the stars and the city align",
    ],
    background: "Surreal, dreamlike neon abstract landscape",
    visualPrompt: "Merging colors forming a swirling portal",
    cameraMood: "Zoom",
  },
];

export default function ScenarioPage() {
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const nextId = useRef(scenes.length + 1);

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    setScenes((prev) => {
      const fromIndex = prev.findIndex((s) => s.id === draggedId);
      const toIndex = prev.findIndex((s) => s.id === targetId);
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
  }

  function handleChange(id: string, patch: Partial<Scene>) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handleDelete(id: string) {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddScene() {
    const newScene: Scene = {
      id: `scene-${nextId.current++}`,
      lyricLabel: "New Section",
      bold: false,
      lyricLines: ["New lyric line here"],
      background: "",
      visualPrompt: "",
      cameraMood: "Panning",
    };
    setScenes((prev) => [...prev, newScene]);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-4xl font-bold text-ink">Scenario &amp; Scene Generation</h1>

      <div className="mt-6">
        <PipelineStepper currentStep={2} />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {scenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            isDragging={draggedId === scene.id}
            onDragStart={() => setDraggedId(scene.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(scene.id)}
            onDragEnd={() => setDraggedId(null)}
            onChange={(patch) => handleChange(scene.id, patch)}
            onDelete={() => handleDelete(scene.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAddScene}
          className="rounded-full border border-dashed border-hairline-strong px-5 py-2.5 text-sm font-medium text-steel hover:text-ink"
        >
          + Add Scene
        </button>

        <LinkButton href="/projects/new/storyboard" variant="primary">
          Continue to Storyboard
        </LinkButton>
      </div>
    </div>
  );
}
