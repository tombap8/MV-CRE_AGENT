import { ChevronDownIcon, CloseIcon, GripIcon } from "@/components/icons";

const CAMERA_MOODS = ["Panning", "Tilting", "Zoom"];

export interface Scene {
  id: string;
  lyricLabel: string;
  lyricLines: string[];
  bold: boolean;
  background: string;
  visualPrompt: string;
  cameraMood: string;
}

interface SceneCardProps {
  scene: Scene;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onChange: (patch: Partial<Scene>) => void;
  onDelete: () => void;
}

export function SceneCard({
  scene,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onChange,
  onDelete,
}: SceneCardProps) {
  const quote = scene.lyricLines[0].slice(0, 22);

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative grid grid-cols-1 gap-6 rounded-xxl border border-hairline p-6 transition-opacity lg:grid-cols-[24px_1.1fr_1fr_1fr_0.9fr] ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <button
        type="button"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-label="씬 순서 변경"
        className="flex cursor-grab items-start justify-center pt-1 text-steel active:cursor-grabbing"
      >
        <GripIcon />
      </button>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-ink">
          Lyric mapping: <span className="font-normal">&quot;{quote}...&quot;</span>
        </span>
        <div className={`rounded-lg bg-surface p-3 text-sm text-charcoal ${scene.bold ? "font-bold" : ""}`}>
          {scene.lyricLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-ink">Background Description</span>
        <textarea
          value={scene.background}
          onChange={(e) => onChange({ background: e.target.value })}
          className="h-full min-h-20 resize-none rounded-lg border border-hairline-strong p-3 text-sm text-ink outline-none focus:border-brand-blue"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-ink">Visual Prompt</span>
        <textarea
          value={scene.visualPrompt}
          onChange={(e) => onChange({ visualPrompt: e.target.value })}
          className="h-full min-h-20 resize-none rounded-lg border border-hairline-strong p-3 text-sm text-ink outline-none focus:border-brand-blue"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-ink">Camera Mood</span>
        <span className="relative">
          <select
            value={scene.cameraMood}
            onChange={(e) => onChange({ cameraMood: e.target.value })}
            className="w-full appearance-none rounded-lg border border-hairline-strong bg-canvas p-3 text-sm text-ink"
          >
            {CAMERA_MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
        </span>
      </div>

      <button
        type="button"
        onClick={onDelete}
        aria-label="씬 삭제"
        className="absolute right-4 top-4 text-steel hover:text-coral-dark"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
