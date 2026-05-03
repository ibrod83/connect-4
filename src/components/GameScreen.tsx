import type { MouseEvent } from "react";
import { RotateCcw, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GameController, GameSnapshot } from "../controller/GameController";
import type { AiLevel, PlayerId } from "../game-core";
import { GameBoard } from "./GameBoard";
import { ShareButtons } from "./ShareButtons";

type Translator = (key: string, options?: Record<string, string>) => string;
type PlayerIdentityKind = "you" | "ai" | "player1" | "player2";
type PlayerIdentity = {
  kind: PlayerIdentityKind;
  label: string;
};

type GameScreenProps = {
  snapshot: Extract<GameSnapshot, { phase: "playing" }>;
  controller: GameController;
  onBackToSetup: () => void;
};

export function GameScreen({ snapshot, controller, onBackToSetup }: GameScreenProps) {
  const { t } = useTranslation();
  const { game } = snapshot;
  const statusText = getStatusText(snapshot, t);
  const aiDifficulty = getAiDifficulty(snapshot);
  const isGameOver = game.status.type === "won" || game.status.type === "draw";
  const shareMessage = getShareMessage(snapshot, aiDifficulty, t);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";
  const backToSetupLabel = t("game.backToSetup");

  const handleBackToSetupClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onBackToSetup();
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-lg sm:border sm:border-zinc-200 sm:bg-white sm:p-4 sm:shadow-sm">
        <GameBoard
          disabled={snapshot.aiThinking || game.status.type !== "in_progress"}
          game={game}
          legalMoves={snapshot.legalMoves}
          showThinkingIndicator={snapshot.aiThinking}
          onBackToSetup={onBackToSetup}
          onDrop={(column) => controller.dropPiece(column)}
        />
      </section>

      <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-zinc-500">
            {t("game.starter", {
              player: getPlayerIdentity(snapshot, snapshot.resolvedStarter, t).label
            })}
          </p>
          {isGameOver ? (
            <h1
              aria-atomic="true"
              aria-live="polite"
              className="mt-1 text-2xl font-semibold text-zinc-950"
            >
              {statusText}
            </h1>
          ) : (
            <>
              <h1 className="sr-only">{t("app.title")}</h1>
              <p aria-atomic="true" aria-live="polite" className="sr-only">
                {statusText}
              </p>
            </>
          )}
          {aiDifficulty ? (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <span className="font-semibold text-zinc-500">{t("setup.difficulty")}</span>
              <span className="font-semibold text-zinc-950">
                {t(`difficulty.${aiDifficulty}`)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <PlayerBadge player="red" snapshot={snapshot} />
          <PlayerBadge player="yellow" snapshot={snapshot} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 outline-none hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            type="button"
            onClick={() => controller.restart()}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("game.restart")}
          </button>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            href="/"
            onClick={handleBackToSetupClick}
          >
            <Settings aria-hidden="true" className="size-4" />
            {backToSetupLabel}
          </a>
        </div>

        {isGameOver ? <ShareButtons message={shareMessage} url={shareUrl} /> : null}
      </aside>
    </div>
  );
}

function getShareMessage(
  snapshot: Extract<GameSnapshot, { phase: "playing" }>,
  aiDifficulty: AiLevel | null,
  t: Translator
): string {
  const { game } = snapshot;

  if (game.status.type === "won") {
    const winner = getPlayerIdentity(snapshot, game.status.winner, t);

    if (winner.kind === "you" && aiDifficulty) {
      return t("share.beatAi", { difficulty: t(`difficulty.${aiDifficulty}`) });
    }
  }

  return t("share.invite");
}

function getAiDifficulty(snapshot: Extract<GameSnapshot, { phase: "playing" }>): AiLevel | null {
  const aiPlayer = Object.values(snapshot.setup.players).find(
    (playerConfig) => playerConfig.kind === "ai"
  );

  return aiPlayer?.aiLevel ?? (aiPlayer ? "very_hard" : null);
}

function PlayerBadge({
  player,
  snapshot
}: {
  player: PlayerId;
  snapshot: Extract<GameSnapshot, { phase: "playing" }>;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <div
        className={`mb-2 h-4 w-4 rounded-full border ${
          player === "red" ? "border-red-600 bg-red-500" : "border-zinc-700 bg-yellow-300"
        }`}
      />
      <p className="truncate text-sm font-semibold text-zinc-950">
        {getPlayerIdentity(snapshot, player, t).label}
      </p>
    </div>
  );
}

function getStatusText(
  snapshot: Extract<GameSnapshot, { phase: "playing" }>,
  t: Translator
): string {
  const { game } = snapshot;

  if (game.status.type === "won") {
    const winner = getPlayerIdentity(snapshot, game.status.winner, t);

    if (winner.kind === "you") {
      return t("game.youWin");
    }

    return t("game.winner", {
      player: winner.label
    });
  }

  if (game.status.type === "draw") {
    return t("game.draw");
  }

  const player = getPlayerIdentity(snapshot, game.status.currentPlayer, t);

  if (snapshot.aiThinking) {
    return t("game.aiThinking", { player: player.label });
  }

  if (player.kind === "you") {
    return t("game.yourTurn");
  }

  return t("game.turn", { player: player.label });
}

function getPlayerIdentity(
  snapshot: Extract<GameSnapshot, { phase: "playing" }>,
  player: PlayerId,
  t: Translator
): PlayerIdentity {
  const config = snapshot.setup.players[player];
  const hasAiPlayer = Object.values(snapshot.setup.players).some(
    (playerConfig) => playerConfig.kind === "ai"
  );

  if (config.kind === "ai") {
    return { kind: "ai", label: t("players.ai") };
  }

  if (hasAiPlayer) {
    return { kind: "you", label: t("players.you") };
  }

  return player === "red"
    ? { kind: "player1", label: t("players.player1") }
    : { kind: "player2", label: t("players.player2") };
}
