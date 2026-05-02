import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GameState, Position } from "../game-core";

const DROP_ANIMATION_STORAGE_KEY = "connect4:dropAnimationsEnabled";

function readDropAnimationsEnabled(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(DROP_ANIMATION_STORAGE_KEY) !== "false";
}

type GameBoardProps = {
  game: GameState;
  legalMoves: number[];
  disabled: boolean;
  showThinkingIndicator?: boolean;
  onDrop: (column: number) => void;
};

const HOLE_BASE_CLASS =
  "absolute inset-0 rounded-full border-2 border-black/70 sm:border-4";
const EMPTY_CELL_CLASS =
  "bg-gradient-to-b from-zinc-300 to-zinc-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-1px_1px_rgba(255,255,255,0.7)] sm:shadow-[inset_0_4px_6px_rgba(0,0,0,0.5),inset_0_-1px_2px_rgba(255,255,255,0.7)]";
const CHECKER_OVERLAY_CLASS =
  "absolute inset-0 rounded-full border-2 border-transparent bg-clip-padding sm:border-4";
const RED_CHECKER_CLASS =
  "bg-gradient-to-b from-red-600 to-red-500 shadow-[inset_0_5px_9px_rgba(0,0,0,0.4),inset_0_-2px_3px_rgba(255,255,255,0.2)]";
const YELLOW_CHECKER_CLASS =
  "bg-gradient-to-b from-yellow-400 to-yellow-300 shadow-[inset_0_5px_9px_rgba(0,0,0,0.3),inset_0_-2px_3px_rgba(255,255,255,0.3)]";

export function GameBoard({
  game,
  legalMoves,
  disabled,
  showThinkingIndicator = false,
  onDrop
}: GameBoardProps) {
  const { t } = useTranslation();
  const [dropAnimationsEnabled, setDropAnimationsEnabled] = useState<boolean>(
    readDropAnimationsEnabled
  );

  useEffect(() => {
    window.localStorage.setItem(
      DROP_ANIMATION_STORAGE_KEY,
      String(dropAnimationsEnabled)
    );
  }, [dropAnimationsEnabled]);

  const moveCount = game.moveHistory.length;
  const animatedMoveCountRef = useRef(moveCount);
  const animationLockUntilRef = useRef(0);
  const isFreshMove = moveCount > animatedMoveCountRef.current;

  useEffect(() => {
    animatedMoveCountRef.current = moveCount;
  }, [moveCount]);

  const winningCells =
    game.status.type === "won" ? game.status.winningCells : ([] as Position[]);
  const isDraw = game.status.type === "draw";
  const lastMove = game.moveHistory.at(-1);

  useEffect(() => {
    if (!isFreshMove || !dropAnimationsEnabled || !lastMove) {
      return;
    }

    animationLockUntilRef.current = Date.now() + 200 + lastMove.row * 60;
  }, [isFreshMove, dropAnimationsEnabled, lastMove]);

  const tryDrop = (column: number) => {
    if (Date.now() < animationLockUntilRef.current) {
      return;
    }

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
      <div className="mb-2 flex items-center justify-end gap-2">
        <span id="drop-animation-label" className="text-sm text-zinc-700">
          {t("game.dropAnimation")}
        </span>
        <button
          aria-checked={dropAnimationsEnabled}
          aria-labelledby="drop-animation-label"
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full outline-none transition-colors focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
            dropAnimationsEnabled ? "bg-blue-700" : "bg-zinc-300"
          }`}
          data-testid="drop-animation-toggle"
          role="switch"
          type="button"
          onClick={() => setDropAnimationsEnabled((prev) => !prev)}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              dropAnimationsEnabled ? "translate-x-[18px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      <div
        className={`relative rounded-lg bg-blue-700 p-1.5 shadow-sm sm:p-4 ${
          isDraw ? "motion-safe:animate-draw-shake" : ""
        }`}
      >
        <div
          aria-label={t("game.board")}
          className={`grid gap-1 rounded-md outline-none sm:gap-4 ${
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
              const winningIndex = winningCells.findIndex(
                (position) => position.row === rowIndex && position.column === columnIndex
              );
              const winning = winningIndex >= 0;
              const isLastMove =
                lastMove?.row === rowIndex && lastMove?.column === columnIndex;
              const dropDuration = 200 + rowIndex * 60;
              const shouldDrop = isLastMove && dropAnimationsEnabled && isFreshMove;
              const animations: string[] = [];

              if (shouldDrop) {
                animations.push(
                  `drop ${dropDuration}ms cubic-bezier(0.5, 0, 0.75, 0) both`
                );
              }

              if (winning) {
                const winDelay = winningIndex * 110 + (shouldDrop ? dropDuration : 0);
                animations.push(
                  `win-pop 720ms cubic-bezier(0.34, 1.56, 0.64, 1) ${winDelay}ms both`
                );
              }

              const checkerStyle: CSSProperties & { ["--drop-from"]?: string } = {};

              if (shouldDrop) {
                checkerStyle["--drop-from"] = `${-(rowIndex + 1) * 100}%`;
              }

              if (animations.length > 0) {
                checkerStyle.animation = animations.join(", ");
              }

              return (
                <span
                  key={`${rowIndex}-${columnIndex}`}
                  aria-hidden="true"
                  className="relative aspect-square"
                  data-column={columnIndex}
                  data-testid={`cell-${rowIndex}-${columnIndex}`}
                >
                  <span className={`${HOLE_BASE_CLASS} ${EMPTY_CELL_CLASS}`} />
                  {cell !== null ? (
                    <span
                      className={`${CHECKER_OVERLAY_CLASS} ${
                        cell === "red" ? RED_CHECKER_CLASS : YELLOW_CHECKER_CLASS
                      }`}
                      data-checker-anim={animations.length > 0 ? "" : undefined}
                      style={animations.length > 0 ? checkerStyle : undefined}
                    />
                  ) : null}
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
