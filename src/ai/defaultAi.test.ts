import { applyMove, createInitialGame } from "../game-core";
import type { GameState } from "../game-core";
import { createDefaultAiMoveChooser, gameStateToMoveSequence } from "./defaultAi";

function playMoves(state: GameState, columns: number[]): GameState {
  return columns.reduce((current, column) => applyMove(current, column), state);
}

describe("default AI chooser", () => {
  it("converts move history to the 1-indexed sequence expected by the strong solver", () => {
    const state = playMoves(createInitialGame("red"), [0, 3, 6]);

    expect(gameStateToMoveSequence(state)).toBe("147");
  });

  it("keeps non-very-hard levels on the minimax fallback", () => {
    const fallback = vi.fn(() => 4);
    const requestStrongMove = vi.fn(async () => 2);
    const chooser = createDefaultAiMoveChooser({
      canUseStrongSolver: () => true,
      fallback,
      requestStrongMove
    });

    const state = createInitialGame("red");
    const abortController = new AbortController();

    expect(chooser(state, "hard", () => 0, abortController.signal)).toBe(4);
    expect(fallback).toHaveBeenCalledWith(state, "hard", expect.any(Function));
    expect(requestStrongMove).not.toHaveBeenCalled();
  });

  it("routes very hard through the strong solver when workers are available", async () => {
    const fallback = vi.fn(() => 4);
    const requestStrongMove = vi.fn(async () => 2);
    const chooser = createDefaultAiMoveChooser({
      canUseStrongSolver: () => true,
      fallback,
      requestStrongMove
    });

    const state = playMoves(createInitialGame("red"), [0, 1]);
    const abortController = new AbortController();

    await expect(chooser(state, "very_hard", () => 0, abortController.signal)).resolves.toBe(2);
    expect(requestStrongMove).toHaveBeenCalledWith({
      moves: "12",
      legalMoves: [0, 1, 2, 3, 4, 5, 6],
      signal: abortController.signal
    });
    expect(fallback).not.toHaveBeenCalled();
  });

  it("falls back to minimax when the strong solver cannot run", () => {
    const fallback = vi.fn(() => 3);
    const requestStrongMove = vi.fn(async () => 2);
    const chooser = createDefaultAiMoveChooser({
      canUseStrongSolver: () => false,
      fallback,
      requestStrongMove
    });

    const state = createInitialGame("red");
    const abortController = new AbortController();

    expect(chooser(state, "very_hard", () => 0, abortController.signal)).toBe(3);
    expect(fallback).toHaveBeenCalledWith(state, "very_hard", expect.any(Function));
    expect(requestStrongMove).not.toHaveBeenCalled();
  });

  it("falls back to minimax when the strong solver fails before cancellation", async () => {
    const fallback = vi.fn(() => 5);
    const requestStrongMove = vi.fn(async () => {
      throw new Error("WASM failed.");
    });
    const chooser = createDefaultAiMoveChooser({
      canUseStrongSolver: () => true,
      fallback,
      requestStrongMove
    });

    const state = createInitialGame("red");
    const abortController = new AbortController();

    await expect(chooser(state, "very_hard", () => 0, abortController.signal)).resolves.toBe(5);
    expect(fallback).toHaveBeenCalledWith(state, "very_hard", expect.any(Function));
  });

  it("does not run fallback after the strong solver request is cancelled", async () => {
    const fallback = vi.fn(() => 5);
    const requestStrongMove = vi.fn(async () => {
      throw new Error("AI move cancelled.");
    });
    const chooser = createDefaultAiMoveChooser({
      canUseStrongSolver: () => true,
      fallback,
      requestStrongMove
    });

    const state = createInitialGame("red");
    const abortController = new AbortController();
    abortController.abort();

    await expect(chooser(state, "very_hard", () => 0, abortController.signal)).rejects.toThrow(
      "AI move cancelled."
    );
    expect(fallback).not.toHaveBeenCalled();
  });
});
