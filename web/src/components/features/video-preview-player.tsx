import {
  FullscreenIcon,
  GearIcon,
  PauseIcon,
  PlayIcon,
  SkipNextIcon,
  VolumeIcon,
} from "@/components/icons";

interface VideoPreviewPlayerProps {
  posterClassName: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress?: number;
  posterHeightClassName?: string;
}

export function VideoPreviewPlayer({
  posterClassName,
  isPlaying,
  onTogglePlay,
  progress = 8,
  posterHeightClassName = "h-72",
}: VideoPreviewPlayerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-canvas p-3">
      <div className={`w-full rounded-lg ${posterHeightClassName} ${posterClassName}`} />

      <div className="h-1 w-full rounded-full bg-hairline">
        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-4 text-ink">
        <button type="button" onClick={onTogglePlay} aria-label="재생/일시정지">
          {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
        <button type="button" aria-label="다음 클립">
          <SkipNextIcon className="h-5 w-5" />
        </button>
        <button type="button" aria-label="음량">
          <VolumeIcon className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button type="button" aria-label="설정">
          <GearIcon className="h-5 w-5" />
        </button>
        <button type="button" aria-label="전체 화면">
          <FullscreenIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
