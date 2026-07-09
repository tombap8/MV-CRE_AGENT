import { countSyllables } from "@/lib/syllables";

export interface LyricLine {
  id: string;
  variants: string[];
  activeIndex: number;
}

interface LyricsSectionCardProps {
  title: string;
  lines: LyricLine[];
  bold?: boolean;
  showSyllableCount?: boolean;
  selectedLineId: string | null;
  onSelectLine: (id: string) => void;
  onEditLine: (id: string, text: string) => void;
  onRegenerateLine: (id: string) => void;
}

export function LyricsSectionCard({
  title,
  lines,
  bold = false,
  showSyllableCount = false,
  selectedLineId,
  onSelectLine,
  onEditLine,
  onRegenerateLine,
}: LyricsSectionCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xxl border border-hairline p-6">
      <h2 className="text-xl font-bold text-ink">{title}</h2>

      {lines.map((line) => {
        const text = line.variants[line.activeIndex];
        const selected = selectedLineId === line.id;
        const syllables = countSyllables(text);

        return (
          <div
            key={line.id}
            className={`flex items-center gap-4 rounded-lg px-3 py-2 transition-colors ${
              selected ? "bg-surface" : "hover:bg-surface/60"
            }`}
          >
            {showSyllableCount && (
              <span className="w-6 flex-none text-right text-sm text-steel">{syllables}</span>
            )}

            <input
              value={text}
              onChange={(e) => onEditLine(line.id, e.target.value)}
              onFocus={() => onSelectLine(line.id)}
              className={`flex-1 bg-transparent text-ink outline-none ${
                bold ? "text-xl font-bold" : "text-lg"
              }`}
            />

            {selected ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerateLine(line.id);
                }}
                className="flex-none rounded-full border border-hairline-strong bg-canvas px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface"
              >
                Regenerate Line
              </button>
            ) : (
              showSyllableCount && (
                <span className="w-6 flex-none text-sm text-steel">{syllables}</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
