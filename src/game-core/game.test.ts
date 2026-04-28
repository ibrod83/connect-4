import {
  applyMove,
  checkWinner,
  createInitialGame,
  getLegalMoves,
  isDraw
} from "./game";
import { resolveStarter } from "./starter";
import type { Cell, GameState, PlayerId } from "./types";

function playMoves(starter: PlayerId, columns: number[]): GameState {
  return columns.reduce((state, column) => applyMove(state, column), createInitialGame(starter));
}

describe("game-core", () => {
  it("creates an empty game with an explicit red starter", () => {
    const state = createInitialGame("red");

    expect(state.status).toEqual({ type: "in_progress", currentPlayer: "red" });
    expect(state.board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it("creates an empty game with an explicit yellow starter", () => {
    const state = createInitialGame("yellow");

    expect(state.status).toEqual({ type: "in_progress", currentPlayer: "yellow" });
  });

  it("resolves random starters to red or yellow", () => {
    expect(resolveStarter("random", () => 0.1)).toBe("red");
    expect(resolveStarter("random", () => 0.9)).toBe("yellow");
  });

  it("detects legal moves and drops pieces into the lowest open row", () => {
    const firstMove = applyMove(createInitialGame("red"), 3);

    expect(getLegalMoves(firstMove)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(firstMove.board[5][3]).toBe("red");
    expect(firstMove.status).toEqual({ type: "in_progress", currentPlayer: "yellow" });
  });

  it("rejects a full column", () => {
    const state = playMoves("red", [0, 0, 0, 0, 0, 0]);

    expect(() => applyMove(state, 0)).toThrow("Column 0 is full.");
  });

  it("detects a horizontal win", () => {
    const state = playMoves("red", [0, 0, 1, 1, 2, 2, 3]);

    expect(state.status).toMatchObject({ type: "won", winner: "red" });
    expect(checkWinner(state.board)?.winningCells).toEqual([
      { row: 5, column: 0 },
      { row: 5, column: 1 },
      { row: 5, column: 2 },
      { row: 5, column: 3 }
    ]);
  });

  it("detects a vertical win", () => {
    const state = playMoves("red", [0, 1, 0, 1, 0, 1, 0]);

    expect(state.status).toMatchObject({ type: "won", winner: "red" });
  });

  it("detects a rising diagonal win", () => {
    const state = playMoves("red", [0, 1, 1, 2, 2, 3, 2, 3, 6, 3, 3]);

    expect(state.status).toMatchObject({ type: "won", winner: "red" });
    expect(checkWinner(state.board)?.winningCells).toEqual([
      { row: 2, column: 3 },
      { row: 3, column: 2 },
      { row: 4, column: 1 },
      { row: 5, column: 0 }
    ]);
  });

  it("detects a falling diagonal win", () => {
    const state = playMoves("red", [3, 2, 2, 1, 1, 0, 1, 0, 6, 0, 0]);

    expect(state.status).toMatchObject({ type: "won", winner: "red" });
    expect(checkWinner(state.board)?.winningCells).toEqual([
      { row: 2, column: 0 },
      { row: 3, column: 1 },
      { row: 4, column: 2 },
      { row: 5, column: 3 }
    ]);
  });

  it("detects a draw after the last open cell is filled", () => {
    const finalBoard: Cell[][] = [
      ["red", "yellow", "red", "yellow", "red", "yellow", "red"],
      ["red", "yellow", "red", "yellow", "red", "yellow", "red"],
      ["yellow", "red", "yellow", "red", "yellow", "red", "yellow"],
      ["yellow", "red", "yellow", "red", "yellow", "red", "yellow"],
      ["red", "yellow", "red", "yellow", "red", "yellow", "red"],
      ["red", "yellow", "red", "yellow", "red", "yellow", "red"]
    ];
    const almostFullBoard = finalBoard.map((row) => [...row]);
    almostFullBoard[0][0] = null;
    const state: GameState = {
      board: almostFullBoard,
      rows: 6,
      columns: 7,
      status: { type: "in_progress", currentPlayer: "red" },
      moveHistory: []
    };

    const result = applyMove(state, 0);

    expect(isDraw(result)).toBe(true);
  });

  it("does not mutate previous states", () => {
    const state = createInitialGame("red");
    const nextState = applyMove(state, 0);

    expect(state.board[5][0]).toBeNull();
    expect(nextState.board[5][0]).toBe("red");
  });
});
