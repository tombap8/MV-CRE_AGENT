interface ConfigSummaryCardProps {
  musicTitle: string;
  musicFile: string;
  tags: string[];
  conceptText?: string;
  footer: React.ReactNode;
}

export function ConfigSummaryCard({
  musicTitle,
  musicFile,
  tags,
  conceptText,
  footer,
}: ConfigSummaryCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xxl border border-hairline p-6">
      <h2 className="text-xl font-bold text-ink">Configuration Summary</h2>

      <SummaryRow label="Music">
        <p className="text-ink">
          &lsquo;{musicTitle}&rsquo;
          <br />
          <span className="text-steel">({musicFile})</span>
        </p>
      </SummaryRow>

      <SummaryRow label="Tags">
        <p className="text-ink">{tags.join(", ")}</p>
      </SummaryRow>

      <SummaryRow label="Concept">
        <p className={conceptText ? "text-ink" : "text-steel italic"}>
          {conceptText || "이전 단계에서 입력한 컨셉이 여기에 표시됩니다."}
        </p>
      </SummaryRow>

      {footer}
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-hairline-soft pb-4">
      <span className="text-sm font-bold text-ink">{label}:</span>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
