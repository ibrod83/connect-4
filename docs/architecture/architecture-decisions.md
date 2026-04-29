# Connect 4 Architecture Decisions

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

- Local multiplayer means pass-and-play on one browser/device.
- Human and AI players use the same turn flow through `PlayerConfig`.
- A human-vs-AI game is just a setup where one player has `kind: "ai"`.
- If the resolved starter is AI, the controller schedules the opening AI move automatically.
- User-facing player identity is role-based, not color-based: human-vs-AI displays `You` and `AI`; local pass-and-play displays `Player 1` and `Player 2`.
- Red and yellow remain piece colors and are shown as color markers beside the player identity.

## Starter Selection

- Supported start modes are `red`, `yellow`, and `random`.
- Random starter resolution happens once in the logic/controller layer.
- The UI displays the resolved starter but does not calculate it.
- Dice behavior is intentionally out of scope.

## AI

- AI uses minimax with alpha-beta pruning.
- Difficulty mapping:
  - `easy`: random legal move.
  - `medium`: minimax depth 3.
  - `hard`: minimax depth 5 with center-column move ordering.
  - `very_hard`: minimax depth 7 with center-column move ordering.
- AI functions must stay pure and framework-independent.

## i18n and RTL

- The app uses bundled `i18next` and `react-i18next` resources so language switching works offline.
- Bundled languages are English, Hebrew, and Thai.
- Initial language is auto-detected via `i18next-browser-languagedetector` (client-side signals only, no IP); `supportedLngs` restricts detection to bundled languages, with English as the fallback. User selection persists in `localStorage`.
- On language change, the app updates:
  - `document.documentElement.lang`
  - `document.documentElement.dir`
- Direction comes from `i18n.dir(language)`.
- Surrounding UI follows LTR/RTL direction.
- The Connect 4 board is explicitly rendered with `dir="ltr"` so locale direction does not remap column indexes.

## Styling

- Tailwind CSS is the styling layer.
- Use mobile-first utilities.
- Prefer logical spacing and direction-safe utilities for multilingual UI.
- Keep the UI simple, modern, and functional; avoid decorative effects that complicate the game surface.

## Routing

- The app uses the History API directly rather than a router library, to keep runtime dependencies minimal.
- Entering the playing phase pushes a history entry tagged `{ phase: "playing" }`.
- A `popstate` listener calls `resetToSetup()` when the browser back button is pressed during a game, so back returns to the setup screen instead of leaving the app.
- Leaving the playing phase via the "New game" button calls `history.back()` to keep browser history in sync; the popstate handler is a no-op when phase has already changed.

## Offline/PWA

- The app is a Vite PWA using `vite-plugin-pwa`.
- The service worker precaches the app shell and built assets.
- Gameplay requires no network calls.
- Translation resources are local and included in the bundle.

## Testing Expectations

- Core game behavior is covered by unit tests.
- AI tactical behavior is covered by unit tests.
- Controller turn flow is covered by unit tests.
- i18n/RTL behavior is covered by React tests.
- Important invariant: board column mapping must stay stable in RTL.

## Dependency Boundary

- Runtime dependencies are limited to React, i18n, and UI icons.
- Build/test/PWA tools live in `devDependencies`.
- `npm audit --omit=dev` should remain clean for runtime dependencies.
