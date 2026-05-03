import { useEffect, useRef } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { createGameController, type GameController } from "./controller/GameController";
import type { GameSetup } from "./game-core";
import { useGameController } from "./hooks/useGameController";
import { useDocumentLanguage } from "./i18n";
import { AccessibilityPage } from "./components/AccessibilityPage";
import { GameScreen } from "./components/GameScreen";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SetupScreen } from "./components/SetupScreen";
import { useTranslation } from "react-i18next";

const GAME_PATH = "/";
const PLAY_PATH = "/play";

export default function App() {
  return (
    <Routes>
      <Route path="/accessibility" element={<AccessibilityPage />} />
      <Route path="/accessibility/" element={<AccessibilityPage />} />
      <Route path="*" element={<GameApp />} />
    </Routes>
  );
}

function GameApp() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const controllerRef = useRef<GameController | null>(null);
  const pendingPlayNavigationRef = useRef(false);

  if (!controllerRef.current) {
    controllerRef.current = createGameController();
  }

  useDocumentLanguage();
  const controller = controllerRef.current;
  const snapshot = useGameController(controller);
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
  const showAccessibilityStatement = currentLanguage.startsWith("he");
  const isPlayPath = location.pathname === PLAY_PATH || location.pathname === `${PLAY_PATH}/`;
  const shouldShowGame = snapshot.phase === "playing" && isPlayPath;

  const startGame = (setup: GameSetup) => {
    pendingPlayNavigationRef.current = true;
    controller.startGame(setup);
    void navigate(PLAY_PATH);
  };

  const backToSetup = () => {
    void navigate(-1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [snapshot.phase]);

  useEffect(() => {
    if (snapshot.phase === "playing" && isPlayPath) {
      pendingPlayNavigationRef.current = false;
      return;
    }

    if (snapshot.phase === "playing" && !isPlayPath) {
      if (pendingPlayNavigationRef.current) {
        return;
      }

      controller.resetToSetup();
      return;
    }

    if (snapshot.phase === "setup" && isPlayPath) {
      void navigate(GAME_PATH, { replace: true });
    }
  }, [controller, isPlayPath, navigate, snapshot.phase]);

  return (
    <main className="min-h-screen bg-zinc-100 px-2 py-3 text-zinc-950 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto mb-3 flex w-full max-w-6xl items-center justify-between gap-4 sm:mb-5">

        <div className="flex items-center gap-3">
          <img
            alt=""
            aria-hidden="true"
            className="size-10"
            height="40"
            src="/app-logo.svg"
            width="40"
          />
          <p className="text-lg font-semibold text-zinc-950">{t("app.title")}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {showAccessibilityStatement ? (
            <Link
              className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              to="/accessibility"
            >
              {t("accessibility.statement")}
            </Link>
          ) : null}
          <LanguageSwitcher />
        </div>
      </div>

      {shouldShowGame ? (
        <GameScreen controller={controller} snapshot={snapshot} onBackToSetup={backToSetup} />
      ) : (
        <SetupScreen onStart={startGame} />
      )}
    </main>
  );
}
