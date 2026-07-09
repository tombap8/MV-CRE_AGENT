"use client";

import { useState } from "react";
import type { PromptSegment } from "@/components/features/prompt-chip-text";
import { PipelineStepper } from "@/components/features/pipeline-stepper";
import { StoryboardEditPanel } from "@/components/features/storyboard-edit-panel";
import { StoryboardFrameCard } from "@/components/features/storyboard-frame-card";
import { LinkButton } from "@/components/ui/button";

interface Theme {
  key: string;
  label: string;
  gradient: string;
  variantGradient: string;
  subject: string[];
  setting: string[];
  lighting: string[];
  atmosphere: string[];
  detail: string[];
  mood: string[];
}

const THEMES: Record<string, Theme> = {
  ruins: {
    key: "ruins",
    label: "Ancient Ruins",
    gradient: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
    variantGradient: "bg-gradient-to-br from-orange-300 via-amber-400 to-slate-700",
    subject: ["lone figure", "weary traveler", "robed monk"],
    setting: ["ancient stone ruins", "crumbling marble columns", "sunlit temple steps"],
    lighting: ["golden sunrise", "misty dawn", "fading dusk"],
    atmosphere: ["drifting mist", "warm rim light", "long shadows"],
    detail: ["broken columns", "weathered stones", "ancient archway"],
    mood: ["cinematic", "dreamlike", "melancholic"],
  },
  city: {
    key: "city",
    label: "Future City",
    gradient: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950",
    variantGradient: "bg-gradient-to-br from-sky-700 via-slate-800 to-black",
    subject: ["flying vehicle", "lone pedestrian", "drone camera"],
    setting: ["neon-lit skyscrapers", "rain-soaked streets", "elevated highways"],
    lighting: ["cool blue glow", "flickering neon", "moonlit haze"],
    atmosphere: ["light trails", "holographic ads", "steam vents"],
    detail: ["glass towers", "crowded walkways", "floating signage"],
    mood: ["futuristic", "tense", "electric"],
  },
  neon: {
    key: "neon",
    label: "Neon Skyline",
    gradient: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-400",
    variantGradient: "bg-gradient-to-br from-fuchsia-600 via-pink-500 to-cyan-400",
    subject: ["glowing silhouette", "swirling particles", "abstract figure"],
    setting: ["fractured neon grid", "digital horizon", "synthwave skyline"],
    lighting: ["magenta glow", "laser streaks", "gradient sunset"],
    atmosphere: ["pulsing light", "chromatic aberration", "motion blur"],
    detail: ["grid lines", "floating shapes", "mirrored surfaces"],
    mood: ["psychedelic", "energetic", "retro"],
  },
  rooftop: {
    key: "rooftop",
    label: "City Rooftop",
    gradient: "bg-gradient-to-br from-slate-600 via-indigo-700 to-slate-900",
    variantGradient: "bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900",
    subject: ["silhouetted dancer", "standing figure", "couple"],
    setting: ["rooftop skyline", "water tower ledge", "fire escape"],
    lighting: ["dusk gradient", "string lights", "city glow"],
    atmosphere: ["gentle breeze", "rising steam", "distant traffic light"],
    detail: ["antenna towers", "rooftop garden", "water tank"],
    mood: ["intimate", "nostalgic", "urban"],
  },
  crowd: {
    key: "crowd",
    label: "Concert Crowd",
    gradient: "bg-gradient-to-br from-amber-600 via-slate-700 to-slate-900",
    variantGradient: "bg-gradient-to-br from-red-600 via-amber-700 to-slate-900",
    subject: ["raised hands", "cheering crowd", "spotlighted singer"],
    setting: ["packed concert floor", "festival stage", "smoky venue"],
    lighting: ["warm spotlight", "strobing stage lights", "amber haze"],
    atmosphere: ["rising smoke", "confetti fall", "camera flashes"],
    detail: ["stage rigging", "crowd silhouettes", "speaker stacks"],
    mood: ["euphoric", "electric", "triumphant"],
  },
};

interface Frame {
  id: string;
  themeKey: string;
  timestamp: string;
  gradient: string;
}

function buildInitialFrames(): Frame[] {
  const order = [
    "ruins", "ruins", "city",
    "ruins", "city", "neon",
    "neon", "rooftop", "rooftop",
    "crowd", "crowd", "crowd",
  ];
  return order.map((themeKey, i) => ({
    id: `frame-${i + 1}`,
    themeKey,
    timestamp: `0:0${Math.floor(i / 3)}:${String((i * 17) % 60).padStart(2, "0")}`,
    gradient: THEMES[themeKey].gradient,
  }));
}

function buildVisualSegments(theme: Theme): PromptSegment[] {
  return [
    { text: "A " },
    { chip: theme.subject },
    { text: " moves through " },
    { chip: theme.setting },
    { text: " under " },
    { chip: theme.lighting },
    { text: "." },
  ];
}

function buildMoodSegments(theme: Theme): PromptSegment[] {
  return [
    { text: "Add " },
    { chip: theme.atmosphere },
    { text: " across the " },
    { chip: theme.detail },
    { text: " for a " },
    { chip: theme.mood },
    { text: " feel." },
  ];
}

export default function StoryboardPage() {
  const [frames, setFrames] = useState<Frame[]>(buildInitialFrames());
  const [selectedFrameId, setSelectedFrameId] = useState<string>("frame-2");
  const [panelOpen, setPanelOpen] = useState(true);

  const selectedFrame = frames.find((f) => f.id === selectedFrameId) ?? frames[0];
  const selectedTheme = THEMES[selectedFrame.themeKey];

  function handleSelectFrame(id: string) {
    setSelectedFrameId(id);
    setPanelOpen(true);
  }

  function handleAcceptVariant() {
    setFrames((prev) =>
      prev.map((f) =>
        f.id === selectedFrame.id ? { ...f, gradient: selectedTheme.variantGradient } : f
      )
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">Storyboard Still-Cut Gallery</h1>

      <div className="mt-6">
        <PipelineStepper currentStep={3} />
      </div>

      <div
        className={`mt-8 grid grid-cols-1 gap-8 ${panelOpen ? "lg:grid-cols-[1fr_420px]" : ""}`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {frames.map((frame, i) => (
            <StoryboardFrameCard
              key={frame.id}
              label={`Scene ${i + 1}`}
              timestamp={frame.timestamp}
              gradientClassName={frame.gradient}
              selected={selectedFrameId === frame.id}
              onClick={() => handleSelectFrame(frame.id)}
            />
          ))}
        </div>

        {panelOpen && (
          <StoryboardEditPanel
            frameKey={selectedFrame.id}
            visualSegments={buildVisualSegments(selectedTheme)}
            moodSegments={buildMoodSegments(selectedTheme)}
            currentGradientClassName={selectedFrame.gradient}
            variantGradientClassName={selectedTheme.variantGradient}
            onClose={() => setPanelOpen(false)}
            onAcceptVariant={handleAcceptVariant}
          />
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <LinkButton href="/projects/new/first-frame" variant="primary">
          Continue to First Frame
        </LinkButton>
      </div>
    </div>
  );
}
