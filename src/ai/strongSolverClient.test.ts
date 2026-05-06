type PostedWorkerMessage = {
  type: "chooseMove";
  id: number;
  moves: string;
  legalMoves: number[];
};

class FakeWorker {
  static instances: FakeWorker[] = [];

  readonly messages: PostedWorkerMessage[] = [];
  readonly url: string | URL;
  readonly options?: WorkerOptions;
  terminated = false;

  private readonly messageListeners = new Set<EventListenerOrEventListenerObject>();
  private readonly errorListeners = new Set<EventListenerOrEventListenerObject>();

  constructor(url: string | URL, options?: WorkerOptions) {
    this.url = url;
    this.options = options;
    FakeWorker.instances.push(this);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === "message") {
      this.messageListeners.add(listener);
    }

    if (type === "error") {
      this.errorListeners.add(listener);
    }
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type === "message") {
      this.messageListeners.delete(listener);
    }

    if (type === "error") {
      this.errorListeners.delete(listener);
    }
  }

  postMessage(message: PostedWorkerMessage): void {
    this.messages.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  emitMessage(data: unknown): void {
    dispatchEventListeners(this.messageListeners, { data } as MessageEvent);
  }

  emitError(message: string): void {
    dispatchEventListeners(this.errorListeners, { message } as ErrorEvent);
  }
}

describe("strong solver client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("reuses the same worker across successful move requests", async () => {
    const { requestStrongSolverMove } = await loadClientWithFakeWorker();

    const first = requestStrongSolverMove({
      moves: "",
      legalMoves: [3],
      signal: new AbortController().signal
    });

    expect(FakeWorker.instances).toHaveLength(1);
    const worker = FakeWorker.instances[0];
    expect(worker.messages).toEqual([
      {
        type: "chooseMove",
        id: 1,
        moves: "",
        legalMoves: [3]
      }
    ]);

    worker.emitMessage({ type: "move", id: 1, column: 3 });

    await expect(first).resolves.toBe(3);

    const second = requestStrongSolverMove({
      moves: "4",
      legalMoves: [0, 1],
      signal: new AbortController().signal
    });

    expect(FakeWorker.instances).toHaveLength(1);
    expect(worker.messages[1]).toEqual({
      type: "chooseMove",
      id: 2,
      moves: "4",
      legalMoves: [0, 1]
    });

    worker.emitMessage({ type: "move", id: 2, column: 1 });

    await expect(second).resolves.toBe(1);
    expect(worker.terminated).toBe(false);
  });

  it("terminates the shared worker when a pending request is cancelled", async () => {
    const { requestStrongSolverMove } = await loadClientWithFakeWorker();
    const abortController = new AbortController();

    const request = requestStrongSolverMove({
      moves: "",
      legalMoves: [0],
      signal: abortController.signal
    });

    const worker = FakeWorker.instances[0];
    abortController.abort();

    await expect(request).rejects.toThrow("AI move cancelled.");
    expect(worker.terminated).toBe(true);

    const next = requestStrongSolverMove({
      moves: "1",
      legalMoves: [0],
      signal: new AbortController().signal
    });

    expect(FakeWorker.instances).toHaveLength(2);
    FakeWorker.instances[1].emitMessage({ type: "move", id: 2, column: 0 });

    await expect(next).resolves.toBe(0);
  });

  it("recreates the worker after a worker-level error", async () => {
    const { requestStrongSolverMove } = await loadClientWithFakeWorker();

    const request = requestStrongSolverMove({
      moves: "",
      legalMoves: [0],
      signal: new AbortController().signal
    });

    const worker = FakeWorker.instances[0];
    worker.emitError("Strong solver failed to load.");

    await expect(request).rejects.toThrow("Strong solver failed to load.");
    expect(worker.terminated).toBe(true);

    const next = requestStrongSolverMove({
      moves: "1",
      legalMoves: [0],
      signal: new AbortController().signal
    });

    expect(FakeWorker.instances).toHaveLength(2);
    FakeWorker.instances[1].emitMessage({ type: "move", id: 2, column: 0 });

    await expect(next).resolves.toBe(0);
  });
});

async function loadClientWithFakeWorker(): Promise<typeof import("./strongSolverClient")> {
  vi.resetModules();
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
  return import("./strongSolverClient");
}

function dispatchEventListeners(
  listeners: Set<EventListenerOrEventListenerObject>,
  event: Event
): void {
  listeners.forEach((listener) => {
    if (typeof listener === "function") {
      listener(event);
      return;
    }

    listener.handleEvent(event);
  });
}
