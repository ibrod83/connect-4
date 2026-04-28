import { chooseAiMove } from "../ai/minimax";
import {
  applyMove,
  createInitialGame,
  getLegalMoves
} from "../game-core/game";
import { resolveStarter, type RandomSource } from "../game-core/starter";
import type {
  AiLevel,
  GameSetup,
  GameState,
  PlayerId
} from "../game-core/types";

export const DEFAULT_AI_THINKING_DELAY_MS = 1000;

export type GameSnapshot =
  | {
      phase: "setup";
      setup: GameSetup;
      game: null;
      resolvedStarter: null;
      aiThinking: false;
      lastError: string | null;
    }
  | {
      phase: "playing";
      setup: GameSetup;
      game: GameState;
      resolvedStarter: PlayerId;
      legalMoves: number[];
      aiThinking: boolean;
      lastError: string | null;
    };

export type GameController = {
  getSnapshot(): GameSnapshot;
  subscribe(listener: () => void): () => void;
  startGame(setup: GameSetup): void;
  dropPiece(column: number): void;
  restart(): void;
  resetToSetup(): void;
};

type Scheduler = (callback: () => void, delay: number) => unknown;

type ControllerOptions = {
  random?: RandomSource;
  aiDelayMs?: number;
  scheduler?: Scheduler;
  chooseMove?: typeof chooseAiMove;
};

export function createDefaultSetup(): GameSetup {
  return {
    startMode: "red",
    players: {
      red: {
        id: "red",
        kind: "human",
        name: "Red"
      },
      yellow: {
        id: "yellow",
        kind: "ai",
        name: "AI",
        aiLevel: "hard"
      }
    }
  };
}

export function createGameController(options: ControllerOptions = {}): GameController {
  return new ConnectFourController(options);
}

class ConnectFourController implements GameController {
  private snapshot: GameSnapshot;
  private readonly listeners = new Set<() => void>();
  private readonly random: RandomSource;
  private readonly scheduler: Scheduler;
  private readonly chooseMove: typeof chooseAiMove;
  private readonly aiDelayMs: number;
  private turnToken = 0;

  constructor(options: ControllerOptions) {
    this.random = options.random ?? Math.random;
    this.scheduler = options.scheduler ?? ((callback, delay) => window.setTimeout(callback, delay));
    this.chooseMove = options.chooseMove ?? chooseAiMove;
    this.aiDelayMs = options.aiDelayMs ?? DEFAULT_AI_THINKING_DELAY_MS;
    this.snapshot = {
      phase: "setup",
      setup: createDefaultSetup(),
      game: null,
      resolvedStarter: null,
      aiThinking: false,
      lastError: null
    };
  }

  getSnapshot(): GameSnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  startGame(setup: GameSetup): void {
    const nextSetup = cloneSetup(setup);
    const resolvedStarter = resolveStarter(nextSetup.startMode, this.random);
    const game = createInitialGame(resolvedStarter);

    this.turnToken += 1;
    this.snapshot = {
      phase: "playing",
      setup: nextSetup,
      game,
      resolvedStarter,
      legalMoves: getLegalMoves(game),
      aiThinking: false,
      lastError: null
    };
    this.emit();
    this.scheduleAiTurnIfNeeded();
  }

  dropPiece(column: number): void {
    if (this.snapshot.phase !== "playing") {
      return;
    }

    if (this.snapshot.aiThinking || this.snapshot.game.status.type !== "in_progress") {
      return;
    }

    const currentPlayer = this.snapshot.game.status.currentPlayer;

    if (this.snapshot.setup.players[currentPlayer].kind !== "human") {
      return;
    }

    this.applyColumn(column);
    this.scheduleAiTurnIfNeeded();
  }

  restart(): void {
    this.startGame(this.snapshot.setup);
  }

  resetToSetup(): void {
    this.turnToken += 1;
    this.snapshot = {
      phase: "setup",
      setup: this.snapshot.setup,
      game: null,
      resolvedStarter: null,
      aiThinking: false,
      lastError: null
    };
    this.emit();
  }

  private applyColumn(column: number): void {
    if (this.snapshot.phase !== "playing") {
      return;
    }

    try {
      const game = applyMove(this.snapshot.game, column);
      this.snapshot = {
        ...this.snapshot,
        game,
        legalMoves: getLegalMoves(game),
        aiThinking: false,
        lastError: null
      };
      this.emit();
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        lastError: error instanceof Error ? error.message : "Move failed."
      };
      this.emit();
    }
  }

  private scheduleAiTurnIfNeeded(): void {
    if (this.snapshot.phase !== "playing") {
      return;
    }

    if (this.snapshot.aiThinking || this.snapshot.game.status.type !== "in_progress") {
      return;
    }

    const currentPlayer = this.snapshot.game.status.currentPlayer;
    const config = this.snapshot.setup.players[currentPlayer];

    if (config.kind !== "ai" || getLegalMoves(this.snapshot.game).length === 0) {
      return;
    }

    const token = this.turnToken;
    this.snapshot = {
      ...this.snapshot,
      aiThinking: true,
      lastError: null
    };
    this.emit();

    this.scheduler(() => {
      if (
        this.snapshot.phase !== "playing" ||
        token !== this.turnToken ||
        this.snapshot.game.status.type !== "in_progress"
      ) {
        return;
      }

      const aiPlayer = this.snapshot.game.status.currentPlayer;
      const aiLevel = this.snapshot.setup.players[aiPlayer].aiLevel ?? "hard";
      const column = this.chooseMove(this.snapshot.game, aiLevel as AiLevel, this.random);

      this.applyColumnForAi(column);
      this.scheduleAiTurnIfNeeded();
    }, this.aiDelayMs);
  }

  private applyColumnForAi(column: number): void {
    if (this.snapshot.phase !== "playing") {
      return;
    }

    try {
      const game = applyMove(this.snapshot.game, column);
      this.snapshot = {
        ...this.snapshot,
        game,
        legalMoves: getLegalMoves(game),
        aiThinking: false,
        lastError: null
      };
      this.emit();
    } catch (error) {
      this.snapshot = {
        ...this.snapshot,
        aiThinking: false,
        lastError: error instanceof Error ? error.message : "AI move failed."
      };
      this.emit();
    }
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

function cloneSetup(setup: GameSetup): GameSetup {
  return {
    startMode: setup.startMode,
    players: {
      red: { ...setup.players.red },
      yellow: { ...setup.players.yellow }
    }
  };
}
