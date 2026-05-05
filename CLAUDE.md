# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vite + React single-page app — `src/App.jsx` (~5,600 lines, single file) — that implements a self-assessment dashboard for the **IFC Performance Standards 2012** (eight standards, 162 indicators). Built as A+CSR Indonesia's client-facing diagnostic instrument.

## Commands

```bash
npm install        # one-time
npm run dev        # Vite dev server, default http://localhost:5173
npm run build      # production bundle to dist/
npm run preview    # serve the built dist/ for a final smoke check
```

There are no tests and no linter. If the user asks for them, scaffold explicitly — don't claim a `npm test` exists.

The bundle is large (~835 kB minified — recharts dominates, with the ESAP curated library adding ~100 kB of strings) and Vite emits a chunk-size warning during `build`. This is expected; it's a self-contained internal tool, not a public-facing site.

## Stack notes

- **Vite 5 + React 18** (`vite.config.js` only registers `@vitejs/plugin-react` and `@tailwindcss/vite`).
- **Tailwind v4** via `@tailwindcss/vite` — config-less mode. The whole stylesheet is `src/index.css` containing only `@import "tailwindcss";`. No `tailwind.config.js`, no `postcss.config.js`.
- **No router**: page navigation is local state in `App` (`page` string switched by `Nav`). Adding routes would require introducing a router — don't assume one exists.
- **Persistence**: synchronous `localStorage` (was previously the Claude artifact `window.storage` API). Three keys: `ifc-ps:metadata`, `ifc-ps:responses`, `ifc-ps:esap`. The load effect runs once on mount and spreads `{ ...DEFAULT_META, ...savedMeta, companyProfile: { ...defaults, ...saved } }` so adding new metadata fields stays backward-compatible. Persist effects are debounced 400 ms for responses/esap, immediate for metadata, and guard with `if (!loaded) return;` to avoid clobbering stored data with the empty initial state before the load completes.

## Architecture

Single default export `App` (~line 5505 of `src/App.jsx`) holds all top-level state and conditionally renders one of seven page components based on `page`:

- `DashboardPage` (~1751) — radar + 8 PS cards + project metadata + Company Profile + JSON export/import + clear/reset (absorbed the old `OverviewPage` and `SetupPage`)
- `AssessmentPage` (~2187) — per-PS indicator scoring, the data-entry surface
- `ScorecardsPage` (~2743) — printable per-PS scorecards
- `ESAPPage` (~3100) — Environmental & Social Action Plan editor
- `GapAnalysisPage` (~3984) — high/medium gap rollups
- `ReportPage` (~4149) — summary report
- `NarrativeReportPage` (~4460) — full prose report

All pages share state via props from `App`; nothing is in context or external store. Pages are independent — changes to one rarely require touching another.

`DEFAULT_META` (~line 5488) declares the metadata shape: top-level fields (`projectName`, `clientName`, `sector`, `location`, `assessorName`, `assessmentDate`) plus a nested `companyProfile` object (`country`, `employeeCount`, `esmsMaturity`, `budgetTier`, `certifications`, `operatingContext`) used by the ESAP AI prompt builder.

### Domain data model

Three constant tables drive everything:

- `PS_META` (~197) — the 8 Performance Standards (PS 1 ESMS through PS 8 Cultural Heritage), each with `code`, `title`, `short`, `abbr`.
- `INDICATORS` (~248) — flat array of every indicator. Each entry: `{ id, ps, section, ref, text, guidance }`. Ids are dotted hierarchical (e.g. `"5.7.13"` = PS 5, sub-area 7, item 13). The array is grouped by PS via `// ========== PS N` comment banners; section headers within a PS are derived from each indicator's `section` field, not from a separate constant.
- `ESAP_LIBRARY` (~439) — curated action templates keyed by `indicator.id`, each entry `{ action, completionIndicators, suggestedResources, suggestedPIC }`. The ESAP generators consult this first; missing ids fall back to the regex heuristic. Author one entry per indicator id when adding new indicators (otherwise the heuristic produces generic "Address gap: …" text).

To add or edit indicators, edit `INDICATORS` in place and add a matching entry in `ESAP_LIBRARY`. To rename or reshape a PS, edit `PS_META`. The numeric counts in the section banners (e.g. "PS 1 — ESMS … (35)") are informational and need to be updated by hand.

### Scoring

`SCORE_LEVELS` (~1433) defines five maturity levels 0–4 (Not Started → Advanced), plus `"NA"` as a sentinel score value. `computePSScore` (~1450) averages numeric scores per PS, ignoring `NA` and unanswered. `computeOverall` (~1467) is an average-of-averages across PSes that have any answered items, plus a completion percentage. `getMaturityLabel` (~1481) maps an average to a label and CSS color class. `priorityGap` (~1489) flags High (≤1) / Medium (=2). Maturity thresholds are `>=3.5 / >=2.5 / >=1.5 / >0` — change them in one place.

### ESAP generation & AI refinement

ESAP item generation lives just above `ESAPPage`:

- `generateActionText` (~2900), `generateCompletionIndicators` (~2920), `generateSuggestedResources` / `generateSuggestedPIC` (~2940) — all consult `ESAP_LIBRARY[indicator.id]` first and fall back to a regex heuristic.
- `buildESAPItemFromGap` (~2955) maps `score ≤1 → High`, `=2 → Medium`, `=3 → Low`, computes target dates (3/6/12 months), pre-populates resources/PIC from the library, and tags each item with `source: "library" | "heuristic"`. After AI refinement the source becomes `"ai-refined"`.
- `buildAIPrompt(item, indicator, meta)` (~2986) assembles a structured prompt — company profile + indicator block + current draft + a JSON response contract — for an external LLM.
- `parseAIResponse(raw)` (~3044) is tolerant to ```` ```json ```` fences, extracts the first `{...}` block when the model adds prose, validates the five required string fields, returns `{ok, fields|error}`.

The ESAP UI (~3100) wires per-row `⌘` (copy prompt) and `⤓` (paste response, opens `AIResponseModal` at ~3856) buttons plus a header batch button that concatenates all High-priority prompts. The flow is copy-paste — there is no in-app API call, no key handling, and no backend dependency.

### Styling

All custom CSS lives in the `STYLE_TAG` template string (~line 23) which is injected into `<head>` once on mount. Editorial palette (ink, parchment, gold, sage, amber, crimson) is defined as CSS variables on `:root`; semantic classes (`text-ink`, `bg-parchment`, `small-caps`, `hairline`, `double-rule`, `score-pill`, `btn-primary`, `btn-ghost`, etc.) are defined here. The codebase **also** uses Tailwind utility classes (`flex`, `gap-8`, `max-w-7xl`, `mt-1`, etc.) — these are picked up by Tailwind v4 via the Vite plugin. Custom and Tailwind classes are applied side-by-side on the same elements; namespaces don't clash because the custom names (ink, parchment, gold, sage, etc.) aren't standard Tailwind colors.

Print/PDF export is `window.print()` (called from Scorecards, ESAP, Report, Narrative pages) plus `@media print` rules inside `STYLE_TAG`. Elements marked `no-print` are hidden when printing.
