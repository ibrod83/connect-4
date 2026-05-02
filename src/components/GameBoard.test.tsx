import { fireEvent, render, screen } from "@testing-library/react";
import { GameBoard } from "./GameBoard";
import { applyMove, createInitialGame } from "../game-core";
import "../i18n/i18n";

describe("GameBoard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("drops a checker when a column button is clicked", () => {
    const onDrop = vi.fn();

    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={onDrop}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Drop in column 3" }));

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

    const columnButton = screen.getByRole("button", { name: "Column 3 is full" });

    expect(columnButton).toBeDisabled();
    fireEvent.click(columnButton);

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

  it("describes the board controls to assistive technology", () => {
    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={vi.fn()}
      />
    );

    expect(screen.getByRole("group", { name: "4 in a Row board" })).toHaveAccessibleDescription(
      "Use the column buttons or number keys 1 through 7 to drop a piece."
    );
  });

  it("keeps winning checkers animated under the disabled control layer", () => {
    const game = [0, 0, 1, 1, 2, 2, 3].reduce(
      (nextGame, column) => applyMove(nextGame, column),
      createInitialGame("red")
    );

    render(
      <GameBoard disabled={true} game={game} legalMoves={[]} onDrop={vi.fn()} />
    );

    expect(screen.getByTestId("column-button-0").className).toContain(
      "appearance-none"
    );
    expect(screen.getByTestId("column-button-0").className).toContain(
      "disabled:bg-transparent"
    );

    for (const column of [0, 1, 2, 3]) {
      const checker = screen
        .getByTestId(`cell-5-${column}`)
        .querySelector("[data-checker-anim]");

      expect(checker).not.toBeNull();
      expect((checker as HTMLElement).style.animation).toContain("win-pop");
    }
  });

  it("lets the final winning checker drop before its win animation", () => {
    const preWinGame = [0, 0, 1, 1, 2, 2].reduce(
      (nextGame, column) => applyMove(nextGame, column),
      createInitialGame("red")
    );
    const winningGame = applyMove(preWinGame, 3);
    const { rerender } = render(
      <GameBoard
        disabled={false}
        game={preWinGame}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={vi.fn()}
      />
    );

    rerender(
      <GameBoard disabled={true} game={winningGame} legalMoves={[]} onDrop={vi.fn()} />
    );

    const checker = screen
      .getByTestId("cell-5-3")
      .querySelector("[data-checker-anim]");
    const animation = (checker as HTMLElement | null)?.style.animation ?? "";

    expect(animation).toContain("drop 500ms");
    expect(animation).toContain("drop 500ms cubic-bezier(0.5, 0, 0.75, 0) both");
    expect(animation).toContain(
      "win-pop 720ms cubic-bezier(0.34, 1.56, 0.64, 1) 830ms forwards"
    );
  });

  it("drops a checker when a number-key column shortcut is pressed", () => {
    const onDrop = vi.fn();

    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={onDrop}
      />
    );

    fireEvent.keyDown(screen.getByRole("group", { name: "4 in a Row board" }), {
      key: "3"
    });

    expect(onDrop).toHaveBeenCalledWith(2);
  });
});
