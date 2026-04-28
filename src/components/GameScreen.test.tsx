import { render, screen } from "@testing-library/react";
import { GameScreen } from "./GameScreen";
import type { GameController, GameSnapshot } from "../controller/GameController";
import { createInitialGame } from "../game-core";
import "../i18n/i18n";

const controller = {
  dropPiece: vi.fn(),
  getSnapshot: vi.fn(),
  resetToSetup: vi.fn(),
  restart: vi.fn(),
  startGame: vi.fn(),
  subscribe: vi.fn()
} satisfies GameController;

function playingSnapshot(aiThinking: boolean): Extract<GameSnapshot, { phase: "playing" }> {
  const game = createInitialGame(aiThinking ? "yellow" : "red");

  return {
    phase: "playing",
    setup: {
      startMode: "red",
      players: {
        red: { id: "red", kind: "human", name: "Red" },
        yellow: { id: "yellow", kind: "ai", name: "AI", aiLevel: "medium" }
      }
    },
    game,
    resolvedStarter: "red",
    legalMoves: [0, 1, 2, 3, 4, 5, 6],
    aiThinking,
    lastError: null
  };
}

describe("GameScreen", () => {
  it("shows a board spinner while AI is thinking", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(true)} />);

    expect(screen.getByTestId("ai-thinking-spinner")).toHaveClass("animate-spin");
  });

  it("hides the spinner outside AI thinking state", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    expect(screen.queryByTestId("ai-thinking-spinner")).not.toBeInTheDocument();
  });
});
