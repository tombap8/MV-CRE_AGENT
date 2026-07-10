"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";
import { VideoPreviewModal } from "@/components/features/video-preview-modal";
import { Badge } from "@/components/ui/badge";
import type { SceneEntry, SceneJobStatus } from "@/lib/atlas/types";

function localVideoUrl(localPath: string | null): string | null {
  if (!localPath) return null;
  const filename = localPath.split("/").pop();
  return filename ? `/api/outputs/${filename}` : null;
}

export function SceneClipList({ scenes }: { scenes: SceneEntry[] }) {
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);
  const previewScene = scenes.find((s) => s.id === previewSceneId) ?? null;
  const previewSrc = previewScene ? localVideoUrl(previewScene.localPath) ?? previewScene.resultUrl : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => {
          // Prefer the locally downloaded copy — Atlas's CDN result URL is only
          // temporarily valid and isn't reliably embeddable for direct playback.
          const thumbSrc = localVideoUrl(scene.localPath) ?? scene.resultUrl;

          return (
            <div key={scene.id} className="flex flex-col gap-2 rounded-xxl border border-hairline p-4">
              <button
                type="button"
                onClick={() => thumbSrc && setPreviewSceneId(scene.id)}
                disabled={!thumbSrc}
                className={`group relative h-32 overflow-hidden rounded-lg ${
                  thumbSrc || scene.firstFrameImageUrl ? "bg-ink" : scene.gradientClassName
                } ${thumbSrc ? "cursor-pointer" : "cursor-default"}`}
              >
                {thumbSrc ? (
                  <>
                    <video src={thumbSrc} muted preload="metadata" className="h-full w-full object-contain" />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/30">
                      <PlayIcon className="h-9 w-9 text-on-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                  </>
                ) : scene.firstFrameImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={scene.firstFrameImageUrl}
                    alt={scene.sceneName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>

              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{scene.sceneName}</span>
                <StatusBadge status={scene.jobStatus} />
              </div>

              {scene.jobStatus === "failed" && scene.errorMessage && (
                <span className="text-xs text-brand-coral">{scene.errorMessage}</span>
              )}
              {scene.localPath && <span className="truncate text-xs text-steel">저장됨: {scene.localPath}</span>}
            </div>
          );
        })}
      </div>

      {previewScene && previewSrc && (
        <VideoPreviewModal
          src={previewSrc}
          title={previewScene.sceneName}
          onClose={() => setPreviewSceneId(null)}
        />
      )}
    </>
  );
}

function StatusBadge({ status }: { status: SceneJobStatus }) {
  if (status === "idle") return <Badge tone="purple">대기</Badge>;
  if (status === "submitting" || status === "processing") return <Badge tone="yellow">생성 중</Badge>;
  if (status === "succeeded") return <Badge tone="success">완료</Badge>;
  return <Badge tone="coral">실패</Badge>;
}
