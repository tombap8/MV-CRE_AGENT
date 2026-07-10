"use client";

import { useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import {
  BITRATE_OPTIONS,
  DURATION_OPTIONS,
  labelForValue,
  RATIO_OPTIONS,
  RESOLUTION_OPTIONS,
} from "@/lib/atlas/generation-options";
import type { GenerationConfig } from "@/lib/atlas/types";

interface GenerationOptionsPanelProps {
  config: GenerationConfig;
  onChange: (config: GenerationConfig) => void;
}

export function GenerationOptionsPanel({ config, onChange }: GenerationOptionsPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function patch(partial: Partial<GenerationConfig>) {
    onChange({ ...config, ...partial });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xxl border border-hairline p-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-steel">생성 옵션</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField
          label="해상도"
          value={labelForValue(RESOLUTION_OPTIONS, config.resolution)}
          options={Object.keys(RESOLUTION_OPTIONS)}
          onChange={(label) => patch({ resolution: RESOLUTION_OPTIONS[label] })}
        />
        <SelectField
          label="화면 비율"
          value={labelForValue(RATIO_OPTIONS, config.ratio)}
          options={Object.keys(RATIO_OPTIONS)}
          onChange={(label) => patch({ ratio: RATIO_OPTIONS[label] })}
        />
        <SelectField
          label="영상 길이"
          value={labelForValue(DURATION_OPTIONS, config.duration)}
          options={Object.keys(DURATION_OPTIONS)}
          onChange={(label) => patch({ duration: DURATION_OPTIONS[label] })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink">비트레이트 모드</span>
          <div className="flex gap-2">
            {Object.entries(BITRATE_OPTIONS).map(([label, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => patch({ bitrateMode: value })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  config.bitrateMode === value
                    ? "bg-primary text-on-primary"
                    : "border border-hairline bg-surface text-steel"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3">
          <Switch checked={config.generateAudio} onChange={(generateAudio) => patch({ generateAudio })} />
          <span className="text-sm font-semibold text-ink">오디오 자동 생성</span>
        </label>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          className="text-xs font-semibold text-steel hover:underline"
        >
          {advancedOpen ? "고급 옵션 닫기 ▲" : "고급 옵션 ▼"}
        </button>
        {advancedOpen && (
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">랜덤 시드 (-1 = 무작위)</span>
            <input
              type="number"
              min={-1}
              max={4294967295}
              step={1}
              value={config.seed}
              onChange={(e) => patch({ seed: Number(e.target.value) })}
              className="w-40 rounded-lg border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand-blue"
            />
          </div>
        )}
      </div>
    </div>
  );
}
