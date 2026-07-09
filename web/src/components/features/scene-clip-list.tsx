import { Badge } from "@/components/ui/badge";
import type { SceneEntry, SceneJobStatus } from "@/lib/atlas/types";

export function SceneClipList({ scenes }: { scenes: SceneEntry[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {scenes.map((scene) => (
        <div key={scene.id} className="flex flex-col gap-2 rounded-xxl border border-hairline p-4">
          <div
            className={`h-32 overflow-hidden rounded-lg ${
              scene.resultUrl || scene.firstFrameImageUrl ? "bg-ink" : scene.gradientClassName
            }`}
          >
            {scene.resultUrl ? (
              <video src={scene.resultUrl} controls className="h-full w-full object-contain" />
            ) : scene.firstFrameImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scene.firstFrameImageUrl}
                alt={scene.sceneName}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-ink">{scene.sceneName}</span>
            <StatusBadge status={scene.jobStatus} />
          </div>

          {scene.jobStatus === "failed" && scene.errorMessage && (
            <span className="text-xs text-brand-coral">{scene.errorMessage}</span>
          )}
          {scene.localPath && <span className="truncate text-xs text-steel">저장됨: {scene.localPath}</span>}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: SceneJobStatus }) {
  if (status === "idle") return <Badge tone="purple">대기</Badge>;
  if (status === "submitting" || status === "processing") return <Badge tone="yellow">생성 중</Badge>;
  if (status === "succeeded") return <Badge tone="success">완료</Badge>;
  return <Badge tone="coral">실패</Badge>;
}
