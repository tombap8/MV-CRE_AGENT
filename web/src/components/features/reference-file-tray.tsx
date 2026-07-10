"use client";

import type { ChangeEvent } from "react";
import { CloseIcon, ImageIcon } from "@/components/icons";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, MAX_REFERENCE_IMAGES } from "@/lib/atlas/config";
import type { ReferenceFileItem } from "@/lib/atlas/types";

interface ReferenceFileTrayProps {
  images: ReferenceFileItem[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onValidationError?: (message: string) => void;
}

export function ReferenceFileTray({ images, onAddFiles, onRemove, onValidationError }: ReferenceFileTrayProps) {
  const remainingSlots = MAX_REFERENCE_IMAGES - images.length;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    const oversized = picked.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      onValidationError?.(
        `이미지 파일(${(oversized.size / (1024 * 1024)).toFixed(1)}MB)이 제한(30MB)을 초과합니다.`
      );
      return;
    }

    if (picked.length > remainingSlots) {
      onValidationError?.(`이미지는 최대 ${MAX_REFERENCE_IMAGES}개까지 첨부할 수 있습니다.`);
    }

    onAddFiles(picked.slice(0, remainingSlots));
  }

  return (
    <div className="flex flex-col gap-2 rounded-xxl border border-hairline p-5">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <ImageIcon />
        이미지 ({images.length}/{MAX_REFERENCE_IMAGES})
        <span className="font-normal text-steel">· 1개 이상 필수</span>
      </span>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((item, index) => (
          <ReferenceSlot key={item.id} index={index + 1} item={item} onRemove={() => onRemove(item.id)} />
        ))}

        {remainingSlots > 0 && (
          <label className="flex h-20 w-20 flex-none cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline-strong text-steel transition-colors hover:border-brand-blue hover:text-brand-blue">
            <span className="text-2xl leading-none">+</span>
            <input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />

      <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
        {index}
      </span>

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
