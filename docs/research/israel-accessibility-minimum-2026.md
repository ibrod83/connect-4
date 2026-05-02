# Minimal Accessibility Standard for an Israel-Facing Free Game Website

Date: 2026-05-02

This note summarizes the practical minimum accessibility target for this frontend-only 4 in a Row game, especially under Israeli website accessibility law. It is an engineering research note, not legal advice.

Last repo status update: 2026-05-02.

## Bottom Line

For an Israel-facing public game site, assume the minimum legal target is Israeli Standard SI 5568, Level AA, under Regulation 35 of the Equal Rights for Persons with Disabilities accessibility regulations.

SI 5568 is based on WCAG 2.0, with Israeli changes. In 2026, the practical engineering target should be WCAG 2.2 AA because W3C says WCAG 2.2 is backwards-compatible with WCAG 2.1 and WCAG 2.0.

Free access does not automatically remove the obligation. A public browser game is plausibly an entertainment or leisure service to the public. Future ads make the public/commercial-service argument stronger. There are exemptions, especially around turnover and undue burden, but the product should not be designed around an exemption unless legal counsel confirms it.

## Minimum To Implement

1. Keyboard-only gameplay
   - Setup, language switching, share buttons, and every playable board column must work without a mouse.
   - There must be no keyboard trap.
   - Focus must be clearly visible.

2. Screen-reader support for the game
   - Board columns should be real interactive controls, such as buttons.
   - Labels should describe the action and state, for example: "Column 3, empty, drop red piece."
   - Use live status updates for turn changes, move results, win, draw, invalid move, and full column messages.
   - Do not rely on red/yellow color alone; include player labels such as "You", "AI", "Player 1", or "Player 2".

3. Visual accessibility
   - Text contrast should meet WCAG AA.
   - Focus indicators and board states must be visible.
   - Game pieces should be distinguishable beyond color where practical.
   - The UI should remain usable at 200% zoom and on mobile viewports.

4. Motion and sound
   - Respect `prefers-reduced-motion`.
   - Avoid flashing or strobing effects.
   - If sound is added later, it must be optional/mutable and must never be the only cue.

5. Hebrew and RTL
   - Set correct `lang` and `dir` values for Hebrew UI.
   - Keep the board itself `dir="ltr"` so RTL languages do not remap column indexes.
   - Localize accessible labels and status text.

6. Accessibility statement
   - Add a visible Accessibility page or link.
   - State the standard targeted, what was tested, known gaps, contact email, and last updated date.
   - Israeli regulations specifically require an accessibility statement with contact details for reporting missing accommodations.

7. Ads later
   - Ad containers should have clear titles or labels.
   - Close and dismiss controls must be keyboard accessible.
   - Avoid autoplay audio and flashing ads.
   - Prefer accessible ad providers.
   - Document third-party accessibility limitations in the accessibility statement.

## Current Repo Status

The basic semantic attribute layer has been implemented.

Implemented:

- The visual board remains `dir="ltr"` so RTL languages do not remap column indexes.
- The visual checker grid is hidden from assistive technology, and playable columns are exposed as real buttons.
- Each column button has a localized accessible label for dropping a piece, full columns, or temporarily unavailable columns.
- The board has hidden instructions that explain column buttons and number-key shortcuts.
- The changing game status heading is a polite live region.
- The setup color segmented buttons expose selected state with `aria-pressed`.
- Icon-only share buttons have accessible labels.
- The copied-link state is announced through a polite live region.
- Decorative icons and the decorative app logo are hidden with `aria-hidden`.
- The drop-animation toggle is exposed as a labeled switch with `aria-checked`.
- Focus indicators on light surfaces now use darker blue focus rings instead of very pale blue rings.
- Yellow setup and player markers now use a dark border so the marker boundary is visible on light cards.
- Reduced-motion handling exists for checker drop animation, and the AI spinner uses Tailwind's `motion-reduce` handling.
- Localized accessibility labels were added for English, Hebrew, and Thai.

Still open:

- Add a visible Accessibility page or link with a clear accessibility statement.
- Manually test keyboard-only play in a real browser.
- Manually test with at least one screen reader, such as NVDA on Windows or VoiceOver on macOS/iOS.
- Run an automated audit with Lighthouse or axe, then manually review what the tool cannot judge.
- Manually verify the applied focus-ring and yellow-marker contrast fixes in a real browser.
- Decide whether pieces need a non-color distinction, such as a subtle pattern or symbol, so red/yellow is not the only cue.
- Consider richer screen-reader board state, such as announcing the last move and the current top playable row, not only the column action.
- Add a user-facing status message for invalid keyboard shortcuts or attempts to play unavailable columns if that becomes a real interaction path.
- When ads are introduced, audit the specific ad provider and document any third-party limitations.

## Color Contrast Audit

Audit date: 2026-05-02.

Method: code-level audit of visible Tailwind color pairings in `src/App.tsx`, `src/components`, and `src/index.css`, using Tailwind default color values. This does not replace real browser visual QA, Lighthouse/axe testing, or screen-reader testing.

Passes:

- Main dark text is safe: `text-zinc-950`, `text-zinc-900`, `text-zinc-800`, and `text-zinc-700` all pass AA on white and light zinc backgrounds.
- White button text on `bg-blue-700` passes at about 6.70:1.
- White button text on `bg-blue-800` hover state passes at about 8.72:1.
- The blue info note uses `text-blue-900` on `bg-blue-50`, about 9.52:1.
- The board column focus ring uses white against the blue board, about 6.70:1.
- Yellow checkers on the blue board pass by fill contrast, about 5.08:1.
- Red and yellow are also identified through player labels, not color alone.

Findings:

1. Focus rings on light backgrounds are too subtle.
   - `focus:ring-blue-100` on white is about 1.22:1.
   - `focus:ring-blue-200` on white is about 1.42:1.
   - This affects controls such as the language selector, setup selects, setup color buttons, restart/share buttons, and the primary blue buttons when the ring is outside the button on a white card.
   - Status: fixed in the current repo by using darker blue focus rings on light surfaces. `blue-600` on white is about 5.17:1.

2. Yellow markers on light cards do not meet non-text contrast by themselves.
   - `bg-yellow-300` on white is about 1.32:1.
   - `bg-yellow-300` on zinc-50 is about 1.26:1.
   - `bg-yellow-300` on blue-50 is about 1.21:1.
   - The previous `border-yellow-400` around the setup yellow swatch was still only about 1.41-1.53:1 on light backgrounds.
   - Affected areas: the setup yellow color swatch and the yellow player badge marker.
   - Status: fixed in the current repo for setup and player markers by using a dark border. `zinc-700` on light backgrounds is about 9.60-10.44:1.

3. Muted `text-zinc-500` is acceptable on white, but has little spare margin.
   - `text-zinc-500` on white is about 4.83:1, so it passes AA for normal text.
   - It would fail on `bg-blue-50` at about 4.44:1.
   - Current usage appears to be on white cards, so no immediate fix is required. Avoid moving these labels onto tinted backgrounds unless the text is darkened to `zinc-600` or `zinc-700`.

4. Red pieces need visual QA against the blue board.
   - Red fill against `bg-blue-700` is only about 1.78:1 by color alone.
   - The current checker rendering has a dark ring/shadow treatment, so the perceived piece boundary may be sufficient.
   - Recommended verification: check the actual rendered board in a browser. If the red piece edge is not clearly visible, add an explicit dark outline to checkers.

## Practical Recommendation

For this app, build to WCAG 2.2 AA, publish an accessibility statement, and test manually with keyboard plus NVDA or VoiceOver. Automated tools such as Lighthouse or axe are useful, but they are not enough to prove game accessibility.

This target should cover the Israeli SI 5568 AA baseline better than aiming only at old WCAG 2.0 wording.

## Sources

- Israeli service accessibility regulations, including Regulation 35 for internet services: https://www.gov.il/BlobFolder/guide/accommodating_service_providing_rules/he/sitedocs_service_acessibility_regulations.pdf
- Official SI 5568 Part 1, September 2023: https://www.gov.il/BlobFolder/legalinfo/israeli_accessibility_standards_pdf/he/sitedocs_si-5568-1-september-2023.pdf
- Israeli gov.il exemption page for internet accessibility due to undue burden: https://www.gov.il/he/service/application_for_exemption_internet_people_with_disabilities
- W3C WCAG 2 overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- W3C WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
