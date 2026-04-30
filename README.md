# Connect 4

Frontend-only Connect 4 game built with React, TypeScript, Vite, and Tailwind CSS.

**Production site:** [https://connect-4-two-tawny.vercel.app/](https://connect-4-two-tawny.vercel.app/)

## Features

- Play Connect 4 in the browser with no signup, backend, ads, or persisted match history.
- Challenge AI opponents across four difficulty levels, including a stronger solver-backed mode.
- Runs as an installable PWA with all gameplay logic computed locally in the frontend.
- Bundled English, Hebrew, and Thai translations with RTL-safe board indexing.

## Architecture

React is kept as the render and dispatch layer. Game rules, turn handling, starter resolution, and AI decisions live outside React components.

Main boundaries:

- `src/game-core`: pure Connect 4 rules and immutable state transitions.
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
- vite-plugin-pwa
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
