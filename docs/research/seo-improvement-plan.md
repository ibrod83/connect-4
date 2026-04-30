# SEO Improvement Plan

Tracks SEO work that has been planned but not yet done for the Connect 4 PWA.

**Background:** the initial pass (commits `ec30093` and `25553d3`, April 2026) added meta tags, JSON-LD (`WebSite`, `VideoGame`, `FAQPage`), `robots.txt`, `sitemap.xml`, the Google Search Console verification meta tag, a PWA manifest fix, and a service-worker `navigateFallbackDenylist` for `/sitemap.xml` and `/robots.txt`. The site is deployed at `https://connect-4-two-tawny.vercel.app/`. Reference for foundations: `.claude/skills/seo/SKILL.md`.

---

## TODOs already marked in code

These are explicit `TODO(seo):` markers a grep will surface:

- **`public/og-image.png`** — 1200×600 (2:1 ratio per April 2026 spec). Without it, Facebook/X/LinkedIn shares render with no preview image. Referenced in `index.html` under `og:image` and `twitter:image`.
- **Maskable PNG icon** — 192×192 and 512×512 PNG with ~80% safe zone. Add as a second icon entry in `vite.config.ts` PWA manifest with `purpose: "maskable"`. The current SVG has no safe zone, so it can't honestly claim maskable.
- **`public/apple-touch-icon.png`** (180×180) — iOS Safari ignores SVG for "Add to Home Screen". The link tag in `index.html` currently falls back to the SVG.

---

## P1 — High-impact, low-effort

### Custom domain
The site lives at `*.vercel.app`. Google deprioritizes shared-platform subdomains relative to root domains. A custom domain (~$10/yr) pointed at the same Vercel project is the single biggest SEO lever still on the table. Once moved:

- Update the canonical URL in `index.html`, `public/robots.txt`, `public/sitemap.xml`, and the JSON-LD `@id`s.
- Re-verify the new property in Search Console (Domain property if you control DNS — strongly preferred).
- Add a 301 redirect from the `.vercel.app` URL via Vercel's domain settings or `vercel.json`.

### Bing Webmaster Tools
Submit the site to [bing.com/webmasters](https://www.bing.com/webmasters). Bing's index also feeds ChatGPT search and Copilot, so this is meaningful traffic.

### Lighthouse / Core Web Vitals audit
Run Lighthouse against the live URL on mobile and desktop, plus PageSpeed Insights ([pagespeed.web.dev](https://pagespeed.web.dev)). Goal: all Core Web Vitals green. The bundle is small, so likely already passing — confirm with field data.

### WASM solver lazy-loading verification
`connect_four_ai_wasm_bg.wasm` is 1.26 MB (gzip ~617 KB) — the largest single asset on the site. The worker (`src/ai/strongSolver.worker.ts`) imports it via Vite's `?url` syntax, which means the bytes only fetch when the worker actually runs. Worth verifying with the Network tab that:

- Selecting **Easy / Medium / Hard** does **not** trigger a `.wasm` download.
- Only **Very Hard** does.

If it's loading eagerly, fix by moving the worker spawn behind the difficulty selection.

### Search Console hygiene
- Enable email alerts for coverage / Core Web Vitals issues.
- After 2–4 weeks, review the Performance report for actual queries earning impressions.

---

## P2 — Content depth

### Expand the static intro in `index.html`
The current `<h1>` + paragraph is ~70 words. AI-Overview citation correlates with content depth. Realistic expansion (still inside `#root`, replaced on hydrate):

- **What is Connect 4** — origin (Milton Bradley, 1974), rule summary.
- **How to play** — 4–6 sentences on the drop mechanic, victory conditions.
- **Strategy basics** — center column control, double-threat traps, why the first player has a theoretical winning strategy.
- **About this app** — offline play, AI levels, languages.

Aim for 300–500 words, sub-headed with `<h2>` for skim-readability. This is what Wave-1 crawlers and AI agents see.

### `HowTo` JSON-LD
Add alongside the existing graph:
```json
{
  "@type": "HowTo",
  "name": "How to play Connect 4",
  "step": [
    { "@type": "HowToStep", "text": "Choose a color and decide who starts." },
    { "@type": "HowToStep", "text": "Take turns dropping discs into one of seven columns." },
    { "@type": "HowToStep", "text": "Discs fall to the lowest empty cell in the chosen column." },
    { "@type": "HowToStep", "text": "Win by aligning four of your discs in a row, column, or diagonal." }
  ]
}
```
Google deprecated the HowTo SERP rich result in 2023 but still uses the schema for AI Overviews.

### FAQ expansion
Current FAQ has 4 entries. Realistic additions:
- "Who goes first in Connect 4?"
- "Is Connect 4 always winnable?" (yes — first player wins with perfect play)
- "Can I play Connect 4 on my phone?" (yes — installable PWA)
- "What's the difference between the AI difficulty levels?"

Keep it honest — don't pad with manufactured questions.

---

## P2 — Technical hardening

### Vercel security headers
Add a `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "interest-cohort=()" }
      ]
    }
  ]
}
```
HSTS is set automatically by Vercel. CSP is deferred — Tailwind v4, Vite, and the PWA register script all inject inline styles/scripts, so a working CSP needs hashes/nonces and is its own small project.

### Analytics
Without analytics there's no way to tell which queries bring visitors. Per `AGENTS.md` this is a frontend-only MVP, so anything added must be client-only:
- **Plausible** — $9/mo, EU-hosted, no cookie banner needed in most jurisdictions, simplest.
- **Umami** — free if self-hosted; can run on a separate Vercel project.
- **GA4** — free but needs cookie consent in EU.

Optional but recommended once SEO actually starts producing impressions worth measuring.

### PWA install screenshots
Chrome 2026 uses the manifest `screenshots` array for a richer install prompt:
```json
"screenshots": [
  { "src": "/screenshot-mobile.png", "sizes": "540x720", "form_factor": "narrow" },
  { "src": "/screenshot-desktop.png", "sizes": "1280x720", "form_factor": "wide" }
]
```

---

## P3 — Multilingual SEO

The app supports `en`/`he`/`th` via browser detection on a single URL. Consequence: Google will only index one language version, and `hreflang` is not applicable.

**Option A — Stay single-URL (recommended for MVP).** Skip multilingual SEO entirely. Translations remain a UX feature for users who arrive in their detected language. Aligns with the "frontend-only MVP" framing in `AGENTS.md`.

**Option B — Path-segment routing (`/en/`, `/he/`, `/th/`).** Real architectural change; would warrant its own plan and a discussion before starting:
- Modify the History-API routing in `App.tsx` to read language from the path.
- Update `useDocumentLanguage` to follow the URL, not the browser.
- Build-time per-locale `index.html` so each language has its own static intro and JSON-LD `inLanguage`.
- One sitemap entry per language with `<xhtml:link rel="alternate" hreflang>` siblings.
- `<link rel="alternate" hreflang>` tags in each rendered HTML.

Worth doing only if Hebrew/Thai SEO is an explicit goal.

---

## P3 — Off-code (out of scope but worth noting)

These don't touch the repo but matter for ranking:
- Mention the project in your GitHub README — provides one organic inbound link.
- Submit to free PWA / web-game directories: `appsco.pe`, `progressier.com/store`, `pwa-directory.appspot.com`.
- A `/r/webgames` or HN Show post — natural traffic and one decent backlink.

---

## Validation checklist (run after domain change or any major SEO change)

- [ ] [Rich Results Test](https://search.google.com/test/rich-results) — confirms `WebSite`, `VideoGame`, `FAQPage`, `HowTo` parse.
- [ ] [Schema Markup Validator](https://validator.schema.org/) — broader schema check including non-Google AI search engines.
- [ ] [PageSpeed Insights](https://pagespeed.web.dev) — all Core Web Vitals green on mobile and desktop.
- [ ] Sitemap fetch in GSC reads **Success** with 1 URL discovered (or 3 if going multilingual).
- [ ] GSC URL Inspection — "View Crawled Page" → HTML tab contains the static `<h1>` + intro + JSON-LD; Screenshot tab shows the actual game UI (proves Wave-2 indexing worked).
- [ ] Open `og-image.png` in [opengraph.xyz](https://www.opengraph.xyz/) — preview looks correct on Facebook/X/LinkedIn/Discord.

---

## What NOT to do

- **Don't add SSR/Next.js.** `AGENTS.md` and `docs/architecture/architecture-decisions.md` rule it out, and Google's April 2026 stance is that CSR is no longer an indexing disqualifier — only a performance trade-off. The static intro in `index.html` covers Wave-1 crawlers and AI agents adequately.
- **Don't add fake reviews / `aggregateRating`.** Google penalizes fabricated structured data and AI search engines actively cross-check entity claims as of 2026.
- **Don't add `hreflang`** under the current single-URL model — it would be technically wrong and may trigger a "conflicting hreflang" warning.
- **Don't keep `vercel.app` as the canonical** if SEO performance starts to matter. Move to a custom domain first.

---

## Sources

- [Google Search Central — JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Schema and AI Overviews (Search Engine Land)](https://searchengineland.com/schema-ai-overviews-structured-data-visibility-462353)
- [Open Graph 2:1 image spec 2026](https://www.imarkinfotech.com/open-graph-tags-boost-social-sharing-and-seo-in-2026/)
- [Technical SEO Checklist 2026 (DebugBear)](https://www.debugbear.com/blog/technical-seo-checklist)
- [SEO for Single Page Applications: The Complete 2026 Guide (Nuxt SEO)](https://nuxtseo.com/learn-seo/spa-seo)
- [JSON-LD Schema Markup Complete Guide 2026 (Foglift)](https://foglift.io/blog/json-ld-seo-guide)
