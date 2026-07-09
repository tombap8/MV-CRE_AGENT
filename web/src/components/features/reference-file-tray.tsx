"use client";

import type { ChangeEvent } from "react";
import {
  CheckIcon,
  CloseIcon,
  ImageIcon,
  MusicNoteIcon,
  SpinnerIcon,
  VideoIcon,
} from "@/components/icons";
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_REFERENCE_AUDIOS,
  MAX_REFERENCE_IMAGES,
  MAX_REFERENCE_VIDEOS,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/atlas/config";
import type { ReferenceFileItem, ReferenceKind } from "@/lib/atlas/types";

interface ReferenceFileTrayProps {
  images: ReferenceFileItem[];
  videos: ReferenceFileItem[];
  audios: ReferenceFileItem[];
  onAddFiles: (kind: ReferenceKind, files: File[]) => void;
  onRemove: (kind: ReferenceKind, id: string) => void;
  onValidationError?: (message: string) => void;
}

const ROW_CONFIG: Record<
  ReferenceKind,
  { label: string; icon: React.ReactNode; maxCount: number; accept: string; sizeLimit: number; sizeLabel: string }
> = {
  image: {
    label: "이미지",
    icon: <ImageIcon />,
    maxCount: MAX_REFERENCE_IMAGES,
    accept: ALLOWED_IMAGE_TYPES.join(","),
    sizeLimit: MAX_IMAGE_SIZE_BYTES,
    sizeLabel: "30MB",
  },
  video: {
    label: "비디오",
    icon: <VideoIcon />,
    maxCount: MAX_REFERENCE_VIDEOS,
    accept: ALLOWED_VIDEO_TYPES.join(","),
    sizeLimit: MAX_VIDEO_SIZE_BYTES,
    sizeLabel: "50MB",
  },
  audio: {
    label: "오디오",
    icon: <MusicNoteIcon className="h-5 w-5" />,
    maxCount: MAX_REFERENCE_AUDIOS,
    accept: ALLOWED_AUDIO_TYPES.join(","),
    sizeLimit: MAX_AUDIO_SIZE_BYTES,
    sizeLabel: "15MB",
  },
};

export function ReferenceFileTray({
  images,
  videos,
  audios,
  onAddFiles,
  onRemove,
  onValidationError,
}: ReferenceFileTrayProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xxl border border-hairline p-5">
      <ReferenceSlotRow
        kind="image"
        items={images}
        onAddFiles={onAddFiles}
        onRemove={onRemove}
        onValidationError={onValidationError}
      />
      <ReferenceSlotRow
        kind="video"
        items={videos}
        onAddFiles={onAddFiles}
        onRemove={onRemove}
        onValidationError={onValidationError}
      />
      <ReferenceSlotRow
        kind="audio"
        items={audios}
        onAddFiles={onAddFiles}
        onRemove={onRemove}
        onValidationError={onValidationError}
      />
    </div>
  );
}

function ReferenceSlotRow({
  kind,
  items,
  onAddFiles,
  onRemove,
  onValidationError,
}: {
  kind: ReferenceKind;
  items: ReferenceFileItem[];
  onAddFiles: (kind: ReferenceKind, files: File[]) => void;
  onRemove: (kind: ReferenceKind, id: string) => void;
  onValidationError?: (message: string) => void;
}) {
  const config = ROW_CONFIG[kind];
  const remainingSlots = config.maxCount - items.length;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    const oversized = picked.find((file) => file.size > config.sizeLimit);
    if (oversized) {
      onValidationError?.(
        `${config.label} 파일(${(oversized.size / (1024 * 1024)).toFixed(1)}MB)이 제한(${config.sizeLabel})을 초과합니다.`
      );
      return;
    }

    if (picked.length > remainingSlots) {
      onValidationError?.(`${config.label}은 최대 ${config.maxCount}개까지 첨부할 수 있습니다.`);
    }

    onAddFiles(kind, picked.slice(0, remainingSlots));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        {config.icon}
        {config.label} ({items.length}/{config.maxCount})
      </span>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item, index) => (
          <ReferenceSlot
            key={item.id}
            index={index + 1}
            item={item}
            onRemove={() => onRemove(kind, item.id)}
          />
        ))}

        {remainingSlots > 0 && (
          <label className="flex h-20 w-20 flex-none cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline-strong text-steel transition-colors hover:border-brand-blue hover:text-brand-blue">
            <span className="text-2xl leading-none">+</span>
            <input
              type="file"
              accept={config.accept}
              multiple
              className="hidden"
              onChange={handleChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function ReferenceSlot({
  index,
  item,
  onRemove,
}: {
  index: number;
  item: ReferenceFileItem;
  onRemove: () => void;
}) {
  return (
    <div className="group relative h-20 w-20 flex-none overflow-hidden rounded-lg border border-hairline bg-surface">
      {item.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-steel">
          {item.kind === "video" ? <VideoIcon className="h-5 w-5" /> : <MusicNoteIcon className="h-5 w-5" />}
          <span className="w-full truncate text-center text-[10px]">{item.file.name}</span>
        </div>
      )}

      <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
        {index}
      </span>

      {item.kind !== "image" && <AssetStatusBadge status={item.assetStatus} />}

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 text-on-primary opacity-0 transition-opacity group-hover:opacity-100"
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

function AssetStatusBadge({ status }: { status: ReferenceFileItem["assetStatus"] }) {
  if (status === "active") {
    return (
      <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal text-on-primary">
        <CheckIcon />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-coral text-on-primary">
        <CloseIcon className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-hairline-strong text-ink">
      <SpinnerIcon />
    </span>
  );
}
