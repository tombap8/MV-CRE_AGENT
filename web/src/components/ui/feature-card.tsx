import type { ReactNode } from "react";

type CardTone = "teal" | "coral" | "rose";

const TONE_CLASSES: Record<CardTone, string> = {
  teal: "bg-teal-light",
  coral: "bg-coral-light",
  rose: "bg-rose-light",
};

interface FeatureCardProps {
  tone: CardTone;
  title: string;
  description: string;
  media?: ReactNode;
}

export function FeatureCard({ tone, title, description, media }: FeatureCardProps) {
  return (
    <div className={`flex flex-col gap-5 rounded-xxxl p-8 ${TONE_CLASSES[tone]}`}>
      {media ?? <MockupPlaceholder />}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-medium text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-charcoal/80">{description}</p>
      </div>
    </div>
  );
}

function MockupPlaceholder() {
  return (
    <div className="flex h-28 items-center gap-2 rounded-xl border border-white/40 bg-white/60 p-3">
      <div className="flex h-full flex-col justify-between gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/20" />
        ))}
      </div>
      <div className="flex h-full flex-1 items-center justify-center rounded-lg bg-ink/10">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          ▶
        </span>
      </div>
    </div>
  );
}
