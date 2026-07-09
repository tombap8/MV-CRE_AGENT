"use client";

import { useRef, type ChangeEvent } from "react";
import { CloseIcon } from "@/components/icons";
import { MotionDirectionPad, type Direction } from "@/components/features/motion-direction-pad";
import { MentionPromptInput } from "@/components/features/mention-prompt-input";
import { ReferenceFileTray } from "@/components/features/reference-file-tray";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ALLOWED_IMAGE_TYPES } from "@/lib/atlas/config";
import type { ReferenceFileItem, ReferenceKind, SceneMode } from "@/lib/atlas/types";

interface MotionControlCardProps {
  mode: SceneMode;
  onModeChange: (mode: SceneMode) => void;

  direction: Direction;
  intensity: number;
  speed: number;
  onDirectionChange: (direction: Direction) => void;
  onIntensityChange: (value: number) => void;
  onSpeedChange: (value: number) => void;

  firstImage: ReferenceFileItem | null;
  lastImage: ReferenceFileItem | null;
  onFirstImageChange: (file: File | null) => void;
  onLastImageChange: (file: File | null) => void;

  referenceImages: ReferenceFileItem[];
  referenceVideos: ReferenceFileItem[];
  referenceAudios: ReferenceFileItem[];
  onAddReferenceFiles: (kind: ReferenceKind, files: File[]) => void;
  onRemoveReferenceFile: (kind: ReferenceKind, id: string) => void;

  scenePrompt: string;
  onScenePromptChange: (value: string) => void;
  onValidationError?: (message: string) => void;
}

export function MotionControlCard({
  mode,
  onModeChange,
  direction,
  intensity,
  speed,
  onDirectionChange,
  onIntensityChange,
  onSpeedChange,
  firstImage,
  lastImage,
  onFirstImageChange,
  onLastImageChange,
  referenceImages,
  referenceVideos,
  referenceAudios,
  onAddReferenceFiles,
  onRemoveReferenceFile,
  scenePrompt,
  onScenePromptChange,
  onValidationError,
}: MotionControlCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xxl border border-hairline p-5">
      <ModeTabs mode={mode} onModeChange={onModeChange} />

      {mode === "first-last" ? (
        <div className="grid grid-cols-[1.1fr_1.4fr] gap-4">
          <div className="flex flex-col gap-2 rounded-lg border border-hairline p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-steel">첫 → 끝 이미지</span>
            <div className="flex flex-1 items-center justify-center gap-2">
              <SingleImageSlot label="첫 이미지" image={firstImage} onChange={onFirstImageChange} />
              <span className="text-lg text-steel">→</span>
              <SingleImageSlot label="끝 이미지 (선택)" image={lastImage} onChange={onLastImageChange} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-ink">Motion Control Suite</h3>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex items-center gap-1.5 text-sm text-steel">
                  Camera Movement
                  <InfoTooltip text="카메라가 제자리에서 좌우로 도는(Pan) 또는 위아래로 기울이는(Tilt) 방향입니다. 피사체 주위를 도는 궤도 움직임은 아닙니다. 가운데 점을 선택하면 방향을 지정하지 않습니다 (기본값)." />
                </span>
                <MotionDirectionPad value={direction} onChange={onDirectionChange} />
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-steel">
                      Motion Intensity
                      <InfoTooltip text="카메라 움직임의 강도입니다. 값이 높을수록 더 역동적인 움직임으로 프롬프트에 자동 반영됩니다." />
                    </span>
                    <span className="text-xs font-semibold text-ink">{intensity}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={intensity}
                    onChange={(e) => onIntensityChange(Number(e.target.value))}
                    className="w-full accent-brand-blue"
                  />
                  <ScaleTicks value={intensity} />
                </label>

                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-steel">
                      Speed
                      <InfoTooltip text="카메라 움직임의 속도입니다. 값이 높을수록 더 빠른 움직임으로 프롬프트에 자동 반영됩니다." />
                    </span>
                    <span className="text-xs font-semibold text-ink">{speed}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="w-full accent-brand-blue"
                  />
                  <ScaleTicks value={speed} />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ReferenceFileTray
          images={referenceImages}
          videos={referenceVideos}
          audios={referenceAudios}
          onAddFiles={onAddReferenceFiles}
          onRemove={onRemoveReferenceFile}
          onValidationError={onValidationError}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-steel">프롬프트</span>
        <MentionPromptInput
          value={scenePrompt}
          onChange={onScenePromptChange}
          images={referenceImages}
          videos={referenceVideos}
          audios={referenceAudios}
          placeholder={
            mode === "first-last"
              ? "영상에 대한 설명을 입력하세요. (예: 캐릭터가 우아하게 춤을 춘다)"
              : '프롬프트를 입력하세요. "@"를 입력해 첨부한 파일을 인용할 수 있습니다.'
          }
        />
      </div>
    </div>
  );
}

function ModeTabs({ mode, onModeChange }: { mode: SceneMode; onModeChange: (mode: SceneMode) => void }) {
  return (
    <div className="flex gap-2">
      <TabButton active={mode === "first-last"} onClick={() => onModeChange("first-last")}>
        첫/끝 이미지
      </TabButton>
      <TabButton active={mode === "multi-reference"} onClick={() => onModeChange("multi-reference")}>
        다중 레퍼런스
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-on-primary" : "border border-hairline bg-surface text-steel"
      }`}
    >
      {children}
    </button>
  );
}

function ScaleTicks({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div className="flex justify-between px-0.5 text-[10px] text-steel">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <span key={n} className={n === value ? "font-bold text-ink" : ""}>
          {n}
        </span>
      ))}
    </div>
  );
}

function SingleImageSlot({
  label,
  image,
  onChange,
}: {
  label: string;
  image: ReferenceFileItem | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (file) onChange(file);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-steel">{label}</span>
      {image ? (
        <div className="group relative h-20 w-20 flex-none overflow-hidden rounded-lg border border-hairline bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.previewUrl} alt={image.file.name} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 text-on-primary opacity-0 transition-opacity group-hover:opacity-100"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 flex-none items-center justify-center rounded-lg border border-dashed border-hairline-strong text-steel transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          <span className="text-xl leading-none">+</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
