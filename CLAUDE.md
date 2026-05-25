# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vite + React single-page app that implements a self-assessment dashboard for the **IFC Performance Standards 2012** (eight standards, 162 indicators). Built as A+CSR Indonesia's client-facing diagnostic instrument.

Persistence is backed by a **Flask + MongoDB backend** (in `backend/`). Assessments live on the server under a short shareable **project code**, so multiple users can collaboratively edit the same assessment. The browser talks to the backend over HTTP via `src/lib/api.js`; `localStorage` is no longer the source of truth (it only remembers the last-opened project code).

## Commands

```bash
# Frontend (repo root)
npm install        # one-time
npm run dev        # Vite dev server, default http://localhost:5173
npm run build      # production bundle to dist/
npm run preview    # serve the built dist/ for a final smoke check

# Backend (backend/)
python -m venv venv
./venv/Scripts/python -m pip install -r requirements.txt   # Windows; use venv/bin/python on *nix
cp .env.example .env          # then edit if needed
./venv/Scripts/python app.py  # Flask dev server on http://localhost:5000

# Full stack via Docker (repo root) — needs Docker Desktop running
docker compose up --build     # mongo + backend (:5000) + frontend (:8080)
```

The frontend reads `VITE_API_BASE_URL` (root `.env`, defaults to `http://localhost:5000/api`). The backend reads `MONGO_URI`, `MONGO_DB`, `PORT`, `CORS_ORIGINS` from `backend/.env`. Both `.env` files are gitignored; commit only the `.env.example` templates.

There are no tests and no linter. If the user asks for them, scaffold explicitly — don't claim a `npm test` exists.

The bundle is ~840 kB minified (recharts dominates, with the ESAP curated library adding ~100 kB of strings) and Vite emits a chunk-size warning during `build`. This is expected; it's a self-contained internal tool, not a public-facing site.

## Stack notes

- **Vite 5 + React 18** (`vite.config.js` only registers `@vitejs/plugin-react` and `@tailwindcss/vite`).
- **Tailwind v4** via `@tailwindcss/vite` — config-less mode. The whole stylesheet is `src/index.css` containing only `@import "tailwindcss";`. No `tailwind.config.js`, no `postcss.config.js`.
- **No router**: page navigation is local state in `App` (`page` string switched by `Nav`). Adding routes would require introducing a router — don't assume one exists.
- **Persistence**: HTTP to the Flask backend via `src/lib/api.js`. State (`meta`, `responses`, `esapItems`) is loaded once when a project is opened (create / continue / join), then saved **granularly** as it changes — a per-indicator `PUT` for each response (debounced 400 ms per indicator id), a debounced `PUT` for `meta`, and per-item `POST`/`PUT`/`DELETE` for ESAP items. Local React state is the render source of truth (optimistic updates); a failed request surfaces a dismissible error banner. `localStorage` now holds only one key, `ifc-ps:projectId` (the last-opened code, so **Continue** can reopen it). The legacy `K_META`/`K_RESP`/`K_ESAP` constants still exported from `data/defaults.js` are unused. When loading meta, App still spreads `{ ...DEFAULT_META, ...savedMeta, companyProfile: { ...defaults, ...saved } }` so new metadata fields stay backward-compatible.

## File layout

```
src/
  App.jsx                       # routing + global state + API-backed persistence handlers (~215 lines)
  main.jsx                      # entry
  index.css                     # only `@import "tailwindcss";`
  styles/
    editorialStyles.js          # STYLE_TAG export (injected into <head> once on mount)
  data/
    psMeta.js                   # PS_META — the 8 Performance Standards
    indicators.js               # INDICATORS — 162 indicators
    esapLibrary.js              # ESAP_LIBRARY — curated action templates keyed by indicator.id
    scoreLevels.js              # SCORE_LEVELS — five maturity levels
    defaults.js                 # DEFAULT_META (+ legacy K_META/K_RESP/K_ESAP constants, now unused)
  lib/
    api.js                      # fetch client for the backend (createProject, getProject, putResponse, esap CRUD, …)
    scoring.js                  # computePSScore, computeOverall, getMaturityLabel, priorityGap, narrativeFor
    esap.js                     # ESAP generators, buildAIPrompt, parseAIResponse, priorityStyles, statusStyles, isOverdue, esapThStyle
  components/
    MastheadRule.jsx            # decorative rule used across pages
    Header.jsx                  # masthead + overall maturity strip
    Nav.jsx                     # top tabs (Dashboard / Assessment / Scorecards / Gap / ESAP / Report / Narrative)
  pages/
    PortalPage.jsx              # landing screen — Create New / Continue / Join with Project Code
    DashboardPage.jsx           # radar + 8 PS cards + project metadata + Company Profile + project code + JSON export/import + clear/reset
    AssessmentPage.jsx          # per-PS indicator scoring; data-entry surface
    ScorecardsPage.jsx          # printable per-PS scorecards
    ESAPPage.jsx                # Environmental & Social Action Plan editor + AIResponseModal
    GapAnalysisPage.jsx         # high/medium gap rollups
    ReportPage.jsx              # summary report
    NarrativeReportPage.jsx     # full prose report

backend/                        # Flask + MongoDB API (see "Backend" section)
  app.py                        # create_app(): config, CORS, blueprints, ensure_indexes; module-level `app` for gunicorn
  config.py                     # env via python-dotenv (MONGO_URI, MONGO_DB, PORT, CORS_ORIGINS)
  db.py                         # MongoClient singleton, get_collections(), ensure_indexes(), generate_project_id()
  defaults.py                   # default_meta() — server-side mirror of DEFAULT_META
  routes/
    projects.py                 # POST/GET/DELETE project, exists, PUT meta
    responses.py                # per-indicator response upsert/delete + bulk replace
    esap.py                     # esap item create/bulk/update/delete/clear
  requirements.txt
  Dockerfile                    # gunicorn image for the backend
  .env / .env.example

Dockerfile                      # frontend (nginx) image — builds dist/ and serves it
docker-compose.yml              # mongo + backend + frontend, health-gated startup
```

PascalCase for component/page files; camelCase for `data/`, `lib/`, `styles/` modules. No barrel files — each page imports only what it consumes. The backend uses snake_case Python modules.

## Architecture

`src/App.jsx` is a thin shell. It owns all top-level state (`page`, `activePS`, `meta`, `responses`, `esapItems`, `projectId`, `lastProjectId`, `apiError`), injects the style tag on mount, and conditionally renders one of eight page components based on `page`. Instead of localStorage save effects it exposes API-backed handlers that update local state optimistically and persist to the backend: `updateMeta`, `updateResponse(indicatorId, payload)`, `replaceResponses(obj)` (import), an `esapApi` object (`create`/`bulkCreate`/`update`/`remove`/`clear`), plus `createNew`/`continueLast`/`joinProject` for the portal and `clearAll` (deletes the project on the server and returns to the portal).

Pages share state via props from `App`; nothing is in context or external store. Pages are independent — changes to one rarely require touching another. Each page imports only the data and helpers it needs from `data/*` and `lib/*`. Pages call App's handlers, not raw setters: `AssessmentPage` takes `onResponseChange`; `ESAPPage` takes `esapApi` (and `setEsapItems` for local state); `DashboardPage` receives `setMeta`/`setResponses` that are actually the persisting `updateMeta`/`replaceResponses`.

### Routing & portal

Initial `page` is `"portal"`. The portal is the landing screen and **both Header and Nav are hidden** while on it. From portal:

- **Create New Assessment** → `POST /projects`, opens the returned (empty) project, remembers its code, then `setPage("dashboard")`.
- **Continue Assessment** → `GET /projects/<lastProjectId>` and opens it. Disabled when `hasSavedData` is false.
- **Join with Project Code** → user types a code; `GET /projects/<code>` opens it (inline error if not found). This is the collaborative entry point — two people with the same code edit the same server-side assessment.

`hasSavedData = !!lastProjectId` (the last-opened code, read from `localStorage["ifc-ps:projectId"]`). The new project code is shown on the Dashboard (with a copy button) so it can be shared.

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
- `parseAIResponse(raw)` is tolerant to ` ```json ` fences, extracts the first `{...}` block when the model adds prose, validates the five required string fields, returns `{ok, fields|error}`.
- `priorityStyles`, `statusStyles`, `isOverdue`, `esapThStyle` — shared styling and helpers for the ESAP table.

The ESAP UI in `pages/ESAPPage.jsx` wires per-row `⌘` (copy prompt) and `⤓` (paste response, opens the co-located `AIResponseModal`) buttons plus a header batch button that concatenates all High-priority prompts. The **AI refinement** flow is copy-paste — no in-app LLM call, no key handling. (ESAP *items themselves* do persist: each add/edit/delete is written to the MongoDB backend via the `esapApi` handlers from `App`, separate from the AI flow.)

### Styling

All custom CSS lives in the `STYLE_TAG` template string exported from `src/styles/editorialStyles.js`. App.jsx injects it into `<head>` once on mount via `document.createElement("style")`. Editorial palette (ink, parchment, gold, sage, amber, crimson) is defined as CSS variables on `:root`; semantic classes (`text-ink`, `bg-parchment`, `small-caps`, `hairline`, `double-rule`, `score-pill`, `btn-primary`, `btn-ghost`, etc.) are defined here. The codebase **also** uses Tailwind utility classes (`flex`, `gap-8`, `max-w-7xl`, `mt-1`, etc.) — these are picked up by Tailwind v4 via the Vite plugin. Custom and Tailwind classes are applied side-by-side on the same elements; namespaces don't clash because the custom names (ink, parchment, gold, sage, etc.) aren't standard Tailwind colors.

Print/PDF export is `window.print()` (called from Scorecards, ESAP, Report, Narrative pages) plus `@media print` rules inside `STYLE_TAG`. Elements marked `no-print` are hidden when printing.

## Backend (Flask + MongoDB)

Lives in `backend/`. A Flask app-factory (`create_app()` in `app.py`) with `flask-cors`, three blueprints, and a `pymongo` client. `app = create_app()` is exposed at module level so `gunicorn app:app` works in the container. `create_app()` calls `ensure_indexes()` at startup, so **MongoDB must be reachable when the backend boots** (Docker compose health-gates this).

### Data model — granular, one document per thing

Database `ifc_ps`, three collections (chosen over a single blob-per-project so concurrent collaborators editing *different* cells/items never clobber each other):

- **`projects`** — `{ _id: <project code>, createdAt, updatedAt, meta: {…} }`. `meta` is embedded (1:1 with the project, mirrors `DEFAULT_META`). `_id` is the human-shareable code generated by `generate_project_id()` (8 chars from an unambiguous alphabet, no 0/O/1/I; retries on collision).
- **`responses`** — one doc per cell: `{ projectId, indicatorId, score, notes, evidence, updatedAt }`. Unique compound index `(projectId, indicatorId)`; a `PUT` upserts a single cell. `score` may be a number, the string `"NA"`, or `null` (notes-only). On read the docs are reassembled into the `{ [indicatorId]: {score, notes, evidence} }` object the frontend expects.
- **`esapItems`** — one doc per action item, `_id` = the frontend-generated `id` (e.g. `esap-1.1.1-<ts>`); other fields match the ESAP item shape. Index on `projectId`.

### Endpoints (all under `/api`)

`POST /projects`, `GET|DELETE /projects/<pid>`, `GET /projects/<pid>/exists`, `PUT /projects/<pid>/meta`; `GET|PUT /projects/<pid>/responses` (bulk replace), `PUT|DELETE /projects/<pid>/responses/<indicatorId>`; `GET|POST|DELETE /projects/<pid>/esap`, `POST /projects/<pid>/esap/bulk`, `PUT|DELETE /projects/<pid>/esap/<itemId>`. Unknown project → 404 (JSON `{error}`); malformed body → 400. Each endpoint maps to exactly one frontend operation (see `src/lib/api.js`).

### Scope & conventions

- **No auth / no user model.** Collaboration is "anyone with the project code can edit." The schema reserves `updatedAt` and could grow an `updatedBy` later.
- **Reference data stays in the frontend.** `PS_META`, `INDICATORS`, `ESAP_LIBRARY`, `SCORE_LEVELS` are static and are *not* stored in Mongo — the backend only holds per-project user data.
- To add an endpoint: put the route on the matching blueprint, add a thin wrapper in `src/lib/api.js`, and call it from an `App.jsx` handler (keep local state optimistic).
- The backend stores whatever fields the frontend sends for a response/ESAP item; it does not re-validate the domain shape beyond "is it a JSON object/array."

### Docker

`docker compose up --build` (repo root) starts `mongo` (with a `mongosh` healthcheck + named volume), `backend` (built from `backend/Dockerfile`, gunicorn, waits for `mongo` healthy, published on `:5000`), and `frontend` (the root nginx `Dockerfile`, on `:8080`). The frontend image bakes the default `VITE_API_BASE_URL` (`http://localhost:5000/api`); since the browser runs on the host, it reaches the published backend port. `backend/.dockerignore` keeps `venv`/`.env` out of the image; the root `.dockerignore` excludes `backend` from the frontend build context.
