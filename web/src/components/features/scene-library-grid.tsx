export interface LibraryScene {
  id: string;
  title: string;
  gradientClassName: string;
}

interface SceneLibraryGridProps {
  scenes: LibraryScene[];
  onAdd: (sceneId: string) => void;
}

export function SceneLibraryGrid({ scenes, onAdd }: SceneLibraryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          type="button"
          onClick={() => onAdd(scene.id)}
          className="flex flex-col items-start gap-2 text-left"
        >
          <div
            className={`h-24 w-full rounded-lg border border-hairline shadow-sm transition-shadow hover:shadow-md ${scene.gradientClassName}`}
          />
          <span className="text-sm font-medium text-ink">{scene.title}</span>
        </button>
      ))}
      <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline-strong text-steel">
        <span className="text-2xl leading-none">+</span>
        <span className="text-xs">Add Clip</span>
      </div>
    </div>
  );
}
