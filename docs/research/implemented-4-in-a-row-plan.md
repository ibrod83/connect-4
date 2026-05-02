# Implemented Web 4 in a Row MVP Plan

## Summary

Build a browser-only 4 in a Row MVP with React, Vite, TypeScript, and Tailwind CSS. The app runs fully in the frontend and keeps game rules, state transitions, starter selection, AI, and orchestration outside React UI components.

The MVP supports:

- Human vs AI.
- AI difficulty levels.
- Starter selection: Red, Yellow, or Random.
- English and Hebrew UI with LTR/RTL support.
- No backend, login, auth, online multiplayer, or persisted match history.

## Architecture

- `game-core`: pure TypeScript rules, immutable board state, legal moves, win/draw detection, move application, and starter resolution.
- `ai`: pure TypeScript minimax with alpha-beta pruning.
- `game-controller`: non-React runtime unit exposing `getSnapshot`, `subscribe`, and command methods.
- `i18n`: bundled local translations, language selection, fallback language, and document `lang`/`dir` handling.
- `ui`: React components that render controller snapshots and call commands only.
- `styles`: Tailwind mobile-first styling using direction-safe utilities where needed.

React connects to the non-React controller through a custom hook using `useSyncExternalStore`.

## Key Decisions

- UI state does not own game state.
- React components do not compute legal moves, winners, turn switching, starter resolution, or AI moves.
- The controller snapshot includes `legalMoves`, so the UI can disable invalid columns without importing rule logic.
- Random starter resolution happens once inside the logic/controller layer.
- If AI is the resolved starter, the controller schedules the opening AI move automatically.
- Translations are bundled locally with the app.
- The root document gets updated with `lang` and `dir` on language changes.
- The game board itself is always rendered with `dir="ltr"` so RTL languages do not remap column indexes.

## AI Difficulty

- `easy`: minimax depth 2 with alpha-beta pruning and center-column move ordering.
- `medium`: minimax depth 3 with alpha-beta pruning and center-column move ordering.
- `hard`: minimax depth 5 with alpha-beta pruning and center-column move ordering.
- `very_hard`: minimax depth 7 with alpha-beta pruning and center-column move ordering.

## Implemented Steps

1. Scaffolded Vite React TypeScript app with Vitest, React Testing Library, Tailwind CSS, `i18next`, and `react-i18next`.
2. Added research note for React/controller and i18n/RTL decisions.
3. Implemented pure `game-core` with initial state, legal moves, immutable move application, win/draw detection, and starter resolution.
4. Implemented AI with minimax, alpha-beta pruning, heuristic scoring, and difficulty mapping.
5. Implemented the non-React game controller with snapshots, subscriptions, setup commands, move commands, restart, reset, and AI scheduling.
6. Implemented `useGameController` as the only React bridge to controller state.
7. Configured English and Hebrew i18n resources with fallback to English.
8. Added document language/direction updates through `i18n.dir(language)`.
9. Built setup UI for game mode, player names, AI difficulty, starter selection, and language selection.
10. Built game UI with board, column controls, current status, resolved starter, winner/draw state, restart, and back-to-setup controls.
11. Styled the app with Tailwind for simple responsive LTR/RTL layouts.

## Test Coverage

- Game logic tests cover starter selection, legal moves, piece drops, full-column rejection, horizontal/vertical/diagonal wins, draw detection, and immutability.
- AI tests cover immediate wins, blocking opponent wins, legal move selection, center preference, and difficulty mapping.
- Controller tests cover subscriptions, selected/random starters, human turn alternation, AI responses, AI starting, completed-game rejection, and restart behavior.
- i18n/RTL tests cover English LTR, Hebrew RTL, language switching without resetting the game, and stable board column mapping in RTL.

## Verification

Final verification commands:

```powershell
npm run lint
npm test
npm run build
npm audit --omit=dev
```

Results:

- TypeScript lint passed.
- 28 tests passed.
- Production build passed.
- Runtime dependency audit passed with 0 vulnerabilities.

## Remaining Notes

- Runtime dependencies are clean under `npm audit --omit=dev`.
- Dice-based starter selection was explicitly removed; Random replaced it.
