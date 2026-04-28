import { fireEvent, render, screen } from "@testing-library/react";
import { GameBoard } from "./GameBoard";
import { createInitialGame } from "../game-core";
import "../i18n/i18n";

describe("GameBoard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drops a checker when any cell area in a column is clicked", () => {
    const onDrop = vi.fn();

    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={onDrop}
      />
    );

    fireEvent.click(screen.getByTestId("cell-4-2"));

    expect(onDrop).toHaveBeenCalledWith(2);
  });

  it("does not drop when the clicked column is disabled", () => {
    const onDrop = vi.fn();

    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 3, 4, 5, 6]}
        onDrop={onDrop}
      />
    );

    fireEvent.click(screen.getByTestId("cell-4-2"));

    expect(onDrop).not.toHaveBeenCalled();
  });

  it("does not show a disabled overlay while clicks are blocked", () => {
    render(
      <GameBoard
        disabled={true}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={vi.fn()}
      />
    );

    expect(screen.getByTestId("board-grid")).not.toHaveClass("opacity-80");
    expect(screen.getByTestId("board-grid")).not.toHaveClass("cursor-not-allowed");
  });

  it("does not add a focus ring class to the board grid", () => {
    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={vi.fn()}
      />
    );

    expect(screen.getByTestId("board-grid").className).not.toContain("focus:ring");
  });

  it("drops a checker when the board gap inside a column is clicked", () => {
    const onDrop = vi.fn();

    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={onDrop}
      />
    );

    const grid = screen.getByTestId("board-grid");
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      bottom: 600,
      height: 600,
      left: 0,
      right: 700,
      top: 0,
      width: 700,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });

    fireEvent.click(grid, { clientX: 250 });

    expect(onDrop).toHaveBeenCalledWith(2);
  });
});
