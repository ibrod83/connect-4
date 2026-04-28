# React Controller, i18n, and RTL Boundary Notes

## State Boundary

The game state is owned by a non-React controller. React components do not keep board state, compute legal moves, resolve starters, or invoke AI directly.

The controller exposes:

- `getSnapshot()` for the current immutable UI-facing snapshot.
- `subscribe(listener)` for change notifications.
- command methods such as `startGame`, `dropPiece`, `restart`, and `resetToSetup`.

React connects to that controller through a custom hook using `useSyncExternalStore`. This keeps React as a renderer of controller snapshots while still giving React safe re-render semantics for external state.

## i18n and RTL

Translations are bundled locally through `i18next` and `react-i18next`, so language switching works offline and does not depend on a backend or CDN.

The app updates the root document attributes on language change:

- `<html lang="...">`
- `<html dir="ltr|rtl">`

Direction comes from `i18n.dir(language)`. Layout uses Tailwind logical utilities and `rtl:` / `ltr:` variants where direction-specific styling is needed.

The game board itself is explicitly rendered with `dir="ltr"`. This prevents RTL page direction from changing the meaning of column indexes or mirroring the board in a way that would break game logic.
