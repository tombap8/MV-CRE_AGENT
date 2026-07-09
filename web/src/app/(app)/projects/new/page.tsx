import { AiAnalysisCard } from "@/components/features/ai-analysis-card";
import { AudioUploadCard } from "@/components/features/audio-upload-card";
import { ConceptInputPanel } from "@/components/features/concept-input-panel";

export default function NewProjectPage() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-ink">Music Upload &amp; AI Concept Setup</h1>
        <AudioUploadCard />
        <AiAnalysisCard />
      </div>

      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-ink">Concept Input Area</h1>
        <ConceptInputPanel />
      </div>
    </div>
  );
}
