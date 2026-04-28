# i18n

This folder contains local internationalization setup.

Responsibilities:

- Bundled translation resources.
- Supported language list.
- `i18next` and `react-i18next` initialization.
- Document `lang` and `dir` updates on language changes.

Rules for future edits:

- Keep translations local so the app works offline.
- Add new languages to `supportedLanguages` and `resources` together.
- Use `i18n.dir(language)` for direction.
- Language picker labels are rendered as endonyms via `Intl.DisplayNames`, so language names are not stored in `resources` — the picker stays correct regardless of the active UI language.
- Do not reset game state when changing language.
