import { fireEvent, render, screen } from "@testing-library/react";
import i18n from "../i18n/i18n";
import { SetupScreen } from "./SetupScreen";

describe("SetupScreen", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("shows playground guidance only when playground mode is active", () => {
    render(<SetupScreen onStart={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Playground" })).toBeInTheDocument();
    expect(screen.queryByText(/Play both sides/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Playground" }));

    expect(screen.getByText(/Play both sides/)).toBeInTheDocument();
  });
});
