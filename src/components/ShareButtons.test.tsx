import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18n from "../i18n/i18n";
import { ShareButtons } from "./ShareButtons";

describe("ShareButtons", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("announces when the share link is copied", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    render(<ShareButtons message="Come play" url="https://example.test" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Link copied");
    });
    expect(writeText).toHaveBeenCalledWith("Come play https://example.test");
  });
});
