import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { GameBoard } from "../components/GameBoard";
import { createInitialGame } from "../game-core";
import i18n, { applyDocumentLanguage } from "./i18n";

describe("i18n and RTL behavior", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    applyDocumentLanguage("en");
  });

  it("sets English as LTR on the document", () => {
    applyDocumentLanguage("en");

    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
  });

  it("sets Hebrew as RTL on the document", () => {
    applyDocumentLanguage("he");

    expect(document.documentElement).toHaveAttribute("lang", "he");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });

  it("changes visible labels without resetting the game", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    expect(screen.getByTestId("game-board")).toBeInTheDocument();
    expect(screen.getByText(/Started: AI/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "he" } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "התחל מחדש" })).toBeInTheDocument();
    });
    expect(screen.getByTestId("game-board")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(screen.getByText(/התחיל: מחשב/)).toBeInTheDocument();
    expect(screen.queryByText(/Started: AI/)).not.toBeInTheDocument();
  });

  it("keeps board direction and column mapping stable in RTL", async () => {
    await i18n.changeLanguage("he");
    applyDocumentLanguage("he");
    const onDrop = vi.fn();

    render(
      <GameBoard
        disabled={false}
        game={createInitialGame("red")}
        legalMoves={[0, 1, 2, 3, 4, 5, 6]}
        onDrop={onDrop}
      />
    );

    expect(screen.getByTestId("game-board")).toHaveAttribute("dir", "ltr");
    fireEvent.click(screen.getByTestId("column-button-0"));

    expect(onDrop).toHaveBeenCalledWith(0);
  });
});
