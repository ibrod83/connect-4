import { fireEvent, render, screen, within } from "@testing-library/react";
import { GameScreen } from "./GameScreen";
import type { GameController, GameSnapshot } from "../controller/GameController";
import { applyMove, createInitialGame } from "../game-core";
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

function playingSnapshotWithoutExplicitAiLevel(): Extract<GameSnapshot, { phase: "playing" }> {
  const snapshot = playingSnapshot(false);

  return {
    ...snapshot,
    setup: {
      ...snapshot.setup,
      players: {
        red: snapshot.setup.players.red,
        yellow: { id: "yellow", kind: "ai" }
      }
    }
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

function wonSnapshot(): Extract<GameSnapshot, { phase: "playing" }> {
  const game = [0, 1, 0, 1, 0, 1, 0].reduce(
    (currentGame, column) => applyMove(currentGame, column),
    createInitialGame("red")
  );

  return {
    ...playingSnapshot(false),
    game,
    legalMoves: [],
    aiThinking: false
  };
}

describe("GameScreen", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("en");
  });

  it("shows nature-based identity in human versus AI games", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    expect(screen.getByText("Started: You")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4 in a Row" })).toHaveClass("sr-only");
    expect(screen.getByText("Your turn")).toHaveClass("sr-only");
    expect(screen.getByText("Your turn")).toHaveAttribute(
      "aria-live",
      "polite"
    );
    expect(screen.getByText("Difficulty")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("shows very hard as the default board difficulty when AI level is omitted", () => {
    render(
      <GameScreen controller={controller} snapshot={playingSnapshotWithoutExplicitAiLevel()} />
    );

    expect(screen.getByText("Difficulty")).toBeInTheDocument();
    expect(screen.getByText("Very hard")).toBeInTheDocument();
  });

  it("shows numbered player identity in local human games", () => {
    render(<GameScreen controller={controller} snapshot={localPlayingSnapshot()} />);

    expect(screen.getByText("Started: Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 1's turn")).toHaveClass("sr-only");
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
    expect(screen.queryByText("Difficulty")).not.toBeInTheDocument();
    expect(screen.queryByText("Red")).not.toBeInTheDocument();
  });

  it("shows a board spinner while AI is thinking", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(true)} />);

    expect(screen.getByTestId("ai-thinking-spinner")).toHaveClass("animate-spin");
    expect(screen.getByText("AI is thinking")).toHaveClass("sr-only");
  });

  it("hides the spinner outside AI thinking state", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    expect(screen.queryByTestId("ai-thinking-spinner")).not.toBeInTheDocument();
  });

  it("wires the board back button to the setup reset command", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    fireEvent.click(
      within(screen.getByTestId("game-board")).getByRole("button", {
        name: "Back to setup"
      })
    );

    expect(controller.resetToSetup).toHaveBeenCalledTimes(1);
  });

  it("keeps player badges visually static during active turns", () => {
    render(<GameScreen controller={controller} snapshot={playingSnapshot(false)} />);

    expect(screen.getByText("You").closest("div")).toHaveClass(
      "border-zinc-200",
      "bg-zinc-50"
    );
    expect(screen.getByText("AI").closest("div")).toHaveClass(
      "border-zinc-200",
      "bg-zinc-50"
    );
  });

  it("keeps game-over status visible", () => {
    render(<GameScreen controller={controller} snapshot={wonSnapshot()} />);

    expect(screen.getByRole("heading", { name: "You win" })).toBeInTheDocument();
  });
});
