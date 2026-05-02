import { useEffect, useRef } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { createGameController, type GameController } from "./controller/GameController";
import { useGameController } from "./hooks/useGameController";
import { useDocumentLanguage } from "./i18n";
import { AccessibilityPage } from "./components/AccessibilityPage";
import { GameScreen } from "./components/GameScreen";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SetupScreen } from "./components/SetupScreen";
import { useTranslation } from "react-i18next";

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
  const controllerRef = useRef<GameController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createGameController();
  }

  useDocumentLanguage();
  const controller = controllerRef.current;
  const snapshot = useGameController(controller);
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
  const showAccessibilityStatement = currentLanguage.startsWith("he");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [snapshot.phase]);

  return (
    <main className="min-h-screen bg-zinc-100 px-2 py-3 text-zinc-950 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto mb-3 flex w-full max-w-6xl items-center justify-between gap-4 sm:mb-5">

        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="grid size-10 grid-cols-2 gap-1 rounded-lg bg-blue-700 p-1"
          >
            <span className="rounded-full bg-red-500" />
            <span className="rounded-full bg-yellow-300" />
            <span className="rounded-full bg-yellow-300" />
            <span className="rounded-full bg-red-500" />
          </div>
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

      {snapshot.phase === "setup" ? (
        <SetupScreen onStart={(setup) => controller.startGame(setup)} />
      ) : (
        <GameScreen controller={controller} snapshot={snapshot} />
      )}
    </main>
  );
}
