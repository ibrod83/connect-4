# Source Boundaries

This app is intentionally split so React renders the game but does not own game rules.

This document is the source-boundary reference for files under `src/`.

## Source Layout

- `game-core`: pure Connect 4 rules and immutable state transitions.
- `ai`: pure AI decision logic.
- `controller`: non-React runtime orchestration and subscriptions.
- `hooks`: React adapters into non-React units.
- `i18n`: local translations and document direction handling.
- `components`: React UI only.
- `test`: reserved for shared test utilities.

Core rule, turn, starter, and AI decisions should not be implemented in React components.

## Game Core

`src/game-core` contains pure Connect 4 rules.

Responsibilities:

- Board shape and domain types.
- Initial game creation.
- Legal move calculation.
- Immutable move application.
- Turn switching.
- Win and draw detection.
- Starter resolution.

Rules for future edits:

- Keep this layer pure TypeScript.
- Do not import React, i18n, controller, or AI modules.
- Do not mutate caller-owned state.
- Throw clear errors for invalid moves.
- Add unit tests for every rule change.

## AI

`src/ai` contains framework-independent AI logic.

Current behavior:

- `easy`: minimax depth 2.
- `medium`: minimax depth 3.
- `hard`: minimax depth 7.
- `very_hard`: a worker-backed WASM solver using bitboards, negamax, alpha-beta pruning, a transposition table, and an opening book.
- Minimax depth 7 remains the `very_hard` fallback when the worker-backed solver cannot run.
- Alpha-beta pruning is used for minimax and the stronger solver.
- Center-column move ordering is used to improve search quality.

Rules for future edits:

- Do not import React or controller code here.
- Do not mutate `GameState`.
- Return legal column numbers only.
- Keep difficulty mapping explicit and covered by tests.
- AI move choosers may return a column synchronously or as a promise-like async result.
- Strong or slow AI should run outside React and preferably off the main thread.

## Controller

`src/controller` owns runtime game orchestration outside React.

The controller is responsible for:

- Holding the current snapshot.
- Exposing `getSnapshot()` and `subscribe(listener)`.
- Receiving commands from UI.
- Starting and restarting games.
- Resolving random starters.
- Scheduling AI turns.
- Publishing `legalMoves` for UI rendering.
- Ignoring stale async AI results after a restart or reset.

The controller may use `game-core` and `ai`, but it must not import React components.

React integration should happen through `src/hooks/useGameController.ts`.

## Hooks

`src/hooks` contains React adapter hooks.

Current hook:

- `useGameController` subscribes React to the non-React controller through `useSyncExternalStore`.

Rules for future edits:

- Hooks may bridge React to external logic.
- Hooks should not duplicate game rules.
- Hooks should not store controller-owned game state in React state.
- Keep command methods on the controller, not inside hooks.

## i18n

`src/i18n` contains local internationalization setup.

Responsibilities:

- Bundled translation resources.
- Supported language list.
- `i18next` and `react-i18next` initialization.
- Document `lang` and `dir` updates on language changes.

Rules for future edits:

- Keep translations local; bundle them with the app.
- Add new languages to `supportedLanguages` and `resources` together.
- Use `i18n.dir(language)` for direction.
- Language picker labels are rendered as endonyms via `Intl.DisplayNames`, so language names are not stored in `resources` - the picker stays correct regardless of the active UI language.
- Initial language is auto-detected via `i18next-browser-languagedetector`; user selection persists in `localStorage`. `supportedLngs` constrains detection to bundled languages, so unsupported browser locales fall back to English.
- Do not reset game state when changing language.

## Components

`src/components` contains React UI components only.

Components may:

- Render controller snapshots.
- Hold local form state for setup inputs.
- Dispatch controller commands such as `startGame`, `dropPiece`, `restart`, and `resetToSetup`.
- Use translation keys and Tailwind classes.
- Derive display labels from setup data, such as `You`/`AI` or `Player 1`/`Player 2`.

Components must not:

- Compute legal moves.
- Detect winners or draws.
- Switch turns.
- Resolve random starters.
- Call AI functions directly.

The board component must keep `dir="ltr"` so RTL languages do not change column indexes.
The board should use the checker grid itself for pointer handling.

## Test Utilities

`src/test` is reserved for shared test helpers.

Use it only when multiple test files need the same setup or factory code.

Keep test helpers small and explicit. Domain-specific setup helpers should not hide important game moves or assertions from the tests that use them.
