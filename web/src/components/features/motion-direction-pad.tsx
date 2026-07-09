import { ChevronDownIcon } from "@/components/icons";

export type Direction = "Pan Left" | "Pan Right" | "Tilt Up" | "Tilt Down";

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
      <span className="h-9 w-9 rounded-full border border-hairline-strong" />
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
