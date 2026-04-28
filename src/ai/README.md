# AI

This folder contains framework-independent AI logic.

Current behavior:

- `easy`: random legal move.
- `medium`: minimax depth 3.
- `hard`: minimax depth 5.
- Alpha-beta pruning is used for minimax.
- Center-column move ordering is used to improve search quality.

Rules for future edits:

- Do not import React or controller code here.
- Do not mutate `GameState`.
- Return legal column numbers only.
- Keep difficulty mapping explicit and covered by tests.
