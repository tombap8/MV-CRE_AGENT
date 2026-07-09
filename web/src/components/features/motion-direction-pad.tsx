import { ChevronDownIcon } from "@/components/icons";

export type Direction = "Pan Left" | "Pan Right" | "Tilt Up" | "Tilt Down" | "None";

interface MotionDirectionPadProps {
  value: Direction;
  onChange: (direction: Direction) => void;
}

export function MotionDirectionPad({ value, onChange }: MotionDirectionPadProps) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-1">
      <span />
      <DirectionButton
        active={value === "Tilt Up"}
        onClick={() => onChange("Tilt Up")}
        label="Tilt Up"
      >
        <ChevronDownIcon className="h-4 w-4 rotate-180" />
      </DirectionButton>
      <span />

      <DirectionButton
        active={value === "Pan Left"}
        onClick={() => onChange("Pan Left")}
        label="Pan Left"
      >
        <ChevronDownIcon className="h-4 w-4 rotate-90" />
      </DirectionButton>
      <DirectionButton
        active={value === "None"}
        onClick={() => onChange("None")}
        label="방향 없음 (기본값)"
      >
        <span className="h-2 w-2 rounded-full bg-current" />
      </DirectionButton>
      <DirectionButton
        active={value === "Pan Right"}
        onClick={() => onChange("Pan Right")}
        label="Pan Right"
      >
        <ChevronDownIcon className="h-4 w-4 -rotate-90" />
      </DirectionButton>

      <span />
      <DirectionButton
        active={value === "Tilt Down"}
        onClick={() => onChange("Tilt Down")}
        label="Tilt Down"
      >
        <ChevronDownIcon className="h-4 w-4" />
      </DirectionButton>
      <span />
    </div>
  );
}

function DirectionButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-hairline-strong text-steel hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
