import { Play } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AiLevel, GameSetup, PlayerId, StartMode } from "../game-core";
import { ShareButtons } from "./ShareButtons";

type SetupScreenProps = {
  onStart: (setup: GameSetup) => void;
};

const levels: AiLevel[] = ["easy", "medium", "hard", "very_hard"];

export function SetupScreen({ onStart }: SetupScreenProps) {
  const { t } = useTranslation();
  const [humanColor, setHumanColor] = useState<PlayerId>("red");
  const [aiLevel, setAiLevel] = useState<AiLevel>("very_hard");
  const [startMode, setStartMode] = useState<StartMode>("yellow");

  const aiColor: PlayerId = humanColor === "red" ? "yellow" : "red";

  const changeHumanColor = (next: PlayerId) => {
    if (next === humanColor) return;
    setHumanColor(next);
    setStartMode((prev) => (prev === "random" ? prev : prev === "red" ? "yellow" : "red"));
  };

  const startOptions: { value: StartMode; labelKey: string }[] = [
    { value: humanColor, labelKey: "players.you" },
    { value: aiColor, labelKey: "players.ai" },
    { value: "random", labelKey: "setup.randomStarts" }
  ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onStart({
      startMode,
      players: {
        red: {
          id: "red",
          kind: humanColor === "red" ? "human" : "ai",
          aiLevel: humanColor === "red" ? undefined : aiLevel
        },
        yellow: {
          id: "yellow",
          kind: humanColor === "yellow" ? "human" : "ai",
          aiLevel: humanColor === "yellow" ? undefined : aiLevel
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
          {t("setup.yourColor")}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <SegmentButton
            active={humanColor === "red"}
            icon={
              <span
                aria-hidden="true"
                className="size-4 rounded-full border border-red-600 bg-red-500"
              />
            }
            label={t("players.red")}
            onClick={() => changeHumanColor("red")}
          />
          <SegmentButton
            active={humanColor === "yellow"}
            icon={
              <span
                aria-hidden="true"
                className="size-4 rounded-full border border-yellow-400 bg-yellow-300"
              />
            }
            label={t("players.yellow")}
            onClick={() => changeHumanColor("yellow")}
          />
        </div>
      </fieldset>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-zinc-700">
            {t("setup.starter")}
          </span>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            value={startMode}
            onChange={(event) => setStartMode(event.target.value as StartMode)}
          >
            {startOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-5 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900">
        {t("setup.veryHardAiStartsNote")}
      </p>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm outline-none hover:bg-blue-800 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
        type="submit"
      >
        <Play aria-hidden="true" className="size-4" />
        {t("setup.start")}
      </button>

      <ShareButtons
        heading={t("share.inviteHeading")}
        message={t("share.invite")}
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}${window.location.pathname}`
            : ""
        }
      />
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
