import { Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GameController, GameSnapshot } from "../controller/GameController";
import type { PlayerId } from "../game-core";
import { GameBoard } from "./GameBoard";

type Translator = (key: string, options?: Record<string, string>) => string;
type PlayerIdentityKind = "you" | "ai" | "player1" | "player2";
type PlayerIdentity = {
  kind: PlayerIdentityKind;
  label: string;
};

type GameScreenProps = {
  snapshot: Extract<GameSnapshot, { phase: "playing" }>;
  controller: GameController;
};

export function GameScreen({ snapshot, controller }: GameScreenProps) {
  const { t } = useTranslation();
  const { game } = snapshot;
  const statusText = getStatusText(snapshot, t);

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-lg sm:border sm:border-zinc-200 sm:bg-white sm:p-4 sm:shadow-sm">
        <GameBoard
          disabled={snapshot.aiThinking || game.status.type !== "in_progress"}
          game={game}
          legalMoves={snapshot.legalMoves}
          showThinkingIndicator={snapshot.aiThinking}
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
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{statusText}</h1>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          <PlayerBadge player="red" snapshot={snapshot} />
          <PlayerBadge player="yellow" snapshot={snapshot} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 outline-none hover:bg-zinc-50 focus:ring-2 focus:ring-blue-100"
            type="button"
            onClick={() => controller.restart()}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("game.restart")}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-blue-800 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
            type="button"
            onClick={() => controller.resetToSetup()}
          >
            <Plus aria-hidden="true" className="size-4" />
            {t("game.newGame")}
          </button>
        </div>
      </aside>
    </div>
  );
}

function PlayerBadge({
  player,
  snapshot
}: {
  player: PlayerId;
  snapshot: Extract<GameSnapshot, { phase: "playing" }>;
}) {
  const { t } = useTranslation();
  const isCurrent =
    snapshot.game.status.type === "in_progress" &&
    snapshot.game.status.currentPlayer === player;

  return (
    <div
      className={`rounded-md border p-3 ${
        isCurrent ? "border-blue-700 bg-blue-50" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div
        className={`mb-2 h-4 w-4 rounded-full ${
          player === "red" ? "bg-red-500" : "bg-yellow-300"
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
