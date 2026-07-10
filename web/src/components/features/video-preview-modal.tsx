"use client";

import { CloseIcon } from "@/components/icons";

interface VideoPreviewModalProps {
  src: string;
  title: string;
  onClose: () => void;
}

export function VideoPreviewModal({ src, title, onClose }: VideoPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
      onClick={onClose}
    >
      <div className="flex max-h-full max-w-full flex-col gap-3" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-sm font-semibold text-on-dark">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-on-dark/10 text-on-dark transition-colors hover:bg-on-dark/20"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {/* w-auto/h-auto lets the video size itself from its own aspect ratio,
            capped by max-w/max-h so portrait or landscape clips both fit the screen. */}
        <video
          src={src}
          controls
          autoPlay
          className="h-auto max-h-[85vh] w-auto max-w-[90vw] rounded-lg bg-black"
        />
      </div>
    </div>
  );
}
