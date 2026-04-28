# Hooks

This folder contains React adapter hooks.

Current hook:

- `useGameController` subscribes React to the non-React controller through `useSyncExternalStore`.

Rules for future edits:

- Hooks may bridge React to external logic.
- Hooks should not duplicate game rules.
- Hooks should not store controller-owned game state in React state.
- Keep command methods on the controller, not inside hooks.
