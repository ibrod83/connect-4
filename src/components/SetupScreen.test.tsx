import { fireEvent, render, screen } from "@testing-library/react";
import i18n from "../i18n/i18n";
import { SetupScreen } from "./SetupScreen";

const veryHardAiStartsNote =
  "On Very Hard, when the AI starts, it is virtually unbeatable.";

describe("SetupScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders the vs-AI flow without a playground option", () => {
    render(<SetupScreen onStart={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Playground" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Play both sides/)).not.toBeInTheDocument();
    expect(screen.getByText("Your color")).toBeInTheDocument();
    expect(screen.getByText("Difficulty")).toBeInTheDocument();
    expect(screen.getByLabelText("Starts")).toHaveValue("yellow");
    expect(screen.getByText(veryHardAiStartsNote)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Red" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Yellow" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "Start game" })).toBeInTheDocument();
  });

  it("shows the very-hard warning only when the AI starts", () => {
    render(<SetupScreen onStart={vi.fn()} />);

    expect(screen.getByText(veryHardAiStartsNote)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Starts"), { target: { value: "red" } });

    expect(screen.queryByText(veryHardAiStartsNote)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Starts"), { target: { value: "yellow" } });
    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "medium" }
    });

    expect(screen.queryByText(veryHardAiStartsNote)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Difficulty"), {
      target: { value: "very_hard" }
    });

    expect(screen.getByText(veryHardAiStartsNote)).toBeInTheDocument();
  });
});
