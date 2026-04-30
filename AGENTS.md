# AGENTS.md

## Repository Guidance

- This is a frontend-only Connect 4 MVP. Do not add backend, login, auth, online multiplayer, or persisted match history unless explicitly requested.
- Read `docs/architecture/source-boundaries.md` before changing files under `src/`.
- For broader design context, read `docs/architecture/architecture-decisions.md`.
- Keep React as the render and dispatch layer. Do not put game rules, turn logic, starter resolution, or AI decisions in React components.
- Keep the board rendered with `dir="ltr"` so RTL languages do not remap column indexes.
- Keep translations local; bundle them with the app.
- Do not start the local dev server; the user will run it manually when needed.
- When changing behavior, run the relevant checks from `package.json`: `npm run lint`, `npm test`, and `npm run build`.

## Documentation Placement

- Put persistent agent rules in this file.
- Put durable architecture decisions in `docs/architecture/`.
- Keep historical or exploratory notes in `docs/research/`.
- Put repeatable agent workflows in `.agents/skills/`.
