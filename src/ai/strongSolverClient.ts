export type StrongSolverMoveRequest = {
  moves: string;
  legalMoves: number[];
  signal: AbortSignal;
};

type StrongSolverWorkerRequest = {
  type: "chooseMove";
  id: number;
  moves: string;
  legalMoves: number[];
};

type StrongSolverWorkerResponse =
  | {
      type: "move";
      id: number;
      column: number;
    }
  | {
      type: "error";
      id: number;
      message: string;
    };

let nextRequestId = 1;

export function canUseStrongSolverWorker(): boolean {
  return typeof Worker !== "undefined";
}

export function requestStrongSolverMove({
  moves,
  legalMoves,
  signal
}: StrongSolverMoveRequest): Promise<number> {
  if (signal.aborted) {
    return Promise.reject(createCancelledError());
  }

  if (!canUseStrongSolverWorker()) {
    return Promise.reject(new Error("Strong solver workers are not available."));
  }

  const id = nextRequestId;
  nextRequestId += 1;

  const worker = new Worker(new URL("./strongSolver.worker.ts", import.meta.url), {
    type: "module"
  });

  return new Promise<number>((resolve, reject) => {
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      worker.terminate();
    };

    const onAbort = () => {
      cleanup();
      reject(createCancelledError());
    };

    const onMessage = (event: MessageEvent<StrongSolverWorkerResponse>) => {
      const message = event.data;

      if (message.id !== id) {
        return;
      }

      cleanup();

      if (message.type === "move") {
        resolve(message.column);
        return;
      }

      reject(new Error(message.message));
    };

    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || "Strong solver worker failed."));
    };

    signal.addEventListener("abort", onAbort, { once: true });
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);

    const message: StrongSolverWorkerRequest = {
      type: "chooseMove",
      id,
      moves,
      legalMoves
    };
    worker.postMessage(message);
  });
}

function createCancelledError(): Error {
  return new Error("AI move cancelled.");
}
