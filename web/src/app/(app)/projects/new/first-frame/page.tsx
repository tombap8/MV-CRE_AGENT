"use client";

import { useEffect, useState } from "react";
import { GenerationProgressModal } from "@/components/features/generation-progress-modal";
import { MotionControlCard } from "@/components/features/motion-control-card";
import type { Direction } from "@/components/features/motion-direction-pad";
import { PipelineStepper } from "@/components/features/pipeline-stepper";
import { SceneClipList } from "@/components/features/scene-clip-list";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import {
  AtlasClientError,
  downloadGeneratedVideo,
  fileToBase64,
  fileToDataUrl,
  pollGenerationUntilComplete,
  submitGeneration,
} from "@/lib/atlas/client";
import { resolvePromptParts } from "@/lib/atlas/mentions";
import { composeFirstLastPrompt } from "@/lib/atlas/prompt";
import { createReferenceFileItem, urlToFile } from "@/lib/atlas/reference";
import type {
  GenerateRequest,
  GenerationConfig,
  GenerationTarget,
  PromptPart,
  ReferenceFileItem,
  SceneEntry,
  SceneMode,
} from "@/lib/atlas/types";

const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  resolution: "720p",
  ratio: "adaptive",
  duration: 5,
  bitrateMode: "standard",
  generateAudio: true,
  seed: -1,
};

const STANDALONE_GRADIENT = "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600";

interface PanelState {
  mode: SceneMode;
  direction: Direction;
  intensity: number;
  speed: number;
  promptParts: PromptPart[];
  firstImage: ReferenceFileItem | null;
  lastImage: ReferenceFileItem | null;
  referenceImages: ReferenceFileItem[];
}

const INITIAL_PANEL_STATE: PanelState = {
  mode: "first-last",
  direction: "None",
  intensity: 5,
  speed: 5,
  promptParts: [],
  firstImage: null,
  lastImage: null,
  referenceImages: [],
};

async function buildGenerateRequest(panel: PanelState, config: GenerationConfig): Promise<GenerateRequest> {
  const { text: resolvedPrompt, brokenParts } = resolvePromptParts(panel.promptParts, panel.referenceImages);
  if (brokenParts.length > 0) {
    throw new AtlasClientError(
      `프롬프트에 삭제된 이미지를 참조하는 부분이 ${brokenParts.length}개 있습니다. "@"로 다시 첨부해주세요.`
    );
  }

  if (panel.mode === "first-last") {
    if (!panel.firstImage) {
      throw new AtlasClientError("첫 이미지를 업로드해주세요.");
    }
    const image = await fileToBase64(panel.firstImage.file);
    const lastImage = panel.lastImage ? await fileToBase64(panel.lastImage.file) : undefined;

    return {
      mode: "first-last",
      prompt: composeFirstLastPrompt(resolvedPrompt, panel.direction, panel.intensity, panel.speed),
      config,
      image,
      lastImage,
    };
  }

  if (panel.referenceImages.length === 0) {
    throw new AtlasClientError("이미지를 1개 이상 첨부해주세요.");
  }

  const referenceImages = await Promise.all(panel.referenceImages.map((item) => fileToDataUrl(item.file)));

  return {
    mode: "multi-reference",
    prompt: resolvedPrompt,
    config,
    referenceImages,
  };
}

export default function FirstFramePage() {
  const [scenes, setScenes] = useState<SceneEntry[]>([]);
  const [target, setTarget] = useState<GenerationTarget>("existing");
  const [selectedSceneName, setSelectedSceneName] = useState<string>("");
  const [panel, setPanel] = useState<PanelState>(INITIAL_PANEL_STATE);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>(DEFAULT_GENERATION_CONFIG);
  const [toast, setToast] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [panelResetKey, setPanelResetKey] = useState(0);

  function patchPanel(patch: Partial<PanelState>) {
    setPanel((prev) => ({ ...prev, ...patch }));
  }

  function updateScene(id: string, patch: Partial<SceneEntry>): Promise<void> {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    return fetch(`/api/scenes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
      .then(() => undefined)
      .catch(() => {
        // best-effort persistence — local state already reflects the change
      });
  }

  function persistNewScene(scene: SceneEntry): Promise<void> {
    return fetch("/api/scenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scene),
    })
      .then(() => undefined)
      .catch(() => {
        // best-effort persistence — local state already reflects the change
      });
  }

  function handleAddReferenceFiles(files: File[]) {
    const newItems = files.map((file) => createReferenceFileItem(file));
    patchPanel({ referenceImages: [...panel.referenceImages, ...newItems] });
  }

  function handleRemoveReferenceFile(fileId: string) {
    patchPanel({ referenceImages: panel.referenceImages.filter((item) => item.id !== fileId) });
  }

  function resetPanelInputs() {
    setPanel(INITIAL_PANEL_STATE);
    setPanelResetKey((prev) => prev + 1);
  }

  function handleTargetChange(next: GenerationTarget) {
    setTarget(next);
    if (next === "standalone") {
      setPanel((prev) => ({ ...prev, firstImage: null, lastImage: null, referenceImages: [] }));
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/scenes")
      .then((res) => res.json())
      .then((data: { scenes: SceneEntry[] }) => {
        if (cancelled) return;
        setScenes(data.scenes);
        if (data.scenes.length > 0) {
          setSelectedSceneName((prev) => prev || data.scenes[0].sceneName);
        }
      })
      .catch(() => {
        if (!cancelled) setToast("씬 목록을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSceneImageUrl =
    target === "existing" ? scenes.find((s) => s.sceneName === selectedSceneName)?.firstFrameImageUrl ?? null : null;

  useEffect(() => {
    if (target !== "existing" || !selectedSceneImageUrl) return;

    const imageUrl = selectedSceneImageUrl;
    let cancelled = false;
    (async () => {
      try {
        const file = await urlToFile(imageUrl, `${selectedSceneName}-first-frame.jpg`);
        if (cancelled) return;
        const item = createReferenceFileItem(file);
        setPanel((prev) =>
          prev.mode === "first-last"
            ? { ...prev, firstImage: item, referenceImages: [] }
            : { ...prev, referenceImages: [item], firstImage: null }
        );
      } catch {
        if (!cancelled) setToast("씬의 첫장면 이미지를 불러오지 못했습니다.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [target, selectedSceneName, panel.mode, selectedSceneImageUrl]);

  const missingRequiredImage = panel.mode === "multi-reference" && panel.referenceImages.length === 0;

  async function handleGenerate() {
    let request: GenerateRequest;
    try {
      request = await buildGenerateRequest(panel, generationConfig);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "요청을 확인해주세요.");
      return;
    }

    let entryId: string;
    let isNewStandalone = false;

    if (target === "existing") {
      const existing = scenes.find((s) => s.sceneName === selectedSceneName);
      if (!existing) {
        setToast("적용할 씬을 선택해주세요.");
        return;
      }
      entryId = existing.id;
    } else {
      const standaloneCount = scenes.filter((s) => s.isStandalone).length;
      const newEntry: SceneEntry = {
        id: crypto.randomUUID(),
        sceneName: `단독 클립 ${standaloneCount + 1}`,
        gradientClassName: STANDALONE_GRADIENT,
        firstFrameImageUrl: null,
        isStandalone: true,
        jobStatus: "submitting",
        resultUrl: null,
        localPath: null,
        errorMessage: null,
      };
      setScenes((prev) => [...prev, newEntry]);
      entryId = newEntry.id;
      isNewStandalone = true;
      // Await creation before any later PATCH, so the row exists before it's updated.
      await persistNewScene(newEntry);
    }

    setModalDismissed(false);
    setActiveJobId(entryId);
    if (!isNewStandalone) {
      updateScene(entryId, { jobStatus: "submitting", errorMessage: null, resultUrl: null, localPath: null });
    }

    try {
      const predictionId = await submitGeneration(request);
      updateScene(entryId, { jobStatus: "processing" });

      const resultUrl = await pollGenerationUntilComplete(predictionId);
      const scene = scenes.find((s) => s.id === entryId);
      const localPath = await downloadGeneratedVideo(resultUrl, scene?.sceneName ?? "clip").catch(() => null);

      await updateScene(entryId, { jobStatus: "succeeded", resultUrl, localPath });
      resetPanelInputs();
    } catch (error) {
      await updateScene(entryId, {
        jobStatus: "failed",
        errorMessage: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setActiveJobId(null);
    }
  }

  const activeScene = activeJobId ? scenes.find((s) => s.id === activeJobId) : null;
  const isGenerating = activeScene?.jobStatus === "submitting" || activeScene?.jobStatus === "processing";
  const progress = activeScene?.jobStatus === "processing" ? 60 : activeScene?.jobStatus === "submitting" ? 15 : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 pb-24">
      <h1 className="text-4xl font-bold text-ink">Initial Clip Motion Control</h1>

      <div className="mt-6">
        <PipelineStepper currentStep={4} />
      </div>

      {toast && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-coral-dark/20 bg-coral-light px-4 py-3 text-sm text-coral-dark">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="font-semibold">
            닫기
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 rounded-xxl border border-hairline p-5">
        <span className="text-sm font-semibold text-ink">생성 대상</span>
        <div className="flex gap-2">
          <TargetButton active={target === "existing"} onClick={() => handleTargetChange("existing")}>
            기존 씬에 적용
          </TargetButton>
          <TargetButton active={target === "standalone"} onClick={() => handleTargetChange("standalone")}>
            새 단독 씬으로 생성
          </TargetButton>
        </div>

        {target === "existing" && (
          <SelectField
            label="적용할 씬"
            value={selectedSceneName}
            options={scenes.map((s) => s.sceneName)}
            onChange={setSelectedSceneName}
          />
        )}
      </div>

      <div className="mt-6">
        <MotionControlCard
          key={panelResetKey}
          mode={panel.mode}
          onModeChange={(mode) => patchPanel({ mode })}
          direction={panel.direction}
          intensity={panel.intensity}
          speed={panel.speed}
          onDirectionChange={(direction) => patchPanel({ direction })}
          onIntensityChange={(intensity) => patchPanel({ intensity })}
          onSpeedChange={(speed) => patchPanel({ speed })}
          firstImage={panel.firstImage}
          lastImage={panel.lastImage}
          onFirstImageChange={(file) => patchPanel({ firstImage: file ? createReferenceFileItem(file) : null })}
          onLastImageChange={(file) => patchPanel({ lastImage: file ? createReferenceFileItem(file) : null })}
          referenceImages={panel.referenceImages}
          onAddReferenceFiles={handleAddReferenceFiles}
          onRemoveReferenceFile={handleRemoveReferenceFile}
          promptParts={panel.promptParts}
          onPromptPartsChange={(promptParts) => patchPanel({ promptParts })}
          onValidationError={setToast}
          generationConfig={generationConfig}
          onGenerationConfigChange={setGenerationConfig}
        />

        <div className="mt-4 flex items-center justify-end gap-3">
          {missingRequiredImage && !isGenerating && (
            <span className="text-xs text-steel">이미지를 1개 이상 첨부해주세요.</span>
          )}
          <Button variant="primary" onClick={handleGenerate} disabled={isGenerating || missingRequiredImage}>
            {isGenerating ? "생성 중..." : "영상 생성"}
          </Button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold text-ink">씬 목록</h2>
        <SceneClipList scenes={scenes} />
      </div>

      {isGenerating && !modalDismissed && (
        <GenerationProgressModal
          clipCount={1}
          progress={progress}
          etaLabel="계산 중"
          onCancel={() => setModalDismissed(true)}
        />
      )}
    </div>
  );
}

function TargetButton({
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
