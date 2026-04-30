import type { GameSetup } from "../game-core";
import {
  DEFAULT_AI_THINKING_DELAY_MS,
  type AiMoveChooser,
  createDefaultSetup,
  createGameController
} from "./GameController";

function localSetup(startMode: GameSetup["startMode"] = "red"): GameSetup {
  return {
    startMode,
    players: {
      red: { id: "red", kind: "human" },
      yellow: { id: "yellow", kind: "human" }
    }
  };
}

function aiSetup(startMode: GameSetup["startMode"] = "red"): GameSetup {
  return {
    startMode,
    players: {
      red: { id: "red", kind: "human" },
      yellow: { id: "yellow", kind: "ai", aiLevel: "medium" }
    }
  };
}

function createDeferred<T>(): {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

async function flushAsyncAi(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("GameController", () => {
  it("defaults AI difficulty to very hard", () => {
    expect(createDefaultSetup().players.yellow.aiLevel).toBe("very_hard");
  });

  it("publishes state changes through subscriptions", () => {
    const controller = createGameController();
    const listener = vi.fn();

    controller.subscribe(listener);
    controller.startGame(localSetup("red"));

    expect(listener).toHaveBeenCalled();
  });

  it("uses the selected starter", () => {
    const controller = createGameController();

    controller.startGame(localSetup("yellow"));
    const snapshot = controller.getSnapshot();

    expect(snapshot.phase).toBe("playing");
    expect(snapshot.phase === "playing" ? snapshot.game.status : null).toEqual({
      type: "in_progress",
      currentPlayer: "yellow"
    });
  });

  it("resolves and stores a random starter", () => {
    const controller = createGameController({ random: () => 0.9 });

    controller.startGame(localSetup("random"));
    const snapshot = controller.getSnapshot();

    expect(snapshot.phase === "playing" ? snapshot.resolvedStarter : null).toBe("yellow");
  });

  it("alternates local human turns", () => {
    const controller = createGameController();

    controller.startGame(localSetup("red"));
    controller.dropPiece(0);

    const snapshot = controller.getSnapshot();
    expect(snapshot.phase === "playing" ? snapshot.game.status : null).toEqual({
      type: "in_progress",
      currentPlayer: "yellow"
    });
  });

  it("runs an AI response after a human move", () => {
    const controller = createGameController({
      aiDelayMs: 0,
      scheduler: (callback) => {
        callback();
        return 0;
      },
      chooseMove: () => 1
    });

    controller.startGame(aiSetup("red"));
    controller.dropPiece(0);

    const snapshot = controller.getSnapshot();

    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : []).toEqual([
      { player: "red", row: 5, column: 0 },
      { player: "yellow", row: 5, column: 1 }
    ]);
  });

  it("keeps AI thinking until an async move chooser resolves", async () => {
    const deferredMove = createDeferred<number>();
    const controller = createGameController({
      aiDelayMs: 0,
      scheduler: (callback) => {
        callback();
        return 0;
      },
      chooseMove: () => deferredMove.promise
    });

    controller.startGame(aiSetup("red"));
    controller.dropPiece(0);

    const thinkingSnapshot = controller.getSnapshot();
    expect(thinkingSnapshot.phase === "playing" ? thinkingSnapshot.aiThinking : false).toBe(
      true
    );
    expect(thinkingSnapshot.phase === "playing" ? thinkingSnapshot.game.moveHistory : []).toEqual([
      { player: "red", row: 5, column: 0 }
    ]);

    deferredMove.resolve(1);
    await flushAsyncAi();

    const snapshot = controller.getSnapshot();
    expect(snapshot.phase === "playing" ? snapshot.aiThinking : true).toBe(false);
    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : []).toEqual([
      { player: "red", row: 5, column: 0 },
      { player: "yellow", row: 5, column: 1 }
    ]);
  });

  it("ignores stale async AI results after a restart", async () => {
    const deferredMove = createDeferred<number>();
    const controller = createGameController({
      aiDelayMs: 0,
      scheduler: (callback) => {
        callback();
        return 0;
      },
      chooseMove: () => deferredMove.promise
    });

    controller.startGame(aiSetup("red"));
    controller.dropPiece(0);
    controller.restart();

    deferredMove.resolve(1);
    await flushAsyncAi();

    const snapshot = controller.getSnapshot();
    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : null).toEqual([]);
    expect(snapshot.phase === "playing" ? snapshot.game.status : null).toEqual({
      type: "in_progress",
      currentPlayer: "red"
    });
  });

  it("aborts pending async AI work after a restart", async () => {
    const chooseMove = vi.fn((...args: Parameters<AiMoveChooser>) => {
      const signal = args[3];

      return new Promise<number>((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")), {
          once: true
        });
        window.setTimeout(() => resolve(1), 10);
      });
    });
    const controller = createGameController({
      aiDelayMs: 0,
      scheduler: (callback) => {
        callback();
        return 0;
      },
      chooseMove
    });

    controller.startGame(aiSetup("red"));
    controller.dropPiece(0);
    controller.restart();
    await flushAsyncAi();

    expect(chooseMove).toHaveBeenCalled();
    const snapshot = controller.getSnapshot();
    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : null).toEqual([]);
  });

  it("clears AI thinking and stores errors from rejected async move choosers", async () => {
    const controller = createGameController({
      aiDelayMs: 0,
      scheduler: (callback) => {
        callback();
        return 0;
      },
      chooseMove: () => Promise.reject(new Error("AI engine failed."))
    });

    controller.startGame(aiSetup("red"));
    controller.dropPiece(0);
    await flushAsyncAi();

    const snapshot = controller.getSnapshot();
    expect(snapshot.phase === "playing" ? snapshot.aiThinking : true).toBe(false);
    expect(snapshot.phase === "playing" ? snapshot.lastError : null).toBe(
      "AI engine failed."
    );
    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : []).toEqual([
      { player: "red", row: 5, column: 0 }
    ]);
  });

  it("uses the default AI thinking delay", () => {
    const scheduler = vi.fn();
    const controller = createGameController({
      scheduler,
      chooseMove: () => 1
    });

    controller.startGame(aiSetup("red"));
    controller.dropPiece(0);

    expect(scheduler).toHaveBeenCalledWith(
      expect.any(Function),
      DEFAULT_AI_THINKING_DELAY_MS
    );
  });

  it("lets AI start when selected", () => {
    const controller = createGameController({
      aiDelayMs: 0,
      scheduler: (callback) => {
        callback();
        return 0;
      },
      chooseMove: () => 3
    });

    controller.startGame(aiSetup("yellow"));
    const snapshot = controller.getSnapshot();

    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : []).toEqual([
      { player: "yellow", row: 5, column: 3 }
    ]);
  });

  it("rejects moves after a completed game", () => {
    const controller = createGameController();

    controller.startGame(localSetup("red"));
    [0, 1, 0, 1, 0, 1, 0].forEach((column) => controller.dropPiece(column));
    const before = controller.getSnapshot();
    controller.dropPiece(2);
    const after = controller.getSnapshot();

    expect(after.phase === "playing" ? after.game.moveHistory.length : 0).toBe(
      before.phase === "playing" ? before.game.moveHistory.length : -1
    );
  });

  it("preserves setup when restarting", () => {
    const controller = createGameController();

    controller.startGame(localSetup("yellow"));
    controller.dropPiece(0);
    controller.restart();
    const snapshot = controller.getSnapshot();

    expect(snapshot.phase === "playing" ? snapshot.resolvedStarter : null).toBe("yellow");
    expect(snapshot.phase === "playing" ? snapshot.game.moveHistory : []).toEqual([]);
  });
});
