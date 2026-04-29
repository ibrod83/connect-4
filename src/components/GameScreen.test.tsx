import { render, screen } from "@testing-library/react";
import { GameScreen } from "./GameScreen";
import type { GameController, GameSnapshot } from "../controller/GameController";
import { createInitialGame } from "../game-core";
import i18n from "../i18n/i18n";

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
        red: { id: "red", kind: "human" },
        yellow: { id: "yellow", kind: "ai", aiLevel: "medium" }
      }
    },
    game,
    resolvedStarter: "red",
    legalMoves: [0, 1, 2, 3, 4, 5, 6],
    aiThinking,
    lastError: null
  };
}

function localPlayingSnapshot(): Extract<GameSnapshot, { phase: "playing" }> {
  const game = createInitialGame("red");

  return {
    phase: "playing",
    setup: {
      startMode: "red",
      players: {
        red: { id: "red", kind: "human" },
        yellow: { id: "yellow", kind: "human" }
      }
    },
    game,
    resolvedStarter: "red",
    legalMoves: [0, 1, 2, 3, 4, 5, 6],
    aiThinking: false,
    lastError: null
  };
}

describe("GameScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("shows nature-based identity in human versus AI games", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    expect(screen.getByText("Started: You")).toBeInTheDocument();
    expect(screen.getByText("Your turn")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("shows numbered player identity in local human games", () => {
    render(<GameScreen controller={controller} snapshot={localPlayingSnapshot()} />);

    expect(screen.getByText("Started: Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 1's turn")).toBeInTheDocument();
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("shows a board spinner while AI is thinking", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(true)} />);

    expect(screen.getByTestId("ai-thinking-spinner")).toHaveClass("animate-spin");
    expect(screen.getByText("AI is thinking")).toBeInTheDocument();
  });

  it("hides the spinner outside AI thinking state", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    expect(screen.queryByTestId("ai-thinking-spinner")).not.toBeInTheDocument();
  });
});
