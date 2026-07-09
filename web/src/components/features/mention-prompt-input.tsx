"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImageIcon, MusicNoteIcon, VideoIcon } from "@/components/icons";
import type { ReferenceFileItem, ReferenceKind } from "@/lib/atlas/types";

interface MentionOption {
  label: string;
  kind: ReferenceKind;
  fileName: string;
}

interface MentionPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  images: ReferenceFileItem[];
  videos: ReferenceFileItem[];
  audios: ReferenceFileItem[];
  placeholder?: string;
}

function buildOptions(
  images: ReferenceFileItem[],
  videos: ReferenceFileItem[],
  audios: ReferenceFileItem[]
): MentionOption[] {
  return [
    ...images.map((item, i) => ({ label: `image ${i + 1}`, kind: "image" as const, fileName: item.file.name })),
    ...videos.map((item, i) => ({ label: `video ${i + 1}`, kind: "video" as const, fileName: item.file.name })),
    ...audios.map((item, i) => ({ label: `audio ${i + 1}`, kind: "audio" as const, fileName: item.file.name })),
  ];
}

const KIND_ICON: Record<ReferenceKind, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4 text-steel" />,
  video: <VideoIcon className="h-4 w-4 text-steel" />,
  audio: <MusicNoteIcon className="h-4 w-4 text-steel" />,
};

export function MentionPromptInput({
  value,
  onChange,
  images,
  videos,
  audios,
  placeholder,
}: MentionPromptInputProps) {
  const [mentionOpen, setMentionOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const options = buildOptions(images, videos, audios);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    onChange(nextValue);

    const cursor = event.target.selectionStart;
    const uptoCursor = nextValue.slice(0, cursor);
    const triggerIndex = uptoCursor.lastIndexOf("@");

    if (triggerIndex === -1 || /\s/.test(uptoCursor.slice(triggerIndex + 1))) {
      setMentionOpen(false);
      return;
    }
    setMentionOpen(options.length > 0);
  }

  function handleSelect(option: MentionOption) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const uptoCursor = value.slice(0, cursor);
    const triggerIndex = uptoCursor.lastIndexOf("@");
    if (triggerIndex === -1) return;

    const before = value.slice(0, triggerIndex);
    const after = value.slice(cursor);
    const inserted = `${option.label} `;
    const nextValue = `${before}${inserted}${after}`;

    onChange(nextValue);
    setMentionOpen(false);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = before.length + inserted.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={() => setMentionOpen(false)}
        placeholder={placeholder ?? '프롬프트를 입력하세요. "@"를 입력해 첨부한 파일을 인용할 수 있습니다.'}
        rows={4}
        className="w-full resize-none rounded-lg border border-hairline-strong bg-canvas p-3 text-sm text-ink outline-none focus:border-brand-blue"
      />

      {mentionOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-hairline bg-canvas shadow-lg">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface"
            >
              {KIND_ICON[option.kind]}
              <span className="font-medium text-ink">{option.label}</span>
              <span className="truncate text-steel">{option.fileName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
