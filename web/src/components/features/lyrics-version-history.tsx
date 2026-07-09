"use client";

import { useState } from "react";

interface VersionEntry {
  id: string;
  label: string;
  modified: string;
}

const VERSIONS: VersionEntry[] = [
  { id: "v3.1", label: "Draft 3.1 - Uptempo Rhymes", modified: "1 hour ago" },
  { id: "v2.5", label: "Draft 2.5 - Added Verse 2", modified: "1 hour ago" },
  { id: "v2.4", label: "Draft 2.4 - Added Verse 2", modified: "14 hours ago" },
  { id: "v2.3", label: "Draft 2.3 - Added Verse 1", modified: "14 hours ago" },
  { id: "v2.1", label: "Draft 2.1 - Added Verse 1", modified: "3 hours ago" },
  { id: "v1.7", label: "Draft 1.7 - Added Verse 1", modified: "4 hours ago" },
  { id: "v1.1", label: "Draft 1.1 - Initial Concept", modified: "6 hours ago" },
];

export function LyricsVersionHistory() {
  const [activeId, setActiveId] = useState(VERSIONS[0].id);

  return (
    <div className="flex flex-col gap-1 rounded-xxl border border-hairline p-6">
      <h2 className="mb-3 border-b border-hairline-soft pb-3 text-xl font-bold text-ink">
        Lyrics Version History
      </h2>

      {VERSIONS.map((version) => (
        <button
          key={version.id}
          type="button"
          onClick={() => setActiveId(version.id)}
          className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
            activeId === version.id ? "bg-surface" : "hover:bg-surface/60"
          }`}
        >
          <span className="text-sm font-semibold text-ink">{version.label}</span>
          <span className="text-xs text-steel">Modified {version.modified}</span>
        </button>
      ))}
    </div>
  );
}
