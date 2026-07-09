"use client";

import { useState } from "react";
import { ExportSettingsPanel } from "@/components/features/export-settings-panel";
import { VideoPreviewPlayer } from "@/components/features/video-preview-player";

export default function OutputPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <VideoPreviewPlayer
        posterClassName="bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500"
        posterHeightClassName="h-[480px]"
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        progress={28}
      />

      <ExportSettingsPanel />
    </div>
  );
}
