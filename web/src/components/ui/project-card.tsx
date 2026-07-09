import { Badge } from "@/components/ui/badge";

type BadgeTone = "purple" | "yellow" | "coral" | "success";

type ThumbnailVariant =
  | { kind: "duo"; rightClassName: string }
  | { kind: "gradient"; className: string };

const THUMBNAIL_VARIANTS: ThumbnailVariant[] = [
  { kind: "duo", rightClassName: "bg-[#e7c9a9]" },
  { kind: "duo", rightClassName: "bg-brand-teal/70" },
  { kind: "duo", rightClassName: "bg-charcoal/80" },
  { kind: "gradient", className: "bg-gradient-to-br from-[#2b0f54] via-[#9b3fd1] to-[#ffb84d]" },
  { kind: "gradient", className: "bg-gradient-to-br from-[#4c2889] to-[#2f6fd6]" },
  { kind: "gradient", className: "bg-gradient-to-br from-slate-600 to-slate-800" },
];

function ProjectThumbnail({ variantIndex }: { variantIndex: number }) {
  const variant = THUMBNAIL_VARIANTS[variantIndex % THUMBNAIL_VARIANTS.length];

  return (
    <div className="flex h-32 items-center gap-2 rounded-lg border border-hairline bg-canvas p-2">
      <div className="flex h-full flex-col justify-between gap-1 px-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink/15" />
        ))}
      </div>
      <div
        className={`relative flex h-full flex-1 overflow-hidden rounded-md ${
          variant.kind === "gradient" ? variant.className : "bg-teal-light"
        }`}
      >
        {variant.kind === "duo" && (
          <div className={`absolute inset-y-0 right-0 w-1/3 ${variant.rightClassName}`} />
        )}
        <span className="relative z-10 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          ▶
        </span>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  status: string;
  statusTone?: BadgeTone;
  meta?: string;
  variantIndex?: number;
}

export function ProjectCard({
  title,
  status,
  statusTone = "purple",
  meta,
  variantIndex = 0,
}: ProjectCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-3">
      <ProjectThumbnail variantIndex={variantIndex} />
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {meta && <span className="text-sm text-steel">{meta}</span>}
        <Badge tone={statusTone}>{status}</Badge>
      </div>
    </div>
  );
}
