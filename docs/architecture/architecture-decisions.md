# 4 in a Row Architecture Decisions

This document is the short future-session reference for the main architectural decisions in this MVP.

## Core Boundary

- The app is frontend-only. There is no backend, login, auth, online multiplayer, or persisted match history.
- Game rules live in `src/game-core`, not in React components.
- AI logic lives in `src/ai`, not in React components or controller UI code.
- Runtime orchestration lives in `src/controller/GameController.ts`.
- React components only render snapshots and dispatch commands.

## Game State

- `GameState` is immutable from the caller's point of view.
- Moves are applied through `applyMove(state, column)`.
- Win, draw, legal move, and turn logic are computed by pure TypeScript functions.
- UI must not compute legal moves, winners, turn switching, or starter resolution.
- The controller snapshot includes `legalMoves` so the UI can disable columns without importing rule logic.

## React Integration

- The controller exposes `getSnapshot()`, `subscribe(listener)`, and command methods.
- React connects through `src/hooks/useGameController.ts` using `useSyncExternalStore`.
- React should not mirror controller-owned game state in component state.
- Component state is acceptable only for local form inputs, such as setup selections before `startGame`.

## Player Model

- The app is human-vs-AI only. The setup screen does not expose a local pass-and-play option.
- Human and AI players use the same turn flow through `PlayerConfig`.
- A human-vs-AI game is just a setup where one player has `kind: "ai"`.
- If the resolved starter is AI, the controller schedules the opening AI move automatically.
- User-facing player identity is role-based, not color-based: the human player displays `You` and the opponent displays `AI`.
- Red and yellow remain piece colors and are shown as color markers beside the player identity.

## Starter Selection

- Supported start modes are `red`, `yellow`, and `random`.
- The default setup starts the AI first on `very_hard`.
- Random starter resolution happens once in the logic/controller layer.
- The UI displays the resolved starter but does not calculate it.
- Dice behavior is intentionally out of scope.

## AI

- AI uses minimax with alpha-beta pruning for `easy`, `medium`, and `hard`.
- `very_hard` uses a worker-backed WASM solver with bitboards, negamax, alpha-beta pruning, a transposition table, and an embedded opening book.
- If the worker-backed solver cannot run, `very_hard` falls back to minimax depth 7.
- The controller accepts AI move choosers that return either a column number or a promise-like column result.
- Async AI results are ignored if they belong to an older game after restart or reset.
- Difficulty mapping:
  - `easy`: minimax depth 2 with center-column move ordering.
  - `medium`: minimax depth 3 with center-column move ordering.
  - `hard`: minimax depth 7 with center-column move ordering.
  - `very_hard`: strong solver, with minimax depth 7 as fallback.
- AI functions must stay pure and framework-independent.

## i18n and RTL

- The app uses bundled `i18next` and `react-i18next` resources.
- Bundled languages are English, Hebrew, and Thai.
- Initial language is auto-detected via `i18next-browser-languagedetector` (client-side signals only, no IP); `supportedLngs` restricts detection to bundled languages, with English as the fallback. User selection persists in `localStorage`.
- On language change, the app updates:
  - `document.documentElement.lang`
  - `document.documentElement.dir`
- Direction comes from `i18n.dir(language)`.
- Surrounding UI follows LTR/RTL direction.
- The 4 in a Row board is explicitly rendered with `dir="ltr"` so locale direction does not remap column indexes.

## Styling

- Tailwind CSS is the styling layer.
- Use mobile-first utilities.
- Prefer logical spacing and direction-safe utilities for multilingual UI.
- Keep the UI simple, modern, and functional; avoid decorative effects that complicate the game surface.

## Routing

- The app uses `react-router-dom` (`BrowserRouter`) with two real paths: `/` for the game (setup or in-progress) and `/accessibility` for the Hebrew accessibility statement.
- `App.tsx` is split into a top-level `<Routes>` shell and an inner `GameApp` component. The `/accessibility` route renders `AccessibilityPage` standalone (no game header, no language switcher); everything else renders `GameApp`.
- Within `GameApp`, the controller's `phase` is the source of truth for which screen renders (`SetupScreen` vs `GameScreen`). The URL pathname does **not** change between setup and playing — the playing state is not separately addressable (there is no way to deep-link into a game), so making it a real route would invite confusing direct-URL hits and is not worth the host-fallback dependency it introduces.
- The setup ↔ playing transition does not push or pop history entries. Pressing the browser back button during a game exits the site rather than returning to setup; the only way back to the setup screen is the in-game "Back to setup" button, which calls `controller.resetToSetup()`. This was an intentional simplification — the prior history-push/pop scheme produced surprising back-button behavior across mobile gestures and the accessibility route, and the dedicated button is discoverable enough on its own.
- Navigating between `/accessibility` and the game routes mounts/unmounts `GameApp`, which resets the controller. This matches the previous full-page-reload behavior of the static accessibility page.
- `AccessibilityPage` overrides `<html lang>`/`<dir>` to Hebrew/RTL on mount regardless of the active UI language, since the accessibility statement is Hebrew-only.
- `vercel.json` configures an SPA fallback rewrite so cold hits on `/accessibility` (and any other unknown path) serve `index.html` instead of 404ing on Vercel. Vite's dev server provides the equivalent fallback automatically in local development.

## Network and Caching

- Gameplay requires no network calls; all game logic, AI, and translations run client-side.
- Static assets are served from the CDN with content-hashed filenames.

## Testing Expectations

- Core game behavior is covered by unit tests.
- AI tactical behavior is covered by unit tests.
- Controller turn flow is covered by unit tests.
- i18n/RTL behavior is covered by React tests.
- Important invariant: board column mapping must stay stable in RTL.

## Dependency Boundary

- Runtime dependencies are limited to React, i18n, UI icons, and the local WASM 4 in a Row solver.
- Build/test tools live in `devDependencies`.
- `npm audit --omit=dev` should remain clean for runtime dependencies.
