export const RESOLUTION_OPTIONS: Record<string, string> = {
  "480p": "480p",
  "720p (기본)": "720p",
  "720p-SR (업스케일)": "720p-SR",
  "1080p": "1080p",
  "1080p-SR (업스케일)": "1080p-SR",
  "1440p-SR (업스케일)": "1440p-SR",
  "4K": "4k",
};

export const RATIO_OPTIONS: Record<string, string> = {
  "자동 (adaptive)": "adaptive",
  "16:9 (가로)": "16:9",
  "9:16 (세로/모바일)": "9:16",
  "1:1 (정방형)": "1:1",
  "4:3": "4:3",
  "3:4": "3:4",
  "21:9 (와이드)": "21:9",
};

export const DURATION_OPTIONS: Record<string, number> = {
  "자동 (-1)": -1,
  "4초": 4,
  "5초 (기본)": 5,
  "6초": 6,
  "7초": 7,
  "8초": 8,
  "10초": 10,
  "12초": 12,
  "15초": 15,
};

export const BITRATE_OPTIONS: Record<string, "standard" | "high"> = {
  "표준 (Standard)": "standard",
  "고화질 (High)": "high",
};

export function labelForValue<T extends string | number>(map: Record<string, T>, value: T): string {
  const found = Object.entries(map).find(([, v]) => v === value);
  return found ? found[0] : Object.keys(map)[0];
}
