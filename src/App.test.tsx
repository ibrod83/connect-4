import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  type NavigateFunction
} from "react-router-dom";
import App from "./App";
import i18n from "./i18n/i18n";

type RouterProbeProps = {
  onNavigateReady: (navigate: NavigateFunction) => void;
  onPathChange: (path: string) => void;
};

function RouterProbe({ onNavigateReady, onPathChange }: RouterProbeProps) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    onNavigateReady(navigate);
  }, [navigate, onNavigateReady]);

  useEffect(() => {
    onPathChange(location.pathname);
  }, [location.pathname, onPathChange]);

  return null;
}

function renderApp(initialEntries: string[] = ["/"], initialIndex?: number) {
  let currentPath = "";
  let navigate: NavigateFunction | null = null;

  render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <App />
      <RouterProbe
        onNavigateReady={(nextNavigate) => {
          navigate = nextNavigate;
        }}
        onPathChange={(path) => {
          currentPath = path;
        }}
      />
    </MemoryRouter>
  );

  return {
    getPath: () => currentPath,
    go(delta: number) {
      const navigateInRouter = navigate;

      if (!navigateInRouter) {
        throw new Error("Router navigate function was not initialized.");
      }

      act(() => {
        void navigateInRouter(delta);
      });
    }
  };
}

function startHumanFirstGame() {
  fireEvent.change(screen.getByLabelText("Starts"), { target: { value: "red" } });
  fireEvent.click(screen.getByRole("button", { name: "Start game" }));
}

describe("App routing", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("returns from an active game to setup with browser back", async () => {
    const router = renderApp();

    startHumanFirstGame();

    await waitFor(() => {
      expect(router.getPath()).toBe("/play");
      expect(screen.getByTestId("game-board")).toBeInTheDocument();
    });

    router.go(-1);

    await waitFor(() => {
      expect(router.getPath()).toBe("/");
      expect(screen.getByRole("heading", { name: "New game" })).toBeInTheDocument();
    });
    expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
  });

  it("does not restore the game when browser forward reaches the old play entry", async () => {
    const router = renderApp();

    startHumanFirstGame();

    await waitFor(() => {
      expect(router.getPath()).toBe("/play");
      expect(screen.getByTestId("game-board")).toBeInTheDocument();
    });

    router.go(-1);

    await waitFor(() => {
      expect(router.getPath()).toBe("/");
      expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
    });

    router.go(1);

    await waitFor(() => {
      expect(router.getPath()).toBe("/");
      expect(screen.getByRole("heading", { name: "New game" })).toBeInTheDocument();
    });
    expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
  });

  it("does not leave a duplicate setup entry when the in-game back control is used", async () => {
    const router = renderApp(["/previous", "/"], 1);

    startHumanFirstGame();

    await waitFor(() => {
      expect(router.getPath()).toBe("/play");
      expect(screen.getByTestId("game-board")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("link", { name: "Back to setup" })[1]);

    await waitFor(() => {
      expect(router.getPath()).toBe("/");
      expect(screen.getByRole("heading", { name: "New game" })).toBeInTheDocument();
    });

    router.go(-1);

    await waitFor(() => {
      expect(router.getPath()).toBe("/previous");
    });
  });

  it("redirects direct play route visits back to setup", async () => {
    const router = renderApp(["/play"]);

    await waitFor(() => {
      expect(router.getPath()).toBe("/");
      expect(screen.getByRole("heading", { name: "New game" })).toBeInTheDocument();
    });
  });
});
