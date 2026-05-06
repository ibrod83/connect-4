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
let sharedWorker: Worker | null = null;

type PendingStrongSolverRequest = {
  resolve: (column: number) => void;
  reject: (error: Error) => void;
  cleanup: () => void;
};

const pendingRequests = new Map<number, PendingStrongSolverRequest>();

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

  const worker = getStrongSolverWorker();

  return new Promise<number>((resolve, reject) => {
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      pendingRequests.delete(id);
      if (pendingRequests.size === 0) {
        terminateSharedWorker();
      }
      reject(createCancelledError());
    };

    signal.addEventListener("abort", onAbort, { once: true });
    pendingRequests.set(id, {
      resolve,
      reject,
      cleanup
    });

    const message: StrongSolverWorkerRequest = {
      type: "chooseMove",
      id,
      moves,
      legalMoves
    };
    try {
      worker.postMessage(message);
    } catch (error) {
      cleanup();
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error("Strong solver worker failed."));
    }
  });
}

function createCancelledError(): Error {
  return new Error("AI move cancelled.");
}

function getStrongSolverWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(new URL("./strongSolver.worker.ts", import.meta.url), {
      type: "module"
    });
    sharedWorker.addEventListener("message", handleWorkerMessage);
    sharedWorker.addEventListener("error", handleWorkerError);
  }

  return sharedWorker;
}

function handleWorkerMessage(event: MessageEvent<StrongSolverWorkerResponse>): void {
  const message = event.data;
  const request = pendingRequests.get(message.id);

  if (!request) {
    return;
  }

  request.cleanup();
  pendingRequests.delete(message.id);

  if (message.type === "move") {
    request.resolve(message.column);
    return;
  }

  const error = new Error(message.message);
  request.reject(error);
  rejectPendingRequests(error);
  terminateSharedWorker();
}

function handleWorkerError(event: ErrorEvent): void {
  const error = new Error(event.message || "Strong solver worker failed.");
  rejectPendingRequests(error);
  terminateSharedWorker();
}

function rejectPendingRequests(error: Error): void {
  pendingRequests.forEach((request) => {
    request.cleanup();
    request.reject(error);
  });
  pendingRequests.clear();
}

function terminateSharedWorker(): void {
  if (!sharedWorker) {
    return;
  }

  sharedWorker.removeEventListener("message", handleWorkerMessage);
  sharedWorker.removeEventListener("error", handleWorkerError);
  sharedWorker.terminate();
  sharedWorker = null;
}
