"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { liveMentionLabel } from "@/lib/atlas/mentions";
import type { PromptPart, ReferenceFileItem } from "@/lib/atlas/types";

interface MentionOption {
  label: string;
  fileName: string;
  refId: string;
}

interface MentionPromptInputProps {
  parts: PromptPart[];
  onPartsChange: (parts: PromptPart[]) => void;
  images: ReferenceFileItem[];
  placeholder?: string;
}

const CHIP_CLASS = "mx-0.5 inline-flex select-none items-center rounded-full bg-lavender-light px-2 py-0.5 text-sm font-medium text-lavender-text";
const CHIP_CLASS_BROKEN = "mx-0.5 inline-flex select-none items-center rounded-full bg-brand-coral px-2 py-0.5 text-sm font-medium text-on-primary";

function buildOptions(images: ReferenceFileItem[]): MentionOption[] {
  return images.map((item, i) => ({ label: `image ${i + 1}`, fileName: item.file.name, refId: item.id }));
}

function createChipElement(option: MentionOption): HTMLSpanElement {
  const chip = document.createElement("span");
  chip.contentEditable = "false";
  chip.dataset.refId = option.refId;
  chip.className = CHIP_CLASS;
  chip.textContent = option.label;
  return chip;
}

function readPartsFromElement(el: HTMLElement): PromptPart[] {
  const parts: PromptPart[] = [];
  let text = "";

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
      return;
    }
    if (node instanceof HTMLElement && node.dataset.refId) {
      if (text) {
        parts.push({ type: "text", value: text });
        text = "";
      }
      parts.push({ type: "mention", id: crypto.randomUUID(), refId: node.dataset.refId });
      return;
    }
    // stray elements (e.g. a browser-inserted <br>) - fall back to their text content
    text += node.textContent ?? "";
  });

  if (text) parts.push({ type: "text", value: text });
  return parts;
}

function renderPartsIntoElement(el: HTMLElement, parts: PromptPart[]) {
  el.innerHTML = "";
  for (const part of parts) {
    if (part.type === "text") {
      el.appendChild(document.createTextNode(part.value));
    } else {
      const chip = document.createElement("span");
      chip.contentEditable = "false";
      chip.dataset.refId = part.refId;
      el.appendChild(chip);
    }
  }
}

interface TriggerInfo {
  textNode: Text;
  atIndex: number;
  caretOffset: number;
}

function getTriggerInfo(container: HTMLElement): TriggerInfo | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE || !container.contains(node)) return null;

  const text = node.textContent ?? "";
  const offset = range.startOffset;
  const uptoCaret = text.slice(0, offset);
  const atIndex = uptoCaret.lastIndexOf("@");
  if (atIndex === -1 || /\s/.test(uptoCaret.slice(atIndex + 1))) return null;

  return { textNode: node as Text, atIndex, caretOffset: offset };
}

export function MentionPromptInput({ parts, onPartsChange, images, placeholder }: MentionPromptInputProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const options = buildOptions(images);

  const updateChipLabels = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-ref-id]").forEach((chip) => {
      const refId = chip.dataset.refId!;
      const { label, broken } = liveMentionLabel({ refId }, images);
      chip.textContent = label;
      chip.className = broken ? CHIP_CLASS_BROKEN : CHIP_CLASS;
    });
  }, [images]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    renderPartsIntoElement(el, parts);
    updateChipLabels();
    // mount-only: subsequent edits are synced imperatively, not by re-rendering from `parts`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateChipLabels();
  }, [updateChipLabels]);

  function syncFromDom() {
    const el = editorRef.current;
    if (!el) return;
    onPartsChange(readPartsFromElement(el));
  }

  function handleInput() {
    syncFromDom();
    const el = editorRef.current;
    if (!el) return;
    setMentionOpen(getTriggerInfo(el) !== null && options.length > 0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.execCommand("insertText", false, "\n");
      handleInput();
    }
  }

  function handleSelect(option: MentionOption) {
    const el = editorRef.current;
    if (!el) return;
    const trigger = getTriggerInfo(el);
    if (!trigger) return;

    const range = document.createRange();
    range.setStart(trigger.textNode, trigger.atIndex);
    range.setEnd(trigger.textNode, trigger.caretOffset);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    range.deleteContents();

    const chip = createChipElement(option);
    range.insertNode(chip);

    const spaceNode = document.createTextNode(" ");
    chip.after(spaceNode);

    const caretRange = document.createRange();
    caretRange.setStart(spaceNode, 1);
    caretRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(caretRange);

    el.focus();
    updateChipLabels();
    syncFromDom();
    setMentionOpen(false);
  }

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setMentionOpen(false)}
        data-placeholder={
          placeholder ?? '프롬프트를 입력하세요. "@"를 입력해 첨부한 이미지를 인용할 수 있습니다.'
        }
        className="min-h-28 w-full resize-none whitespace-pre-wrap rounded-lg border border-hairline-strong bg-canvas p-3 text-sm text-ink outline-none empty:before:text-steel empty:before:content-[attr(data-placeholder)] focus:border-brand-blue"
      />

      {mentionOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-hairline bg-canvas shadow-lg">
          {options.map((option) => (
            <button
              key={option.refId}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface"
            >
              <span className="font-medium text-ink">{option.label}</span>
              <span className="truncate text-steel">{option.fileName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
