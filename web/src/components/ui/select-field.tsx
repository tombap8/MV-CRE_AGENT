import { ChevronDownIcon } from "@/components/icons";

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-full border border-hairline-strong bg-canvas px-5 py-3 text-sm font-medium text-ink"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
      </span>
    </label>
  );
}
