import { render, screen } from "@testing-library/react";
import i18n from "../i18n/i18n";
import { SetupScreen } from "./SetupScreen";

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
    expect(
      screen.getByText(
        "On Very Hard, when the AI starts, it is virtually unbeatable."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start game" })).toBeInTheDocument();
  });
});
