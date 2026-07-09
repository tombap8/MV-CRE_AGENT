interface StoryboardFrameCardProps {
  label: string;
  timestamp: string;
  gradientClassName: string;
  selected: boolean;
  onClick: () => void;
}

export function StoryboardFrameCard({
  label,
  timestamp,
  gradientClassName,
  selected,
  onClick,
}: StoryboardFrameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-xl border-2 p-1.5 text-left transition-colors ${
        selected ? "border-brand-blue" : "border-transparent hover:border-hairline-strong"
      }`}
    >
      <div className={`h-32 w-full rounded-lg ${gradientClassName}`} />
      <div className="flex items-center justify-between px-0.5 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-steel">{timestamp}</span>
      </div>
    </button>
  );
}
