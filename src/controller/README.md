# Controller

This folder owns runtime game orchestration outside React.

The controller is responsible for:

- Holding the current snapshot.
- Exposing `getSnapshot()` and `subscribe(listener)`.
- Receiving commands from UI.
- Starting and restarting games.
- Resolving random starters.
- Scheduling AI turns.
- Publishing `legalMoves` for UI rendering.

The controller may use `game-core` and `ai`, but it must not import React components.

React integration should happen through `src/hooks/useGameController.ts`.
