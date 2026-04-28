import { useSyncExternalStore } from "react";
import type { GameController, GameSnapshot } from "../controller/GameController";

export function useGameController(controller: GameController): GameSnapshot {
  return useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getSnapshot(),
    () => controller.getSnapshot()
  );
}
