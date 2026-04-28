import { applyMove, createInitialGame, getLegalMoves } from "../game-core";
import type { GameState } from "../game-core";
import { chooseAiMove, getAiStrategyConfig } from "./minimax";

function playMoves(state: GameState, columns: number[]): GameState {
  return columns.reduce((current, column) => applyMove(current, column), state);
}

describe("AI minimax", () => {
  it("chooses an immediate winning move", () => {
    const state = playMoves(createInitialGame("red"), [0, 0, 1, 1, 2, 2]);

    expect(chooseAiMove(state, "hard")).toBe(3);
  });

  it("blocks an immediate opponent win", () => {
    const state = playMoves(createInitialGame("red"), [6, 0, 6, 1, 5, 2]);

    expect(chooseAiMove(state, "hard")).toBe(3);
  });

  it("returns only legal moves", () => {
    const state = playMoves(createInitialGame("red"), [0, 0, 0, 0, 0, 0]);
    const move = chooseAiMove(state, "medium");

    expect(getLegalMoves(state)).toContain(move);
  });

  it("prefers the center column on an empty hard game", () => {
    const state = createInitialGame("red");

    expect(chooseAiMove(state, "hard")).toBe(3);
  });

  it("maps difficulty to expected strategy depth", () => {
    expect(getAiStrategyConfig("easy")).toEqual({ depth: 1, random: true });
    expect(getAiStrategyConfig("medium")).toEqual({ depth: 3, random: false });
    expect(getAiStrategyConfig("hard")).toEqual({ depth: 5, random: false });
  });
});
