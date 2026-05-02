import { fireEvent, render, screen } from "@testing-library/react";
import { GameBoard } from "./GameBoard";
import { createInitialGame } from "../game-core";
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
