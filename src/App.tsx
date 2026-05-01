import { useEffect, useRef } from "react";
import { createGameController, type GameController } from "./controller/GameController";
import { useGameController } from "./hooks/useGameController";
import { useDocumentLanguage } from "./i18n";
import { GameScreen } from "./components/GameScreen";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { SetupScreen } from "./components/SetupScreen";
import { useTranslation } from "react-i18next";
//test
export default function App() {
  const { t } = useTranslation();
  const controllerRef = useRef<GameController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = createGameController();
  }

  useDocumentLanguage();
  const controller = controllerRef.current;
  const snapshot = useGameController(controller);
  const prevPhaseRef = useRef(snapshot.phase);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [snapshot.phase]);

  useEffect(() => {
    const previous = prevPhaseRef.current;
    prevPhaseRef.current = snapshot.phase;

    if (previous === "setup" && snapshot.phase === "playing") {
      window.history.pushState({ phase: "playing" }, "");
    } else if (previous === "playing" && snapshot.phase === "setup") {
      if (window.history.state?.phase === "playing") {
        window.history.back();
      }
    }
  }, [snapshot.phase]);

  useEffect(() => {
    const onPopState = () => {
      if (controller.getSnapshot().phase === "playing") {
        controller.resetToSetup();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [controller]);

  return (
    <main className="min-h-screen bg-zinc-100 px-3 py-4 text-zinc-950 sm:px-6 sm:py-5 lg:px-8">
      <div className="mx-auto mb-3 flex w-full max-w-6xl items-center justify-between gap-4 sm:mb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 grid-cols-2 gap-1 rounded-lg bg-blue-700 p-1">
            <span className="rounded-full bg-red-500" />
            <span className="rounded-full bg-yellow-300" />
            <span className="rounded-full bg-yellow-300" />
            <span className="rounded-full bg-red-500" />
          </div>
          <p className="text-lg font-semibold text-zinc-950">{t("app.title")}</p>
        </div>
        <LanguageSwitcher />
      </div>

      {snapshot.phase === "setup" ? (
        <SetupScreen onStart={(setup) => controller.startGame(setup)} />
      ) : (
        <GameScreen controller={controller} snapshot={snapshot} />
      )}
    </main>
  );
}
