import {
  applyMove,
  getLegalMoves,
  getOpponent
} from "../game-core/game";
import { COLUMNS, type AiLevel, type Cell, type GameState, type PlayerId, ROWS } from "../game-core/types";

export type ScoredMove = {
  column: number;
  score: number;
};

export type AiStrategyConfig = {
  depth: number;
  random: boolean;
};

const WIN_SCORE = 1_000_000;
const CENTER_COLUMN = Math.floor(COLUMNS / 2);

export function getAiStrategyConfig(level: AiLevel): AiStrategyConfig {
  if (level === "easy") {
    return { depth: 2, random: false };
  }

  if (level === "medium") {
    return { depth: 3, random: false };
  }

  if (level === "hard") {
    return { depth: 5, random: false };
  }

  return { depth: 7, random: false };
}

export function chooseAiMove(
  state: GameState,
  level: AiLevel,
  random: () => number = Math.random
): number {
  const legalMoves = getLegalMoves(state);

  if (legalMoves.length === 0) {
    throw new Error("AI cannot move without legal moves.");
  }

  if (state.status.type !== "in_progress") {
    throw new Error("AI cannot move after the game has ended.");
  }

  const config = getAiStrategyConfig(level);

  if (config.random) {
    return legalMoves[Math.floor(random() * legalMoves.length)];
  }

  const result = minimax(
    state,
    config.depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    state.status.currentPlayer
  );

  return result.column;
}

export function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiPlayer: PlayerId
): ScoredMove {
  const legalMoves = orderMoves(getLegalMoves(state));

  if (state.status.type === "won") {
    const multiplier = state.status.winner === aiPlayer ? 1 : -1;
    return { column: legalMoves[0] ?? CENTER_COLUMN, score: multiplier * (WIN_SCORE + depth) };
  }

  if (state.status.type === "draw" || depth === 0 || legalMoves.length === 0) {
    return {
      column: legalMoves[0] ?? CENTER_COLUMN,
      score: scoreBoard(state, aiPlayer)
    };
  }

  if (maximizingPlayer) {
    let best: ScoredMove = { column: legalMoves[0], score: Number.NEGATIVE_INFINITY };
    let nextAlpha = alpha;

    for (const column of legalMoves) {
      const nextState = applyMove(state, column);
      const score = minimax(nextState, depth - 1, nextAlpha, beta, false, aiPlayer).score;

      if (score > best.score) {
        best = { column, score };
      }

      nextAlpha = Math.max(nextAlpha, score);

      if (nextAlpha >= beta) {
        break;
      }
    }

    return best;
  }

  let best: ScoredMove = { column: legalMoves[0], score: Number.POSITIVE_INFINITY };
  let nextBeta = beta;

  for (const column of legalMoves) {
    const nextState = applyMove(state, column);
    const score = minimax(nextState, depth - 1, alpha, nextBeta, true, aiPlayer).score;

    if (score < best.score) {
      best = { column, score };
    }

    nextBeta = Math.min(nextBeta, score);

    if (alpha >= nextBeta) {
      break;
    }
  }

  return best;
}

export function scoreBoard(state: GameState, aiPlayer: PlayerId): number {
  const opponent = getOpponent(aiPlayer);
  let score = 0;

  const centerCells = state.board.map((row) => row[CENTER_COLUMN]);
  score += centerCells.filter((cell) => cell === aiPlayer).length * 6;
  score -= centerCells.filter((cell) => cell === opponent).length * 6;

  for (const window of getWindows(state.board)) {
    score += scoreWindow(window, aiPlayer);
    score -= scoreWindow(window, opponent);
  }

  return score;
}

function scoreWindow(window: Cell[], player: PlayerId): number {
  const playerCount = window.filter((cell) => cell === player).length;
  const emptyCount = window.filter((cell) => cell === null).length;

  if (playerCount === 4) {
    return 10_000;
  }

  if (playerCount === 3 && emptyCount === 1) {
    return 90;
  }

  if (playerCount === 2 && emptyCount === 2) {
    return 12;
  }

  if (playerCount === 1 && emptyCount === 3) {
    return 1;
  }

  return 0;
}

function getWindows(board: Cell[][]): Cell[][] {
  const windows: Cell[][] = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column <= COLUMNS - 4; column += 1) {
      windows.push([
        board[row][column],
        board[row][column + 1],
        board[row][column + 2],
        board[row][column + 3]
      ]);
    }
  }

  for (let column = 0; column < COLUMNS; column += 1) {
    for (let row = 0; row <= ROWS - 4; row += 1) {
      windows.push([
        board[row][column],
        board[row + 1][column],
        board[row + 2][column],
        board[row + 3][column]
      ]);
    }
  }

  for (let row = 0; row <= ROWS - 4; row += 1) {
    for (let column = 0; column <= COLUMNS - 4; column += 1) {
      windows.push([
        board[row][column],
        board[row + 1][column + 1],
        board[row + 2][column + 2],
        board[row + 3][column + 3]
      ]);
    }
  }

  for (let row = 0; row <= ROWS - 4; row += 1) {
    for (let column = 3; column < COLUMNS; column += 1) {
      windows.push([
        board[row][column],
        board[row + 1][column - 1],
        board[row + 2][column - 2],
        board[row + 3][column - 3]
      ]);
    }
  }

  return windows;
}

function orderMoves(moves: number[]): number[] {
  return [...moves].sort(
    (left, right) => Math.abs(left - CENTER_COLUMN) - Math.abs(right - CENTER_COLUMN)
  );
}
