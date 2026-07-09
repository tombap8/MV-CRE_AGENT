type BadgeTone = "purple" | "yellow" | "coral" | "success" | "green";

const TONE_CLASSES: Record<BadgeTone, string> = {
  purple: "bg-lavender-light text-lavender-text",
  yellow: "bg-yellow-light text-yellow-dark",
  coral: "bg-coral-light text-coral-dark",
  success: "bg-brand-teal text-on-primary",
  green: "bg-green-500 text-white",
};

export function Badge({
  tone = "purple",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
