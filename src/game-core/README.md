# Game Core

This folder contains pure Connect 4 rules.

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
