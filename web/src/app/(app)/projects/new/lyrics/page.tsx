"use client";

import { useState } from "react";
import { LyricsSectionCard, type LyricLine } from "@/components/features/lyrics-section-card";
import { LyricsSettingsPanel } from "@/components/features/lyrics-settings-panel";
import { LyricsVersionHistory } from "@/components/features/lyrics-version-history";
import { PipelineStepper } from "@/components/features/pipeline-stepper";
import { LinkButton } from "@/components/ui/button";

interface Section {
  id: string;
  title: string;
  bold: boolean;
  showSyllableCount: boolean;
  lines: LyricLine[];
}

const INITIAL_SECTIONS: Section[] = [
  {
    id: "verse-1",
    title: "Verse 1",
    bold: false,
    showSyllableCount: true,
    lines: [
      { id: "v1-1", activeIndex: 0, variants: ["Neon lights are calling out my name", "City lights are burning through the rain"] },
      { id: "v1-2", activeIndex: 0, variants: ["Racing through a digital flame", "Chasing echoes down a crimson lane"] },
      { id: "v1-3", activeIndex: 0, variants: ["Static dreams light up the radio", "Faded signals drift into the glow"] },
      { id: "v1-4", activeIndex: 0, variants: ["Every heartbeat starts to overflow", "Every moment slipping soft and slow"] },
    ],
  },
  {
    id: "chorus",
    title: "Chorus",
    bold: true,
    showSyllableCount: false,
    lines: [
      { id: "c-1", activeIndex: 0, variants: ["We're alive in the afterglow", "We're awake in the afterglow"] },
      { id: "c-2", activeIndex: 0, variants: ["Running wild where the neon flows", "Running free where the current flows"] },
      { id: "c-3", activeIndex: 0, variants: ["Hold on tight, let the rhythm go", "Hold my hand, let the rhythm show"] },
      { id: "c-4", activeIndex: 0, variants: ["This is our synthwave show", "This is all we could ever know"] },
    ],
  },
  {
    id: "bridge",
    title: "Bridge",
    bold: false,
    showSyllableCount: false,
    lines: [
      { id: "b-1", activeIndex: 0, variants: ["Bring me back to that violet skyline", "Take me back to that neon skyline"] },
      { id: "b-2", activeIndex: 0, variants: ["Where the stars and the city align", "Where forever feels close, not far behind"] },
    ],
  },
];

export default function LyricsAssistantPage() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  function updateLine(lineId: string, updater: (line: LyricLine) => LyricLine) {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        lines: section.lines.map((line) => (line.id === lineId ? updater(line) : line)),
      }))
    );
  }

  function handleEditLine(lineId: string, text: string) {
    updateLine(lineId, (line) => {
      const variants = [...line.variants];
      variants[line.activeIndex] = text;
      return { ...line, variants };
    });
  }

  function handleRegenerateLine(lineId: string) {
    updateLine(lineId, (line) => ({
      ...line,
      activeIndex: (line.activeIndex + 1) % line.variants.length,
    }));
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-4xl font-bold text-ink">AI Lyrics Assistant</h1>

      <div className="mt-6">
        <PipelineStepper currentStep={1} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr_320px]">
        <LyricsSettingsPanel />

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <LyricsSectionCard
              key={section.id}
              title={section.title}
              lines={section.lines}
              bold={section.bold}
              showSyllableCount={section.showSyllableCount}
              selectedLineId={selectedLineId}
              onSelectLine={setSelectedLineId}
              onEditLine={handleEditLine}
              onRegenerateLine={handleRegenerateLine}
            />
          ))}

          <div className="flex justify-end">
            <LinkButton href="/projects/new/scenario" variant="primary">
              Continue to Scenario
            </LinkButton>
          </div>
        </div>

        <LyricsVersionHistory />
      </div>
    </div>
  );
}
