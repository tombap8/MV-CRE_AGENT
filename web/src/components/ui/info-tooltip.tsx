"use client";

import { useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-hairline-strong text-[10px] font-semibold text-steel"
        aria-label="설명 보기"
      >
        ?
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs leading-relaxed text-on-primary shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
