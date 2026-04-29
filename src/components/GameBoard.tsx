import {
  type KeyboardEvent,
  type MouseEvent
} from "react";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GameState, Position } from "../game-core";

type GameBoardProps = {
  game: GameState;
  legalMoves: number[];
  disabled: boolean;
  showThinkingIndicator?: boolean;
  onDrop: (column: number) => void;
};

const CELL_BASE_CLASS = "block size-full rounded-full border";
const EMPTY_CELL_CLASS =
  "border-zinc-200 bg-zinc-100 shadow-[inset_0_3px_8px_rgba(0,0,0,0.18),0_1px_1px_rgba(255,255,255,0.8)]";
const CHECKER_CLASS =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),0_2px_5px_rgba(15,23,42,0.35)]";

export function GameBoard({
  game,
  legalMoves,
  disabled,
  showThinkingIndicator = false,
  onDrop
}: GameBoardProps) {
  const { t } = useTranslation();
  const winningCells =
    game.status.type === "won" ? game.status.winningCells : ([] as Position[]);

  const tryDrop = (column: number) => {
    if (!disabled && legalMoves.includes(column)) {
      onDrop(column);
    }
  };

  const handleBoardClick = (event: MouseEvent<HTMLDivElement>) => {
    const column = getColumnFromEvent(event, game.columns);

    if (column !== null) {
      tryDrop(column);
    }
  };

  const handleBoardMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const column = Number(event.key) - 1;

    if (Number.isInteger(column) && column >= 0 && column < game.columns) {
      event.preventDefault();
      tryDrop(column);
    }
  };

  return (
    <div className="w-full" dir="ltr" data-testid="game-board">
      <div className="relative rounded-lg bg-blue-700 p-2 shadow-sm sm:p-4">
        <div
          aria-label={t("game.board")}
          className={`grid gap-1.5 rounded-md outline-none sm:gap-4 ${
            disabled ? "cursor-default" : "cursor-pointer"
          }`}
          data-testid="board-grid"
          role="grid"
          style={{ gridTemplateColumns: `repeat(${game.columns}, minmax(0, 1fr))` }}
          tabIndex={disabled ? -1 : 0}
          onClick={handleBoardClick}
          onKeyDown={handleBoardKeyDown}
          onMouseDown={handleBoardMouseDown}
        >
          {game.board.flatMap((row, rowIndex) =>
            row.map((cell, columnIndex) => {
              const winning = winningCells.some(
                (position) => position.row === rowIndex && position.column === columnIndex
              );

              return (
                <span
                  key={`${rowIndex}-${columnIndex}`}
                  aria-hidden="true"
                  className="aspect-square"
                  data-column={columnIndex}
                  data-testid={`cell-${rowIndex}-${columnIndex}`}
                >
                  <span
                    className={`${CELL_BASE_CLASS} ${
                      cell === "red"
                        ? `border-red-600 bg-red-500 ${CHECKER_CLASS}`
                        : cell === "yellow"
                          ? `border-yellow-300 bg-yellow-300 ${CHECKER_CLASS}`
                          : EMPTY_CELL_CLASS
                    } ${winning ? "ring-2 ring-white sm:ring-4" : ""}`}
                  />
                </span>
              );
            })
          )}
        </div>
        {showThinkingIndicator ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <LoaderCircle
              className="size-14 animate-spin text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.65)] motion-reduce:animate-none"
              data-testid="ai-thinking-spinner"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getColumnFromEvent(
  event: MouseEvent<HTMLDivElement>,
  columns: number
): number | null {
  const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-column]");
  const cellColumn = cell?.dataset.column;

  if (cellColumn !== undefined) {
    return Number(cellColumn);
  }

  const rect = event.currentTarget.getBoundingClientRect();

  if (rect.width <= 0) {
    return null;
  }

  const offset = event.clientX - rect.left;
  const column = Math.floor((offset / rect.width) * columns);

  return Math.min(columns - 1, Math.max(0, column));
}
