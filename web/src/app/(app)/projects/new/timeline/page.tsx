"use client";

import { useRef, useState } from "react";
import { RedoIcon, SlidersIcon, UndoIcon } from "@/components/icons";
import { SceneLibraryGrid, type LibraryScene } from "@/components/features/scene-library-grid";
import { TimelineClipBlock } from "@/components/features/timeline-clip-block";
import { TimelineWaveform } from "@/components/features/timeline-waveform";
import { VideoPreviewPlayer } from "@/components/features/video-preview-player";
import { LinkButton } from "@/components/ui/button";

const LIBRARY_SCENES: LibraryScene[] = [
  {
    id: "ruins",
    title: "Scene 1: Ancient Ruins",
    gradientClassName: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
  },
  {
    id: "city",
    title: "Scene 2: Future City",
    gradientClassName: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950",
  },
  {
    id: "neon",
    title: "Scene 3: Neon Skyline",
    gradientClassName: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-400",
  },
  {
    id: "rooftop",
    title: "Scene 4: City Rooftop",
    gradientClassName: "bg-gradient-to-br from-slate-600 via-indigo-700 to-slate-900",
  },
  {
    id: "crowd",
    title: "Scene 5: Concert Crowd",
    gradientClassName: "bg-gradient-to-br from-amber-600 via-slate-700 to-slate-900",
  },
];

const MARKERS = [
  { label: "Verse", position: 2 },
  { label: "Chorus", position: 20 },
  { label: "Verse 2", position: 40 },
  { label: "Chorus 3", position: 65 },
  { label: "Verse 4", position: 86 },
];

interface TimelineClip {
  id: string;
  sceneId: string | null;
}

const INITIAL_TIMELINE: TimelineClip[] = [
  { id: "t1", sceneId: "ruins" },
  { id: "t2", sceneId: "city" },
  { id: "t3", sceneId: "city" },
  { id: "t4", sceneId: null },
  { id: "t5", sceneId: "ruins" },
  { id: "t6", sceneId: "city" },
  { id: "t7", sceneId: "neon" },
];

export default function TimelineEditorPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>(INITIAL_TIMELINE);
  const [activeSlotId, setActiveSlotId] = useState<string>("t4");
  const nextIdRef = useRef(INITIAL_TIMELINE.length + 1);

  function findScene(sceneId: string | null) {
    return sceneId ? LIBRARY_SCENES.find((s) => s.id === sceneId) ?? null : null;
  }

  function handleAddScene(sceneId: string) {
    setTimelineClips((prev) => {
      const activeIndex = prev.findIndex((c) => c.id === activeSlotId);
      if (activeIndex !== -1 && prev[activeIndex].sceneId === null) {
        const next = [...prev];
        next[activeIndex] = { ...next[activeIndex], sceneId };
        return next;
      }
      const newClip = { id: `t${nextIdRef.current++}`, sceneId };
      setActiveSlotId(newClip.id);
      return [...prev, newClip];
    });
  }

  return (
    <div className="flex flex-col pb-10">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-2">
        <VideoPreviewPlayer
          posterClassName={
            findScene(timelineClips[0]?.sceneId ?? null)?.gradientClassName ??
            "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500"
          }
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
        />
        <SceneLibraryGrid scenes={LIBRARY_SCENES} onAdd={handleAddScene} />
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-2">
          <ToolbarIconButton label="필터/효과">
            <SlidersIcon className="h-4 w-4" />
          </ToolbarIconButton>
          <ToolbarIconButton label="실행 취소">
            <UndoIcon className="h-4 w-4" />
          </ToolbarIconButton>
          <ToolbarIconButton label="다시 실행" disabled>
            <RedoIcon className="h-4 w-4" />
          </ToolbarIconButton>
        </div>

        <LinkButton href="/projects/new/output" variant="primary">
          Finish Editing
        </LinkButton>
      </div>

      <div className="w-full bg-primary px-6 py-6">
        <TimelineWaveform markers={MARKERS} playheadPosition={50} />

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {timelineClips.map((clip) => {
            const scene = findScene(clip.sceneId);
            return (
              <TimelineClipBlock
                key={clip.id}
                title={scene?.title ?? null}
                gradientClassName={scene?.gradientClassName ?? null}
                selected={activeSlotId === clip.id}
                onClick={() => setActiveSlotId(clip.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolbarIconButton({
  children,
  label,
  disabled = false,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-hairline-strong text-ink transition-colors ${
        disabled ? "opacity-40" : "hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
