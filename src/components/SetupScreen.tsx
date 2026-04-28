import { Bot, Play, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AiLevel, GameSetup, PlayerKind, StartMode } from "../game-core";

type SetupScreenProps = {
  onStart: (setup: GameSetup) => void;
};

type GameMode = "ai" | "local";

const levels: AiLevel[] = ["easy", "medium", "hard"];
const startModes: StartMode[] = ["red", "yellow", "random"];

export function SetupScreen({ onStart }: SetupScreenProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<GameMode>("ai");
  const [redName, setRedName] = useState("");
  const [yellowName, setYellowName] = useState("");
  const [aiLevel, setAiLevel] = useState<AiLevel>("hard");
  const [startMode, setStartMode] = useState<StartMode>("red");

  const yellowKind: PlayerKind = mode === "ai" ? "ai" : "human";
  const yellowFallback = mode === "ai" ? t("players.ai") : t("players.yellow");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onStart({
      startMode,
      players: {
        red: {
          id: "red",
          kind: "human",
          name: redName.trim() || t("players.red")
        },
        yellow: {
          id: "yellow",
          kind: yellowKind,
          name: yellowName.trim() || yellowFallback,
          aiLevel: yellowKind === "ai" ? aiLevel : undefined
        }
      }
    });
  };

  return (
    <form
      className="mx-auto w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={handleSubmit}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-950">{t("setup.title")}</h1>
      </div>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-semibold text-zinc-700">
          {t("setup.gameMode")}
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SegmentButton
            active={mode === "ai"}
            icon={<Bot aria-hidden="true" className="size-4" />}
            label={t("setup.vsAi")}
            onClick={() => setMode("ai")}
          />
          <SegmentButton
            active={mode === "local"}
            icon={<UsersRound aria-hidden="true" className="size-4" />}
            label={t("setup.localPlayers")}
            onClick={() => setMode("local")}
          />
        </div>
      </fieldset>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-zinc-700">
            {t("setup.redName")}
          </span>
          <input
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder={t("players.red")}
            value={redName}
            onChange={(event) => setRedName(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-zinc-700">
            {mode === "ai" ? t("setup.aiName") : t("setup.yellowName")}
          </span>
          <input
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder={yellowFallback}
            value={yellowName}
            onChange={(event) => setYellowName(event.target.value)}
          />
        </label>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mode === "ai" ? (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-zinc-700">
              {t("setup.difficulty")}
            </span>
            <select
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={aiLevel}
              onChange={(event) => setAiLevel(event.target.value as AiLevel)}
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {t(`difficulty.${level}`)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="hidden sm:block" />
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-zinc-700">
            {t("setup.starter")}
          </span>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={startMode}
            onChange={(event) => setStartMode(event.target.value as StartMode)}
          >
            {startModes.map((modeOption) => (
              <option key={modeOption} value={modeOption}>
                {t(`setup.${modeOption}Starts`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm outline-none hover:bg-blue-800 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
        type="submit"
      >
        <Play aria-hidden="true" className="size-4" />
        {t("setup.start")}
      </button>
    </form>
  );
}

type SegmentButtonProps = {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function SegmentButton({ active, icon, label, onClick }: SegmentButtonProps) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 ${
        active
          ? "border-blue-700 bg-blue-50 text-blue-900"
          : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
      type="button"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
