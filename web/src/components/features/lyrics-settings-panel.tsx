"use client";

import { useState } from "react";
import { SelectField } from "@/components/ui/select-field";

const SYLLABLE_OPTIONS = ["4-8", "8-12", "12-16"];
const THEME_OPTIONS = ["Hopeful, Melancholic", "Joyful, Energetic", "Nostalgic, Bittersweet"];
const RHYME_OPTIONS = ["AABB", "ABAB", "ABCB", "Free Verse"];

export function LyricsSettingsPanel() {
  const [syllables, setSyllables] = useState(SYLLABLE_OPTIONS[1]);
  const [theme, setTheme] = useState(THEME_OPTIONS[0]);
  const [rhyme, setRhyme] = useState(RHYME_OPTIONS[0]);

  return (
    <div className="flex flex-col gap-6 rounded-xxl border border-hairline p-6">
      <SelectField
        label="Syllable Count per Line"
        value={syllables}
        options={SYLLABLE_OPTIONS}
        onChange={setSyllables}
      />
      <SelectField
        label="Emotional Themes"
        value={theme}
        options={THEME_OPTIONS}
        onChange={setTheme}
      />
      <SelectField
        label="Rhyme Scheme"
        value={rhyme}
        options={RHYME_OPTIONS}
        onChange={setRhyme}
      />
    </div>
  );
}
