# Components

This folder contains React UI components only.

Components may:

- Render controller snapshots.
- Hold local form state for setup inputs.
- Dispatch controller commands such as `startGame`, `dropPiece`, `restart`, and `resetToSetup`.
- Use translation keys and Tailwind classes.

Components must not:

- Compute legal moves.
- Detect winners or draws.
- Switch turns.
- Resolve random starters.
- Call AI functions directly.

The board component must keep `dir="ltr"` so RTL languages do not change column indexes.
The board should use the checker grid itself for pointer handling.
