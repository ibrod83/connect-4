import init, { AIPlayer, Difficulty, Position } from "connect-four-ai-wasm";
import wasmUrl from "connect-four-ai-wasm/connect_four_ai_wasm_bg.wasm?url";

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

let aiPlayerPromise: Promise<AIPlayer> | null = null;
let wasmBytesPromise: Promise<ArrayBuffer> | null = null;

globalThis.addEventListener(
  "message",
  (event: MessageEvent<StrongSolverWorkerRequest>) => {
    void handleChooseMove(event.data);
  }
);

async function handleChooseMove(message: StrongSolverWorkerRequest): Promise<void> {
  if (message.type !== "chooseMove") {
    return;
  }

  let position: Position | null = null;

  try {
    const aiPlayer = await getAiPlayer();
    position = Position.fromMoves(message.moves);
    const column = aiPlayer.getMove(position);
    console.log('column from wasm',column)
    postResponse({
      type: "move",
      id: message.id,
      column: isLegalColumn(column, message.legalMoves)
        ? column
        : chooseFallbackColumn(message.legalMoves)
    });
  } catch (error) {
    postResponse({
      type: "error",
      id: message.id,
      message: error instanceof Error ? error.message : "Strong solver failed."
    });
  } finally {
    position?.free();
  }
}

async function getAiPlayer(): Promise<AIPlayer> {
  if (!aiPlayerPromise) {
    aiPlayerPromise = getWasmBytes()
      .then((module_or_path) => init({ module_or_path }))
      .then(() => new AIPlayer(Difficulty.IMPOSSIBLE));
  }
  return aiPlayerPromise;
}

async function getWasmBytes(): Promise<ArrayBuffer> {
  if (!wasmBytesPromise) {
    wasmBytesPromise = fetch(wasmUrl).then((response) => {
      if (!response.ok) {
        throw new Error(`Strong solver WASM failed to load: ${response.status}`);
      }

      return response.arrayBuffer();
    });
  }

  return wasmBytesPromise;
}

function isLegalColumn(column: number | undefined, legalMoves: number[]): column is number {
  return typeof column === "number" && legalMoves.includes(column);
}

function chooseFallbackColumn(legalMoves: number[]): number {
  if (legalMoves.length === 0) {
    throw new Error("Strong solver cannot move without legal moves.");
  }

  return [...legalMoves].sort(
    (left, right) => Math.abs(left - 3) - Math.abs(right - 3)
  )[0];
}

function postResponse(response: StrongSolverWorkerResponse): void {
  globalThis.postMessage(response);
}
