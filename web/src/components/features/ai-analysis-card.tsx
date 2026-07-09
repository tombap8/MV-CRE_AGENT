interface AnalysisRow {
  label: string;
  value: string;
  tone: "tan" | "lavender";
}

const ROWS: AnalysisRow[] = [
  { label: "Genre", value: "Synthwave", tone: "tan" },
  { label: "Tempo", value: "115 BPM", tone: "lavender" },
  { label: "Mood", value: "Retro, Energetic", tone: "lavender" },
];

const TONE_CLASSES: Record<AnalysisRow["tone"], string> = {
  tan: "bg-[#ffe3c2] text-charcoal",
  lavender: "bg-lavender-light text-lavender-text",
};

export function AiAnalysisCard() {
  return (
    <div className="flex flex-col gap-5 rounded-xxl bg-brand-yellow p-8">
      <h2 className="text-2xl font-bold text-ink">AI Music Analysis</h2>
      <div className="flex flex-col gap-4">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-20 text-base text-ink/80">{row.label}</span>
            <span
              className={`rounded-full px-4 py-1.5 text-base font-medium ${TONE_CLASSES[row.tone]}`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
