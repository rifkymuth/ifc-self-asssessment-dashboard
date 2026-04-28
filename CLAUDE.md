# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vite + React single-page app — `src/App.jsx` (~4,170 lines, single file) — that implements a self-assessment dashboard for the **IFC Performance Standards 2012** (eight standards, ~160+ indicators). Built as A+CSR Indonesia's client-facing diagnostic instrument.

## Commands

```bash
npm install        # one-time
npm run dev        # Vite dev server, default http://localhost:5173
npm run build      # production bundle to dist/
npm run preview    # serve the built dist/ for a final smoke check
```

There are no tests and no linter. If the user asks for them, scaffold explicitly — don't claim a `npm test` exists.

The bundle is large (~730 kB minified, recharts dominates) and Vite emits a chunk-size warning during `build`. This is expected; it's a self-contained internal tool, not a public-facing site.

## Stack notes

- **Vite 5 + React 18** (`vite.config.js` only registers `@vitejs/plugin-react` and `@tailwindcss/vite`).
- **Tailwind v4** via `@tailwindcss/vite` — config-less mode. The whole stylesheet is `src/index.css` containing only `@import "tailwindcss";`. No `tailwind.config.js`, no `postcss.config.js`.
- **No router**: page navigation is local state in `App` (`page` string switched by `Nav`). Adding routes would require introducing a router — don't assume one exists.
- **Persistence**: synchronous `localStorage` (was previously the Claude artifact `window.storage` API). Three keys: `ifc-ps:metadata`, `ifc-ps:responses`, `ifc-ps:esap`. The load effect runs once on mount; persist effects are debounced 400 ms for responses/esap, immediate for metadata. Persist effects guard with `if (!loaded) return;` to avoid clobbering stored data with the empty initial state before the load completes.

## Architecture

Single default export `App` (~line 4056 of `src/App.jsx`) holds all top-level state and conditionally renders one of eight page components based on `page`:

- `OverviewPage` (~735) — radar + 8 PS cards
- `AssessmentPage` (~944) — per-PS indicator scoring, the data-entry surface
- `ScorecardsPage` (~1500) — printable per-PS scorecards
- `ESAPPage` (~1752) — Environmental & Social Action Plan editor
- `GapAnalysisPage` (~2378) — high/medium gap rollups
- `ReportPage` (~2541) — summary report
- `NarrativeReportPage` (~2852) — full prose report
- `SetupPage` (~3880) — metadata + JSON export/import + clear/reset

All pages share state via props from `App`; nothing is in context or external store. Pages are independent — changes to one rarely require touching another.

### Domain data model

Two constant tables drive everything:

- `PS_META` (~196) — the 8 Performance Standards (PS 1 ESMS through PS 8 Cultural Heritage), each with `code`, `title`, `short`, `abbr`.
- `INDICATORS` (~247) — flat array of every indicator. Each entry: `{ id, ps, section, ref, text, guidance }`. Ids are dotted hierarchical (e.g. `"5.7.13"` = PS 5, sub-area 7, item 13). The array is grouped by PS via `// ========== PS N` comment banners; section headers within a PS are derived from each indicator's `section` field, not from a separate constant.

To add or edit indicators, edit `INDICATORS` in place. To rename or reshape a PS, edit `PS_META`. The numeric counts in the section banners (e.g. "PS 1 — ESMS … (35)") are informational and need to be updated by hand.

### Scoring

`SCORE_LEVELS` (~431) defines five maturity levels 0–4 (Not Started → Advanced), plus `"NA"` as a sentinel score value. `computePSScore` (~448) averages numeric scores per PS, ignoring `NA` and unanswered. `computeOverall` (~465) is an average-of-averages across PSes that have any answered items, plus a completion percentage. `getMaturityLabel` (~479) maps an average to a label and CSS color class. `priorityGap` (~487) flags High (≤1) / Medium (=2). Maturity thresholds are `>=3.5 / >=2.5 / >=1.5 / >0` — change them in one place.

### Styling

All custom CSS lives in the `STYLE_TAG` template string (~23) which is injected into `<head>` once on mount. Editorial palette (ink, parchment, gold, sage, amber, crimson) is defined as CSS variables on `:root`; semantic classes (`text-ink`, `bg-parchment`, `small-caps`, `hairline`, `double-rule`, `score-pill`, `btn-primary`, `btn-ghost`, etc.) are defined here. The codebase **also** uses Tailwind utility classes (`flex`, `gap-8`, `max-w-7xl`, `mt-1`, etc.) — these are picked up by Tailwind v4 via the Vite plugin. Custom and Tailwind classes are applied side-by-side on the same elements; namespaces don't clash because the custom names (ink, parchment, gold, sage, etc.) aren't standard Tailwind colors.

Print/PDF export is `window.print()` (called from Scorecards, ESAP, Report, Narrative pages) plus `@media print` rules inside `STYLE_TAG`. Elements marked `no-print` are hidden when printing.
