# SEO Improvement Plan

Tracks SEO work that has been planned but not yet done for the 4 in a Row site.

**Background:** the initial pass (commits `ec30093` and `25553d3`, April 2026) added meta tags, JSON-LD (`WebSite`, `VideoGame`, `FAQPage`), `robots.txt`, `sitemap.xml`, and the Google Search Console verification meta tag. The site is deployed at `https://unbeatable-4-in-a-row.vercel.app/`. Reference for foundations: `.claude/skills/seo/SKILL.md`.

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

### FAQ expansion
Current FAQ has 4 entries, including a beatability question for the Very Hard AI. Realistic additions:
- "Who goes first in 4 in a Row?"
- "Is 4 in a Row always winnable?" (yes — first player wins with perfect play)
- "Can I play 4 in a Row on my phone?" (yes — runs in any mobile browser)
- "What's the difference between the AI difficulty levels?" (expand beyond the current short answer only if it stays honest)

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
HSTS is set automatically by Vercel. CSP is deferred — Tailwind v4 and Vite inject inline styles/scripts, so a working CSP needs hashes/nonces and is its own small project.

### Analytics
Without analytics there's no way to tell which queries bring visitors. Per `AGENTS.md` this is a frontend-only MVP, so anything added must be client-only:
- **Plausible** — $9/mo, EU-hosted, no cookie banner needed in most jurisdictions, simplest.
- **Umami** — free if self-hosted; can run on a separate Vercel project.
- **GA4** — free but needs cookie consent in EU.

Optional but recommended once SEO actually starts producing impressions worth measuring.

---

## Future — Multilingual SEO (postponed)

Current MVP state: the app has one canonical SEO URL, with English static HTML and English metadata. The React UI still supports `en`/`he`/`th` through client-side browser detection and the language switcher, but those translations are a UX feature, not separate indexable language pages.

Keep the current single-URL SEO surface English-only:

- No `hreflang` tags under the single-URL model.
- No `og:locale:alternate` tags until localized URLs exist.
- JSON-LD `inLanguage` should describe the canonical page as English.
- Keep `public/sitemap.xml` to one canonical URL.

Future localized SEO would require path-segment routing (`/en/`, `/he/`, `/th/`) or equivalent locale-specific URLs. Treat this as a separate project, not an MVP cleanup:

- Modify the History-API routing in `App.tsx` to read language from the path.
- Update `useDocumentLanguage` to follow the URL, not the browser.
- Build-time per-locale `index.html` so each language has its own static intro and JSON-LD `inLanguage`.
- One sitemap entry per language with `<xhtml:link rel="alternate" hreflang>` siblings.
- `<link rel="alternate" hreflang>` tags in each rendered HTML.

Worth doing only if Hebrew/Thai search visibility becomes an explicit goal.

---

## P3 — Off-code (out of scope but worth noting)

These don't touch the repo but matter for ranking:
- Mention the project in your GitHub README — provides one organic inbound link.
- Submit to free web-game directories.
- A `/r/webgames` or HN Show post — natural traffic and one decent backlink.

---

## Validation checklist (run after domain change or any major SEO change)

- [ ] [Rich Results Test](https://search.google.com/test/rich-results) — confirms `WebSite`, `VideoGame`, `FAQPage`, `HowTo` parse.
- [ ] [Schema Markup Validator](https://validator.schema.org/) — broader schema check including non-Google AI search engines.
- [ ] [PageSpeed Insights](https://pagespeed.web.dev) — all Core Web Vitals green on mobile and desktop.
- [ ] Sitemap fetch in GSC reads **Success** with 1 URL discovered.
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
