"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Option {
  value: string;
  label: string;
}

const RESOLUTIONS: Option[] = [
  { value: "1080p", label: "1080p (FHD)" },
  { value: "4k", label: "4K (UHD)" },
];

const BITRATES: Option[] = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
];

export function ExportSettingsPanel() {
  const [resolution, setResolution] = useState("1080p");
  const [bitrate, setBitrate] = useState("standard");
  const [watermark, setWatermark] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      <SettingsCard title="Video Resolution">
        <PillOptionGroup options={RESOLUTIONS} value={resolution} onChange={setResolution} />
      </SettingsCard>

      <SettingsCard title="Video Bitrate">
        <PillOptionGroup options={BITRATES} value={bitrate} onChange={setBitrate} />
      </SettingsCard>

      <SettingsCard
        title="Watermark"
        badge={
          <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-ink">
            PRO
          </span>
        }
      >
        <div className="flex items-center gap-3">
          <Switch checked={watermark} onChange={setWatermark} />
          <span className="text-sm text-ink">{watermark ? "On" : "Off"}</span>
        </div>
      </SettingsCard>

      <Button variant="primary" className="w-full py-4 text-base">
        Download Video
      </Button>
    </div>
  );
}

function SettingsCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xxl bg-surface p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-ink">{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function PillOptionGroup({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-full px-5 py-3 text-sm font-medium transition-colors ${
            value === option.value
              ? "bg-primary text-on-primary"
              : "border border-hairline-strong text-ink hover:bg-canvas"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
