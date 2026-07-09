import { WaveIcon } from "@/components/icons";
import { Waveform } from "@/components/ui/waveform";

interface SectionMarker {
  label: string;
  position: number;
}

interface TimelineWaveformProps {
  markers: SectionMarker[];
  playheadPosition: number;
}

export function TimelineWaveform({ markers, playheadPosition }: TimelineWaveformProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="오디오 트랙"
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-canvas text-ink"
      >
        <WaveIcon className="h-4 w-4" />
      </button>

      <div className="relative flex-1">
        <div className="pointer-events-none relative h-6">
          {markers.map((marker) => (
            <span
              key={marker.label}
              className={`absolute top-0 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                marker.label.startsWith("Chorus")
                  ? "bg-brand-blue text-on-primary"
                  : "bg-white/10 text-on-dark"
              }`}
              style={{ left: `${marker.position}%` }}
            >
              {marker.label}
            </span>
          ))}
        </div>

        <Waveform barClassName="bg-white/50" />

        <div
          className="absolute top-0 bottom-0 -translate-x-1/2"
          style={{ left: `${playheadPosition}%` }}
        >
          <span className="block h-3 w-3 -translate-x-1/2 rounded-full bg-white" />
          <span className="mx-auto block h-full w-px bg-white/70" />
        </div>
      </div>
    </div>
  );
}
