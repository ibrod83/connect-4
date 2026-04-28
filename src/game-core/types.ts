export const ROWS = 6;
export const COLUMNS = 7;

export type PlayerId = "red" | "yellow";
export type PlayerKind = "human" | "ai";
export type AiLevel = "easy" | "medium" | "hard" | "very_hard";
export type StartMode = PlayerId | "random";
export type SupportedLanguage = "en" | "he";

export type Cell = PlayerId | null;

export type Position = {
  row: number;
  column: number;
};

export type Move = Position & {
  player: PlayerId;
};

export type GameStatus =
  | { type: "in_progress"; currentPlayer: PlayerId }
  | { type: "won"; winner: PlayerId; winningCells: Position[] }
  | { type: "draw" };

export type GameState = {
  board: Cell[][];
  rows: typeof ROWS;
  columns: typeof COLUMNS;
  status: GameStatus;
  moveHistory: Move[];
};

export type PlayerConfig = {
  id: PlayerId;
  kind: PlayerKind;
  name: string;
  aiLevel?: AiLevel;
};

export type GameSetup = {
  players: Record<PlayerId, PlayerConfig>;
  startMode: StartMode;
};

export type WinResult = {
  winner: PlayerId;
  winningCells: Position[];
};
