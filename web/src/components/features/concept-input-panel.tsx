"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/button";

type ConceptTab = "text" | "image";

export function ConceptInputPanel() {
  const [tab, setTab] = useState<ConceptTab>("text");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex rounded-full bg-surface p-1">
        <TabButton active={tab === "text"} onClick={() => setTab("text")}>
          Text Prompt
        </TabButton>
        <TabButton active={tab === "image"} onClick={() => setTab("image")}>
          Image Reference
        </TabButton>
      </div>

      {tab === "text" ? (
        <textarea
          placeholder="Describe your music video concept:"
          className="h-96 w-full resize-none rounded-xxl border border-hairline-strong p-6 text-base text-ink placeholder:text-slate focus:border-brand-blue focus:outline-none"
        />
      ) : (
        <label className="flex h-96 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xxl border border-dashed border-hairline-strong text-slate">
          <span className="text-base">이미지 레퍼런스를 업로드하세요</span>
          <span className="text-sm text-stone">JPG, PNG · 최대 10MB</span>
          <input type="file" accept="image/*" className="hidden" />
        </label>
      )}

      <div className="flex justify-end gap-3">
        <LinkButton href="/projects/new/lyrics" variant="secondary">
          Create Lyrics First
        </LinkButton>
        <LinkButton href="/projects/new/style" variant="primary">
          Fast Generate
        </LinkButton>
      </div>
    </div>
  );
}

function TabButton({
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
      className={`flex-1 rounded-full px-6 py-3 text-sm font-medium transition-colors ${
        active ? "bg-canvas text-ink shadow-sm" : "text-steel"
      }`}
    >
      {children}
    </button>
  );
}
