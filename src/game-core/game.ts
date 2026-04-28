import {
  COLUMNS,
  type Cell,
  type GameState,
  type PlayerId,
  type Position,
  ROWS,
  type WinResult
} from "./types";

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLUMNS).fill(null));
}

export function createInitialGame(starter: PlayerId): GameState {
  return {
    board: createEmptyBoard(),
    rows: ROWS,
    columns: COLUMNS,
    status: { type: "in_progress", currentPlayer: starter },
    moveHistory: []
  };
}

export function getLegalMoves(state: GameState): number[] {
  if (state.status.type !== "in_progress") {
    return [];
  }

  return state.board[0]
    .map((cell, column) => (cell === null ? column : null))
    .filter((column): column is number => column !== null);
}

export function applyMove(state: GameState, column: number): GameState {
  if (state.status.type !== "in_progress") {
    throw new Error("Cannot apply a move after the game has ended.");
  }

  if (!Number.isInteger(column) || column < 0 || column >= COLUMNS) {
    throw new Error(`Column ${column} is outside the board.`);
  }

  const row = findOpenRow(state.board, column);

  if (row === null) {
    throw new Error(`Column ${column} is full.`);
  }

  const player = state.status.currentPlayer;
  const board = cloneBoard(state.board);
  board[row][column] = player;

  const move = { player, row, column };
  const winningResult = checkWinner(board);
  const moveHistory = [...state.moveHistory, move];

  if (winningResult) {
    return {
      ...state,
      board,
      moveHistory,
      status: {
        type: "won",
        winner: winningResult.winner,
        winningCells: winningResult.winningCells
      }
    };
  }

  if (isBoardFull(board)) {
    return {
      ...state,
      board,
      moveHistory,
      status: { type: "draw" }
    };
  }

  return {
    ...state,
    board,
    moveHistory,
    status: {
      type: "in_progress",
      currentPlayer: getOpponent(player)
    }
  };
}

export function checkWinner(board: Cell[][]): WinResult | null {
  const directions: Position[] = [
    { row: 0, column: 1 },
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: -1 }
  ];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const player = board[row][column];

      if (!player) {
        continue;
      }

      for (const direction of directions) {
        const cells = collectCells(row, column, direction);

        if (
          cells.length === 4 &&
          cells.every((position) => board[position.row][position.column] === player)
        ) {
          return {
            winner: player,
            winningCells: cells
          };
        }
      }
    }
  }

  return null;
}

export function isDraw(state: GameState): boolean {
  return state.status.type === "draw";
}

export function getOpponent(player: PlayerId): PlayerId {
  return player === "red" ? "yellow" : "red";
}

export function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => [...row]);
}

export function findOpenRow(board: Cell[][], column: number): number | null {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] === null) {
      return row;
    }
  }

  return null;
}

function isBoardFull(board: Cell[][]): boolean {
  return board[0].every((cell) => cell !== null);
}

function collectCells(row: number, column: number, direction: Position): Position[] {
  const cells: Position[] = [];

  for (let index = 0; index < 4; index += 1) {
    const nextRow = row + direction.row * index;
    const nextColumn = column + direction.column * index;

    if (
      nextRow < 0 ||
      nextRow >= ROWS ||
      nextColumn < 0 ||
      nextColumn >= COLUMNS
    ) {
      return [];
    }

    cells.push({ row: nextRow, column: nextColumn });
  }

  return cells;
}
