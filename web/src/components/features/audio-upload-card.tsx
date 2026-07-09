import { PauseIcon, PlayIcon, VolumeIcon } from "@/components/icons";
import { Waveform } from "@/components/ui/waveform";

export function AudioUploadCard() {
  return (
    <div className="flex flex-col gap-6 rounded-xxl border border-dashed border-hairline-strong p-8">
      <span className="text-sm text-slate">Loaded audio file here</span>

      <Waveform className="w-full" />

      <div className="flex items-center gap-3">
        <IconButton>
          <PlayIcon />
        </IconButton>
        <IconButton>
          <PauseIcon />
        </IconButton>
        <div className="flex-1" />
        <IconButton>
          <VolumeIcon />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink transition-colors hover:bg-hairline"
    >
      {children}
    </button>
  );
}
