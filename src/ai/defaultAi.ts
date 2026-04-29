import { getLegalMoves } from "../game-core/game";
import type { AiLevel, GameState } from "../game-core/types";
import { chooseAiMove as chooseMinimaxMove } from "./minimax";
import {
  canUseStrongSolverWorker,
  requestStrongSolverMove,
  type StrongSolverMoveRequest
} from "./strongSolverClient";
import type { AiMoveChooser, AiMoveResult } from "./types";

type StrongSolverRequester = (request: StrongSolverMoveRequest) => Promise<number>;

type DefaultAiMoveChooserOptions = {
  canUseStrongSolver?: () => boolean;
  fallback?: typeof chooseMinimaxMove;
  requestStrongMove?: StrongSolverRequester;
};

export function createDefaultAiMoveChooser({
  canUseStrongSolver = canUseStrongSolverWorker,
  fallback = chooseMinimaxMove,
  requestStrongMove = requestStrongSolverMove
}: DefaultAiMoveChooserOptions = {}): AiMoveChooser {
  return (state, level, random, signal) => {
    if (level !== "very_hard" || !canUseStrongSolver()) {
      return fallback(state, level, random);
    }

    return chooseVeryHardMove(state, level, random, signal, fallback, requestStrongMove);
  };
}

export const chooseDefaultAiMove = createDefaultAiMoveChooser();

export function gameStateToMoveSequence(state: GameState): string {
  return state.moveHistory.map((move) => String(move.column + 1)).join("");
}

function chooseVeryHardMove(
  state: GameState,
  level: AiLevel,
  random: () => number,
  signal: AbortSignal,
  fallback: typeof chooseMinimaxMove,
  requestStrongMove: StrongSolverRequester
): AiMoveResult {
  const legalMoves = getLegalMoves(state);

  if (legalMoves.length === 0 || state.status.type !== "in_progress") {
    return fallback(state, level, random);
  }

  return requestStrongMove({
    moves: gameStateToMoveSequence(state),
    legalMoves,
    signal
  }).catch((error: unknown) => {
    if (signal.aborted) {
      throw error;
    }

    return fallback(state, level, random);
  });
}
