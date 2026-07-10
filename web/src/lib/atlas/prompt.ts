import type { Direction } from "@/components/features/motion-direction-pad";

const DIRECTION_PHRASES: Partial<Record<Direction, string>> = {
  "Pan Left": "camera pans left",
  "Pan Right": "camera pans right",
  "Tilt Up": "camera tilts up",
  "Tilt Down": "camera tilts down",
};

const INTENSITY_LABELS = [
  "very subtle", "subtle", "gentle", "light", "moderate",
  "moderate", "noticeable", "strong", "intense", "extreme",
];
const SPEED_LABELS = [
  "very slow", "slow", "slow", "unhurried", "medium",
  "medium", "brisk", "fast", "fast", "very fast",
];

export function buildMotionSuffix(direction: Direction, intensity: number, speed: number): string {
  const intensityLabel = INTENSITY_LABELS[Math.min(9, Math.max(0, intensity - 1))];
  const speedLabel = SPEED_LABELS[Math.min(9, Math.max(0, speed - 1))];
  const directionPhrase = DIRECTION_PHRASES[direction];
  const motionPhrase = `${intensityLabel} motion intensity, ${speedLabel} pace`;
  return directionPhrase ? `${directionPhrase}, ${motionPhrase}` : motionPhrase;
}

export function composeFirstLastPrompt(
  scenePrompt: string,
  direction: Direction,
  intensity: number,
  speed: number
): string {
  const suffix = buildMotionSuffix(direction, intensity, speed);
  const trimmed = scenePrompt.trim();
  return trimmed ? `${trimmed}, ${suffix}` : suffix;
}
