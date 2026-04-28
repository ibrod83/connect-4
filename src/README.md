# Source Layout

This app is intentionally split so React renders the game but does not own game rules.

- `game-core`: pure Connect 4 rules and immutable state transitions.
- `ai`: pure AI decision logic.
- `controller`: non-React runtime orchestration and subscriptions.
- `hooks`: React adapters into non-React units.
- `i18n`: local translations and document direction handling.
- `components`: React UI only.
- `test`: reserved for shared test utilities.

Core rule, turn, starter, and AI decisions should not be implemented in React components.
