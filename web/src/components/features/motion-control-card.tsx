import { MotionDirectionPad, type Direction } from "@/components/features/motion-direction-pad";

interface MotionControlCardProps {
  sceneName: string;
  gradientClassName: string;
  direction: Direction;
  intensity: number;
  speed: number;
  onDirectionChange: (direction: Direction) => void;
  onIntensityChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
}

export function MotionControlCard({
  sceneName,
  gradientClassName,
  direction,
  intensity,
  speed,
  onDirectionChange,
  onIntensityChange,
  onSpeedChange,
}: MotionControlCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1.1fr_1.4fr] gap-4 rounded-xxl border border-hairline p-5">
        <div className={`h-full min-h-40 rounded-lg ${gradientClassName}`} />

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-ink">Motion Control Suite</h3>

          <div className="flex items-center gap-6">
            <MotionDirectionPad value={direction} onChange={onDirectionChange} />

            <div className="flex flex-1 flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-steel">Motion Intensity</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={(e) => onIntensityChange(Number(e.target.value))}
                  className="w-full accent-brand-blue"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-steel">Speed</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={speed}
                  onChange={(e) => onSpeedChange(Number(e.target.value))}
                  className="w-full accent-brand-blue"
                />
                <div className="flex justify-between text-xs text-steel">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <span className="text-sm font-medium text-ink">
        {sceneName} {direction}
      </span>
    </div>
  );
}
