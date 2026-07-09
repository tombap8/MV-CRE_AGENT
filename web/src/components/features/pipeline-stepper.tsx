export const PIPELINE_STEPS = ["Concept", "Lyrics", "Scenario", "Storyboard", "First Frame"];

export function PipelineStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex items-center">
      <div className="h-1 flex-1 rounded-full bg-hairline">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(currentStep / (PIPELINE_STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <div className="absolute inset-x-0 flex items-center justify-between">
        {PIPELINE_STEPS.map((step, i) => (
          <span
            key={step}
            title={step}
            className={`rounded-full ${
              i === currentStep
                ? "h-4 w-4 bg-primary ring-4 ring-primary/20"
                : i < currentStep
                  ? "h-2.5 w-2.5 bg-primary"
                  : "h-2.5 w-2.5 bg-hairline-strong"
            }`}
          />
        ))}
      </div>
      <span className="ml-3 text-steel">→</span>
    </div>
  );
}
