import { Button } from "@/components/ui/button";

interface GenerationProgressModalProps {
  clipCount: number;
  progress: number;
  etaLabel: string;
  onCancel: () => void;
}

export function GenerationProgressModal({
  clipCount,
  progress,
  etaLabel,
  onCancel,
}: GenerationProgressModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/10 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-xxl bg-canvas p-10 text-center shadow-xl">
        <span className="rounded-full bg-lavender-light px-6 py-3 text-lg font-bold text-lavender-text">
          Generating {clipCount} Video Clips Parallelly...
        </span>

        <div className="relative h-10 w-full overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full rounded-full bg-brand-blue transition-all"
            style={{ width: `${progress}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-on-primary">
            {progress}%
          </span>
        </div>

        <p className="text-base text-ink">Estimated time remaining: {etaLabel}</p>

        <Button variant="secondary" onClick={onCancel}>
          Cancel Generation
        </Button>
      </div>
    </div>
  );
}
