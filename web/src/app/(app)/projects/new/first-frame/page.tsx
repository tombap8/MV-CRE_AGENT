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
  pollGenerationUntilComplete,
  registerAndAwaitAsset,
  submitGeneration,
} from "@/lib/atlas/client";
import { composeFirstLastPrompt } from "@/lib/atlas/prompt";
import { createReferenceFileItem, urlToFile } from "@/lib/atlas/reference";
import type {
  GenerateRequest,
  GenerationConfig,
  GenerationTarget,
  ReferenceFileItem,
  ReferenceKind,
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

const SEED_SCENES: SceneEntry[] = [
  {
    id: "ruins",
    sceneName: "Scene 1: Ancient Ruins",
    gradientClassName: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
    firstFrameImageUrl: "/sample-scenes/ancient-ruins.png",
  },
  {
    id: "city",
    sceneName: "Scene 2: Future City",
    gradientClassName: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950",
    firstFrameImageUrl: "/sample-scenes/future-city.png",
  },
  {
    id: "rooftop",
    sceneName: "Scene 3: City Rooftop",
    gradientClassName: "bg-gradient-to-br from-slate-600 via-indigo-700 to-slate-900",
    firstFrameImageUrl: "/sample-scenes/city-rooftop.png",
  },
  {
    id: "neon",
    sceneName: "Scene 4: Neon Skyline",
    gradientClassName: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-400",
    firstFrameImageUrl: "/sample-scenes/neon-skyline.png",
  },
  {
    id: "crowd",
    sceneName: "Scene 5: Concert Crowd",
    gradientClassName: "bg-gradient-to-br from-amber-600 via-slate-700 to-slate-900",
    firstFrameImageUrl: "/sample-scenes/concert-crowd.png",
  },
].map((seed) => ({
  ...seed,
  isStandalone: false,
  jobStatus: "idle",
  resultUrl: null,
  localPath: null,
  errorMessage: null,
})) as SceneEntry[];

function getSeedFirstFrameImageUrl(sceneName: string): string | null {
  return SEED_SCENES.find((s) => s.sceneName === sceneName)?.firstFrameImageUrl ?? null;
}

const STANDALONE_GRADIENT = "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600";

interface PanelState {
  mode: SceneMode;
  direction: Direction;
  intensity: number;
  speed: number;
  scenePrompt: string;
  firstImage: ReferenceFileItem | null;
  lastImage: ReferenceFileItem | null;
  referenceImages: ReferenceFileItem[];
  referenceVideos: ReferenceFileItem[];
  referenceAudios: ReferenceFileItem[];
}

const INITIAL_PANEL_STATE: PanelState = {
  mode: "first-last",
  direction: "None",
  intensity: 5,
  speed: 5,
  scenePrompt: "",
  firstImage: null,
  lastImage: null,
  referenceImages: [],
  referenceVideos: [],
  referenceAudios: [],
};

async function buildGenerateRequest(panel: PanelState, config: GenerationConfig): Promise<GenerateRequest> {
  if (panel.mode === "first-last") {
    if (!panel.firstImage) {
      throw new AtlasClientError("첫 이미지를 업로드해주세요.");
    }
    const image = await fileToBase64(panel.firstImage.file);
    const lastImage = panel.lastImage ? await fileToBase64(panel.lastImage.file) : undefined;

    return {
      mode: "first-last",
      prompt: composeFirstLastPrompt(panel.scenePrompt, panel.direction, panel.intensity, panel.speed),
      config,
      image,
      lastImage,
    };
  }

  const pendingAssets = [...panel.referenceVideos, ...panel.referenceAudios].filter(
    (item) => item.assetStatus !== "active"
  );
  if (pendingAssets.length > 0) {
    throw new AtlasClientError("비디오/오디오 레퍼런스가 아직 준비되지 않았습니다.");
  }

  const referenceImages = await Promise.all(panel.referenceImages.map((item) => fileToBase64(item.file)));
  const referenceVideos = panel.referenceVideos.map((item) => item.assetRef).filter((ref): ref is string => Boolean(ref));
  const referenceAudios = panel.referenceAudios.map((item) => item.assetRef).filter((ref): ref is string => Boolean(ref));

  return {
    mode: "multi-reference",
    prompt: panel.scenePrompt,
    config,
    referenceImages: referenceImages.length ? referenceImages : undefined,
    referenceVideos: referenceVideos.length ? referenceVideos : undefined,
    referenceAudios: referenceAudios.length ? referenceAudios : undefined,
  };
}

export default function FirstFramePage() {
  const [scenes, setScenes] = useState<SceneEntry[]>(SEED_SCENES);
  const [target, setTarget] = useState<GenerationTarget>("existing");
  const [selectedSceneName, setSelectedSceneName] = useState<string>(SEED_SCENES[0].sceneName);
  const [panel, setPanel] = useState<PanelState>(INITIAL_PANEL_STATE);
  const [toast, setToast] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [modalDismissed, setModalDismissed] = useState(false);

  function patchPanel(patch: Partial<PanelState>) {
    setPanel((prev) => ({ ...prev, ...patch }));
  }

  function updateScene(id: string, patch: Partial<SceneEntry>) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handleAddReferenceFiles(kind: ReferenceKind, files: File[]) {
    const newItems = files.map((file) => createReferenceFileItem(kind, file));

    if (kind === "image") {
      patchPanel({ referenceImages: [...panel.referenceImages, ...newItems] });
      return;
    }
    if (kind === "video") {
      patchPanel({ referenceVideos: [...panel.referenceVideos, ...newItems] });
    } else {
      patchPanel({ referenceAudios: [...panel.referenceAudios, ...newItems] });
    }
    newItems.forEach((item) => registerReferenceAsset(kind, item));
  }

  function updateReferenceItem(kind: "video" | "audio", itemId: string, patch: Partial<ReferenceFileItem>) {
    setPanel((prev) => {
      if (kind === "video") {
        return { ...prev, referenceVideos: prev.referenceVideos.map((f) => (f.id === itemId ? { ...f, ...patch } : f)) };
      }
      return { ...prev, referenceAudios: prev.referenceAudios.map((f) => (f.id === itemId ? { ...f, ...patch } : f)) };
    });
  }

  async function registerReferenceAsset(kind: "video" | "audio", item: ReferenceFileItem) {
    try {
      const assetRef = await registerAndAwaitAsset(kind, item.file, (status) =>
        updateReferenceItem(kind, item.id, { assetStatus: status })
      );
      updateReferenceItem(kind, item.id, { assetStatus: "active", assetRef });
    } catch (error) {
      updateReferenceItem(kind, item.id, {
        assetStatus: "error",
        errorMessage: error instanceof Error ? error.message : "레퍼런스 등록에 실패했습니다.",
      });
    }
  }

  function handleRemoveReferenceFile(kind: ReferenceKind, fileId: string) {
    if (kind === "image") {
      patchPanel({ referenceImages: panel.referenceImages.filter((item) => item.id !== fileId) });
    } else if (kind === "video") {
      patchPanel({ referenceVideos: panel.referenceVideos.filter((item) => item.id !== fileId) });
    } else {
      patchPanel({ referenceAudios: panel.referenceAudios.filter((item) => item.id !== fileId) });
    }
  }

  function resetPanelInputs() {
    setPanel(INITIAL_PANEL_STATE);
  }

  function handleTargetChange(next: GenerationTarget) {
    setTarget(next);
    if (next === "standalone") {
      setPanel((prev) => ({ ...prev, firstImage: null, lastImage: null, referenceImages: [] }));
    }
  }

  useEffect(() => {
    if (target !== "existing") return;

    const imageUrl = getSeedFirstFrameImageUrl(selectedSceneName);
    if (!imageUrl) return;

    let cancelled = false;
    (async () => {
      try {
        const file = await urlToFile(imageUrl, `${selectedSceneName}-first-frame.jpg`);
        if (cancelled) return;
        const item = createReferenceFileItem("image", file);
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
  }, [target, selectedSceneName, panel.mode]);

  async function handleGenerate() {
    let entryId: string;

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
        jobStatus: "idle",
        resultUrl: null,
        localPath: null,
        errorMessage: null,
      };
      setScenes((prev) => [...prev, newEntry]);
      entryId = newEntry.id;
    }

    setModalDismissed(false);
    setActiveJobId(entryId);
    updateScene(entryId, { jobStatus: "submitting", errorMessage: null, resultUrl: null, localPath: null });

    try {
      const request = await buildGenerateRequest(panel, DEFAULT_GENERATION_CONFIG);
      const predictionId = await submitGeneration(request);
      updateScene(entryId, { jobStatus: "processing" });

      const resultUrl = await pollGenerationUntilComplete(predictionId);
      const scene = scenes.find((s) => s.id === entryId);
      const localPath = await downloadGeneratedVideo(resultUrl, scene?.sceneName ?? "clip").catch(() => null);

      updateScene(entryId, { jobStatus: "succeeded", resultUrl, localPath });
      resetPanelInputs();
    } catch (error) {
      updateScene(entryId, {
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
          onFirstImageChange={(file) => patchPanel({ firstImage: file ? createReferenceFileItem("image", file) : null })}
          onLastImageChange={(file) => patchPanel({ lastImage: file ? createReferenceFileItem("image", file) : null })}
          referenceImages={panel.referenceImages}
          referenceVideos={panel.referenceVideos}
          referenceAudios={panel.referenceAudios}
          onAddReferenceFiles={handleAddReferenceFiles}
          onRemoveReferenceFile={handleRemoveReferenceFile}
          scenePrompt={panel.scenePrompt}
          onScenePromptChange={(value) => patchPanel({ scenePrompt: value })}
          onValidationError={setToast}
        />

        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
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
