# Unbeatable 4 in a Row

Frontend-only 4 in a Row game built with React, TypeScript, Vite, and Tailwind CSS.

**Production site:** [https://unbeatable-4-in-a-row.vercel.app/](https://unbeatable-4-in-a-row.vercel.app/)

## Features

- Play 4 in a Row in the browser with no signup, backend, ads, or persisted match history.
- Challenge AI opponents across four difficulty levels, including a stronger solver-backed mode.
- Bundled English, Hebrew, and Thai translations with RTL-safe board indexing.

## Architecture

React is kept as the render and dispatch layer. Game rules, turn handling, starter resolution, and AI decisions live outside React components.

Main boundaries:

- `src/game-core`: pure 4 in a Row rules and immutable state transitions.
- `src/ai`: framework-independent AI decision logic.
- `src/controller`: runtime orchestration, subscriptions, and AI scheduling.
- `src/hooks`: React adapters into non-React controller state.
- `src/components`: UI rendering and controller commands only.
- `src/i18n`: bundled translations and document language/direction handling.

See `docs/architecture/source-boundaries.md` and `docs/architecture/architecture-decisions.md` for the durable project rules.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Vitest
- i18next / react-i18next
- connect-four-ai-wasm

## Local Development

Install dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm run dev
```

Run checks:

```sh
npm run lint
npm test
npm run build
```

Preview the production build locally:

```sh
npm run preview
```
