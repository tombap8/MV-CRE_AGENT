import { PlayIcon } from "@/components/icons";

interface TimelineClipBlockProps {
  title: string | null;
  gradientClassName: string | null;
  selected: boolean;
  onClick: () => void;
}

export function TimelineClipBlock({
  title,
  gradientClassName,
  selected,
  onClick,
}: TimelineClipBlockProps) {
  const isEmpty = !gradientClassName;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-32 w-56 flex-none flex-col justify-between gap-2 rounded-lg border-2 bg-[#1c1a33] p-3 text-left transition-colors ${
        isEmpty
          ? "border-dashed border-red-400"
          : selected
            ? "border-brand-blue"
            : "border-transparent"
      }`}
    >
      {title ? (
        <span className="truncate text-sm font-semibold text-on-primary">{title}</span>
      ) : (
        <span className="text-sm font-semibold text-red-300">빈 구간 · 클립 필요</span>
      )}

      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-md ${
          gradientClassName ?? "bg-white/5"
        }`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
          <PlayIcon className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}
