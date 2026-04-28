import type { PlayerId, StartMode } from "./types";

export type RandomSource = () => number;

export function resolveStarter(
  startMode: StartMode,
  random: RandomSource = Math.random
): PlayerId {
  if (startMode === "red" || startMode === "yellow") {
    return startMode;
  }

  return random() < 0.5 ? "red" : "yellow";
}
