import type { RandomSource } from "../game-core/starter";
import type { AiLevel, GameState } from "../game-core/types";

export type AiMoveResult = number | PromiseLike<number>;

export type AiMoveChooser = (
  state: GameState,
  level: AiLevel,
  random: RandomSource,
  signal: AbortSignal
) => AiMoveResult;
