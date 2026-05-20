# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vite + React single-page app that implements a self-assessment dashboard for the **IFC Performance Standards 2012** (eight standards, 162 indicators). Built as A+CSR Indonesia's client-facing diagnostic instrument.

## Commands

```bash
npm install        # one-time
npm run dev        # Vite dev server, default http://localhost:5173
npm run build      # production bundle to dist/
npm run preview    # serve the built dist/ for a final smoke check
```

There are no tests and no linter. If the user asks for them, scaffold explicitly — don't claim a `npm test` exists.

The bundle is ~840 kB minified (recharts dominates, with the ESAP curated library adding ~100 kB of strings) and Vite emits a chunk-size warning during `build`. This is expected; it's a self-contained internal tool, not a public-facing site.

## Stack notes

- **Vite 5 + React 18** (`vite.config.js` only registers `@vitejs/plugin-react` and `@tailwindcss/vite`).
- **Tailwind v4** via `@tailwindcss/vite` — config-less mode. The whole stylesheet is `src/index.css` containing only `@import "tailwindcss";`. No `tailwind.config.js`, no `postcss.config.js`.
- **No router**: page navigation is local state in `App` (`page` string switched by `Nav`). Adding routes would require introducing a router — don't assume one exists.
- **Persistence**: synchronous `localStorage`. Three keys: `ifc-ps:metadata`, `ifc-ps:responses`, `ifc-ps:esap`. The load effect runs once on mount and spreads `{ ...DEFAULT_META, ...savedMeta, companyProfile: { ...defaults, ...saved } }` so adding new metadata fields stays backward-compatible. Persist effects are debounced 400 ms for responses/esap, immediate for metadata, and guard with `if (!loaded) return;` to avoid clobbering stored data with the empty initial state before the load completes.

## File layout

```
src/
  App.jsx                       # routing + global state + persistence (~140 lines)
  main.jsx                      # entry
  index.css                     # only `@import "tailwindcss";`
  styles/
    editorialStyles.js          # STYLE_TAG export (injected into <head> once on mount)
  data/
    psMeta.js                   # PS_META — the 8 Performance Standards
    indicators.js               # INDICATORS — 162 indicators
    esapLibrary.js              # ESAP_LIBRARY — curated action templates keyed by indicator.id
    scoreLevels.js              # SCORE_LEVELS — five maturity levels
    defaults.js                 # DEFAULT_META + localStorage keys (K_META, K_RESP, K_ESAP)
  lib/
    scoring.js                  # computePSScore, computeOverall, getMaturityLabel, priorityGap, narrativeFor
    esap.js                     # ESAP generators, buildAIPrompt, parseAIResponse, priorityStyles, statusStyles, isOverdue, esapThStyle
  components/
    MastheadRule.jsx            # decorative rule used across pages
    Header.jsx                  # masthead + overall maturity strip
    Nav.jsx                     # top tabs (Dashboard / Assessment / Scorecards / Gap / ESAP / Report / Narrative)
  pages/
    PortalPage.jsx              # landing screen — Create New / Continue
    DashboardPage.jsx           # radar + 8 PS cards + project metadata + Company Profile + JSON export/import + clear/reset
    AssessmentPage.jsx          # per-PS indicator scoring; data-entry surface
    ScorecardsPage.jsx          # printable per-PS scorecards
    ESAPPage.jsx                # Environmental & Social Action Plan editor + AIResponseModal
    GapAnalysisPage.jsx         # high/medium gap rollups
    ReportPage.jsx              # summary report
    NarrativeReportPage.jsx     # full prose report
```

PascalCase for component/page files; camelCase for `data/`, `lib/`, `styles/` modules. No barrel files — each page imports only what it consumes.

## Architecture

`src/App.jsx` is a thin shell. It owns all top-level state (`page`, `activePS`, `meta`, `responses`, `esapItems`, `loaded`), runs the three persistence effects (style injection, load-on-mount, debounced save per key), exposes a `clearAll` callback, and conditionally renders one of eight page components based on `page`.

Pages share state via props from `App`; nothing is in context or external store. Pages are independent — changes to one rarely require touching another. Each page imports only the data and helpers it needs from `data/*` and `lib/*`.

### Routing & portal

Initial `page` is `"portal"`. The portal is the landing screen and **both Header and Nav are hidden** while on it. From portal:

- **Create New Assessment** → calls `clearAll()` (wipes the three localStorage keys) then `setPage("dashboard")`.
- **Continue Assessment** → `setPage("dashboard")` without clearing. The button is disabled when `hasSavedData` is false.

`hasSavedData = loaded && (Object.keys(responses).length > 0 || esapItems.length > 0 || meta.projectName)`. It must be evaluated after the load effect (`loaded` flag).

The portal is intentionally simple — it will later evolve to also offer "Join Collaboratively Using Link" once a backend replaces localStorage.

### Domain data model

Three constant tables in `src/data/` drive everything:

- `PS_META` — the 8 Performance Standards (PS 1 ESMS through PS 8 Cultural Heritage), each with `code`, `title`, `short`, `abbr`.
- `INDICATORS` — flat array of every indicator. Each entry: `{ id, ps, section, ref, text, guidance }`. Ids are dotted hierarchical (e.g. `"5.7.13"` = PS 5, sub-area 7, item 13). The array is grouped by PS via `// ========== PS N` comment banners; section headers within a PS are derived from each indicator's `section` field, not from a separate constant.
- `ESAP_LIBRARY` — curated action templates keyed by `indicator.id`, each entry `{ action, completionIndicators, suggestedResources, suggestedPIC }`. The ESAP generators consult this first; missing ids fall back to a regex heuristic. Author one entry per indicator id when adding new indicators (otherwise the heuristic produces generic "Address gap: …" text).

`DEFAULT_META` (in `src/data/defaults.js`) declares the metadata shape: top-level fields (`projectName`, `clientName`, `sector`, `location`, `assessorName`, `assessmentDate`) plus a nested `companyProfile` object (`country`, `employeeCount`, `esmsMaturity`, `budgetTier`, `certifications`, `operatingContext`) used by the ESAP AI prompt builder.

To add or edit indicators, edit `INDICATORS` in place and add a matching entry in `ESAP_LIBRARY`. To rename or reshape a PS, edit `PS_META`. The numeric counts in the section banners (e.g. "PS 1 — ESMS … (35)") are informational and need to be updated by hand.

### Scoring (`src/lib/scoring.js`)

`SCORE_LEVELS` (in `data/scoreLevels.js`) defines five maturity levels 0–4 (Not Started → Advanced), plus `"NA"` as a sentinel score value. `computePSScore` averages numeric scores per PS, ignoring `NA` and unanswered. `computeOverall` is an average-of-averages across PSes that have any answered items, plus a completion percentage. `getMaturityLabel` maps an average to a label and CSS color class. `priorityGap` flags High (≤1) / Medium (=2). Maturity thresholds are `>=3.5 / >=2.5 / >=1.5 / >0` — change them in one place. `narrativeFor` returns the verdict + prose used by Scorecards and the Narrative Report.

### ESAP generation & AI refinement (`src/lib/esap.js`)

All ESAP helpers live here:

- `generateActionText`, `generateCompletionIndicators`, `generateSuggestedResources`, `generateSuggestedPIC` — consult `ESAP_LIBRARY[indicator.id]` first and fall back to a regex heuristic.
- `buildESAPItemFromGap` maps `score ≤1 → High`, `=2 → Medium`, `=3 → Low`, computes target dates (3/6/12 months via `calcTargetDate`), pre-populates resources/PIC from the library, and tags each item with `source: "library" | "heuristic"`. After AI refinement the source becomes `"ai-refined"`. Imported by both `DashboardPage` (for gap pre-population) and `ESAPPage`.
- `buildAIPrompt(item, indicator, meta)` assembles a structured prompt — company profile + indicator block + current draft + a JSON response contract — for an external LLM.
- `parseAIResponse(raw)` is tolerant to ```` ```json ```` fences, extracts the first `{...}` block when the model adds prose, validates the five required string fields, returns `{ok, fields|error}`.
- `priorityStyles`, `statusStyles`, `isOverdue`, `esapThStyle` — shared styling and helpers for the ESAP table.

The ESAP UI in `pages/ESAPPage.jsx` wires per-row `⌘` (copy prompt) and `⤓` (paste response, opens the co-located `AIResponseModal`) buttons plus a header batch button that concatenates all High-priority prompts. The flow is copy-paste — there is no in-app API call, no key handling, and no backend dependency.

### Styling

All custom CSS lives in the `STYLE_TAG` template string exported from `src/styles/editorialStyles.js`. App.jsx injects it into `<head>` once on mount via `document.createElement("style")`. Editorial palette (ink, parchment, gold, sage, amber, crimson) is defined as CSS variables on `:root`; semantic classes (`text-ink`, `bg-parchment`, `small-caps`, `hairline`, `double-rule`, `score-pill`, `btn-primary`, `btn-ghost`, etc.) are defined here. The codebase **also** uses Tailwind utility classes (`flex`, `gap-8`, `max-w-7xl`, `mt-1`, etc.) — these are picked up by Tailwind v4 via the Vite plugin. Custom and Tailwind classes are applied side-by-side on the same elements; namespaces don't clash because the custom names (ink, parchment, gold, sage, etc.) aren't standard Tailwind colors.

Print/PDF export is `window.print()` (called from Scorecards, ESAP, Report, Narrative pages) plus `@media print` rules inside `STYLE_TAG`. Elements marked `no-print` are hidden when printing.
