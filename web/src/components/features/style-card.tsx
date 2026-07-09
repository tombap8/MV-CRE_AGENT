import { PlayIcon } from "@/components/icons";

export type StyleTone = "teal" | "coral" | "rose";

const TONE_CLASSES: Record<StyleTone, string> = {
  teal: "bg-teal-light",
  coral: "bg-coral-light",
  rose: "bg-rose-light",
};

interface StyleCardProps {
  title: string;
  tone: StyleTone;
  gradientClassName: string;
  selected: boolean;
  onSelect: () => void;
}

export function StyleCard({
  title,
  tone,
  gradientClassName,
  selected,
  onSelect,
}: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-4 rounded-xxl p-5 text-left transition-shadow ${TONE_CLASSES[tone]} ${
        selected ? "ring-4 ring-primary ring-offset-2" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-ink">{title}</h3>
        {selected && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
            ✓
          </span>
        )}
      </div>
      <div
        className={`relative flex h-44 items-center justify-center overflow-hidden rounded-xl ${gradientClassName}`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white">
          <PlayIcon className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}
