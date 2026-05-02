# Standstill — Project Status

> Auto-generated from SerVet Skill MCP | Last updated: 2026-05-02 02:08:11 UTC

## Overview

| | |
|---|---|
| **Status** | active |
| **Progress** | 30% (11/37 points) |
| **Stories** | 3 done, 0 in progress, 2 planned, 2 blocked |
| **Epics** | 5 |
| **Sprints** | 2 |

## Problem
Enterprises run on a hidden layer of work that never went through procurement: spreadsheets that became load-bearing, email chains that became processes, and workflows that exist only because one person remembers how they work. There is no map of which spreadsheets are critical, which email-chain processes have single points of failure, or which institutional knowledge will leak the day a key contributor resigns. Audit, business continuity, and Chief of Staff functions try to surface this manually and consistently fail because the unit of the problem is too small to justify a project and there are too many of them.

## Vision
A continuous, read-only audit of the shadow workflow layer. Standstill connects to a company's working surfaces — email, file shares, calendar, collaboration tools — indexes activity patterns, and produces a ranked map of load-bearing spreadsheets, email-chain processes, and single-point-of-failure (SPOF) workflows. Each finding has a score, an owner, a recommended action, and a trend over time. The output is a quarterly executive report and a live dashboard that converts shadow risk into an institutional ledger.

## Sprint Board

### Sprint 1: Ship a working v1: scaffold + auth + workflow capture + scorer + findings list. By end of sprint, a Chief of Staff can sign in, capture 5 workflows, see them scored and ranked. (planning)
11/21 points | 2026-05-04 → 2026-05-15

### Sprint 2: Polish + persistence: edit workflows, PDF export, file upload for evidence (CSV first), per-org weight tuning. Builds on a working v1. (planning)
0/16 points | 2026-05-18 → 2026-05-29

### Done ✅

| Story | Title | Points | Assignee | Completed |
|-------|-------|--------|----------|-----------|
| ST-002 | Schema: workflows, scores, audit_reports — multi-tenant-ready columns from day one | 3 | Claude Code | 2026-05-01 |
| ST-003 | Workflow capture form (single-page, save to workflows table) | 5 | Claude Code | 2026-05-01 |
| ST-004 | Heuristic scorer v1 with explainable breakdown | 3 | Claude Code | 2026-05-01 |

### In Progress 🔄

| Story | Title | Points | Assignee | Started |
|-------|-------|--------|----------|---------|

### Planned 📋

| Story | Title | Points | Priority | Epic |
|-------|-------|--------|----------|------|
| ST-008 | PDF export of audit reports | 3 | medium | ST-E5 |
| ST-010 | Score weight tuning per deployment | 5 | low | ST-E4 |

### Blocked 🚫

| Story | Title | Reason |
|-------|-------|--------|
| ST-007 | Workflow editing + delete |  |
| ST-009 | CSV upload — capture multiple workflows at once |  |

## Epics

### ST-E1: Foundation (1/2 stories done)
React + Supabase scaffold. Auth (email/password). Single-tenant schema with multi-tenant-ready columns. Dashboard shell with sidebar nav.

### ST-E2: Workflow Capture (1/3 stories done)
Guided self-audit form. Multi-step capture of shadow workflows (name, owner, frequency, breadth, criticality, SPOF risk). Edit + delete + list.

### ST-E3: Heuristic Scoring Engine (1/1 stories done)
Transparent, explainable scoring. Each finding gets a 0–100 score with a published breakdown by named input. Score history persisted per workflow so trends are queryable.

### ST-E4: Findings Dashboard (0/2 stories done)
Top-N ranked workflows. Sort, filter, drill into score breakdown. Recommended action per finding. Sober, audit-grade UI — no gamification.

### ST-E5: Audit Report Generation (0/2 stories done)
Claude-assisted Markdown report from scored findings. Render in browser, copy/share. PDF export deferred to v0.2.

## Intentions

| Type | Statement | Priority | Category |
|------|-----------|----------|----------|
| goal | Surface the shadow workflow layer of an enterprise within 30 days of deployment | must | strategy |
| principle | Read-only at the source, always | must | security |
| principle | Metadata-first, content opt-in | must | security |
| principle | Frame findings as knowledge concentration, never as personal risk | must | ux |
| principle | Every score is explainable | must | quality |
| constraint | No data egress beyond the customer perimeter | must | compliance |
| anti_pattern | Do not name individuals in any default view | must | ux |
| quality_bar | False-positive rate on load-bearing flags below 20% by end of pilot | should | quality |
| user_promise | A pilot is operable by the customer's platform team in under two days | should | timeline |
| constraint | Schema designed multi-tenant-ready, single-tenant deployment in v1 | should | architecture |
| goal | Ship v1 as a working self-audit dashboard within Sprint 1 | must | strategy |

## Decision Log

| Date | Decision | Rationale | By |
|------|----------|-----------|-----|
| 2026-05-01 | Built ST-004: Heuristic scorer v1 with explainable breakdown | Files: supabase/functions/ss-score/index.ts, supabase/functions/ss-score/deno.json, supabase/functions/_shared/cors.ts, lib/scoring.ts, supabase/functions/import_map.json | claude_code |
| 2026-05-01 | Built ST-003: Workflow capture form (single-page, save to workflows table) | Files: src/lib/scoring.ts, src/components/ScoreBreakdown.tsx, src/pages/Capture.tsx | claude_code |
| 2026-05-01 | Built ST-002: Schema: workflows, scores, audit_reports — multi-tenant-ready columns from day one | Files: supabase/migrations/20260501000000_initial_schema.sql, src/lib/types.ts | claude_code |
| 2026-05-01 | Built ST-001: Project scaffold + Supabase auth + dashboard shell | Files: package.json, tsconfig.json, tsconfig.node.json, vite.config.ts, tailwind.config.js, postcss.config.js, index.html, .env.example, .gitignore, README.md, src/main.tsx, src/App.tsx, src/index.css, src/lib/supabase.ts, src/components/ui.tsx, src/components/AuthGuard.tsx, src/components/Layout.tsx, src/pages/Login.tsx | claude_code |

## Build History

| Story | Status | Summary | Date |
|-------|--------|---------|------|
| ST-009 | failed |  | 2026-05-01T23:35 |
| ST-007 | failed |  | 2026-05-01T23:35 |
| ST-004 | success | Built 5 files | 2026-05-01T23:34 |
| ST-003 | success | Built 3 files | 2026-05-01T23:31 |
| ST-002 | success | Built 2 files | 2026-05-01T23:28 |
| ST-001 | success | Built 18 files | 2026-05-01T22:59 |
| SS-001 | failed |  | 2026-05-01T21:36 |

## Story Details

### ST-001: Project scaffold + Supabase auth + dashboard shell
- **Status:** review | **Points:** 5 | **Priority:** critical | **Epic:** ST-E1
- **Description:** # ST-001: Project scaffold + auth + dashboard shell

## Goal
Stand up the React + Vite + Tailwind app with Supabase email/password auth and the navigation shell every other story will live inside.

## Files this story creates

**Config (root)**
- `package.json` — React 18, TS, Vite, Tailwind, react-router-dom, supabase-js, lucide-react, react-markdown, @tailwindcss/typography
- `tsconfig.json`, `tsconfig.node.json`
- `vite.config.ts` — port 5173, host: true (so StackBlitz can preview)
- `tailwind.config.js` — design tokens defined in design_systems row (Slate palette, Inter+IBM Plex Mono, neumorphism shadows)
- `postcss.config.js`
- `index.html` — loads Inter + IBM Plex Mono from Google Fonts
- `.env.example` — VITE_SUPABASE_URL hardcoded to https://rynpbrojfbvullbqsbji.supabase.co, VITE_SUPABASE_ANON_KEY blank
- `.gitignore`
- `README.md`

**Source**
- `src/main.tsx` — React 18 createRoot, BrowserRouter, StrictMode
- `src/App.tsx` — Routes: /login (public), everything else inside <AuthGuard><Layout>
- `src/index.css` — Tailwind base + custom .neu-card, .neu-sunken, .kicker classes
- `src/lib/supabase.ts` — exports `supabase`, `SUPABASE_URL`, `FUNCTIONS_URL`. Reads VITE_SUPABASE_URL/ANON_KEY from env. Falls back to hardcoded URL.
- `src/components/ui.tsx` — Button (primary/secondary/ghost), Input, Textarea, Select, Label (with hint prop), Card, Badge (default/low/med/high/accent tones), Spinner
- `src/components/AuthGuard.tsx` — wraps children, redirects to /login if no session, listens to onAuthStateChange
- `src/components/Layout.tsx` — sidebar (STANDSTILL wordmark with accent dot, "v1 · self-audit" kicker, nav: Capture/Findings/Reports, sign-out button), main content area
- `src/pages/Login.tsx` — email + password form with sign-in / sign-up toggle, error state, navigates to /findings on success

## Cross-cutting conventions (applies to all stories)
- All Tailwind utilities use the Slate token names: `bg-surface`, `bg-elev`, `bg-sunken`, `text-ink`, `text-muted`, `text-dim`, `border-border`, `bg-accent`, `text-risk-low/med/high`
- All forms use `<Label htmlFor>` + `<Input id>` paired
- Errors render as `<div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg">{error}</div>`
- Empty states render inside a `<Card className="text-center py-12">`
- All async actions show a Spinner while pending and disable the trigger

## Dependencies
None — this is the foundation.

## Validation
1. `npm install && npm run dev` starts cleanly on port 5173
2. Visiting `/` redirects to `/login` (no session)
3. Sign-up with email + ≥6-char password lands on `/findings`
4. Sign-out returns to `/login`
5. Sidebar links highlight when active
6. `npm run build` succeeds without TS errors
- **Acceptance Criteria:** - App boots clean on `npm run dev`
- Sign up + sign in + sign out all work end-to-end against the live Supabase project
- All routes other than /login require auth (AuthGuard redirects)
- Sidebar nav is present, with active state styling
- `npm run build` passes type-check
- Slate / Neumorphism aesthetic visibly applied (dark surface, accent dot, mono kickers)

### ST-002: Schema: workflows, scores, audit_reports — multi-tenant-ready columns from day one
- **Status:** done | **Points:** 3 | **Priority:** critical | **Epic:** ST-E1
- **Description:** # ST-002: Schema (already applied) + TypeScript types

## Goal
Document the schema as a versioned migration in the repo, and provide TypeScript types that match every table the frontend reads.

## Files this story creates

**Schema (committed copy of what's already live in the DB)**
- `supabase/migrations/20260501000000_initial_schema.sql`

The schema is already applied in the live Supabase project. This file is a documentation copy so the repo is self-describing. Live tables:

| Table | Purpose | Key columns |
|---|---|---|
| `ss_tenants` | singleton tenant per user | id, owner_user_id, name |
| `ss_workflows` | captured shadow workflows | name, owner_name, frequency, breadth (int>=1), criticality (1-5), spof_risk (bool), spof_rationale, notes, user_id (FK auth.users), tenant_id |
| `ss_score_runs` | scoring job runs | ran_at, ran_by, user_id, tenant_id |
| `ss_workflow_scores` | scored findings | workflow_id, run_id, score (numeric 0-100), score_breakdown (jsonb), user_id, tenant_id |
| `ss_audit_reports` | generated reports | content_md, workflow_count, claude_input_summary, claude_model, user_id, tenant_id |

All tables have RLS enabled. Policies: `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE.

**Types**
- `src/lib/types.ts` exports:
  - `Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly'`
  - `Workflow` (all ss_workflows columns)
  - `ScoreBreakdown` — `{ frequency, breadth, criticality, spof_risk }`, each `{ input, weight, contribution }`
  - `WorkflowScore` — `{ id, workflow_id, run_id, score, score_breakdown, scored_at }`
  - `AuditReport` — `{ id, generated_at, content_md, workflow_count, claude_model }`

## Dependencies
None for the migration file (already applied). Types depend on nothing.

## Validation
1. The migration file in the repo matches what's live: query `information_schema.columns` for each ss_* table and compare
2. `tsc --noEmit` produces zero errors importing types from `lib/types`
- **Acceptance Criteria:** - Migration file exists at supabase/migrations/20260501000000_initial_schema.sql with the exact applied DDL
- src/lib/types.ts exports all listed types, no `any` types
- All other story files compile against these types without casting

### ST-003: Workflow capture form (single-page, save to workflows table)
- **Status:** done | **Points:** 5 | **Priority:** high | **Epic:** ST-E2
- **Description:** # ST-003: Workflow capture form

## Goal
A multi-field form that captures everything ss-score needs to rank a workflow. Live score preview updates as the user types.

## Files this story creates

- `src/lib/scoring.ts` — exports `scoreWorkflowClient({frequency, breadth, criticality, spof_risk})` that returns `{score, breakdown}`. **Must be a byte-for-byte mirror of the ss-score edge function logic** so live preview matches what the server stores.

  ```ts
  freqMap = {daily:30, weekly:21, monthly:12, quarterly:3}
  freqContrib = freqMap[w.frequency]
  breadthContrib = min(25, log(max(1,breadth)+1) * 8)
  critContrib = criticality * 4
  spofContrib = spof_risk ? 25 : 0
  score = round((freq+breadth+crit+spof)*100)/100  // 0-100
  ```

- `src/components/ScoreBreakdown.tsx` — visualizes a `ScoreBreakdown` as 4 progress-bar rows (frequency, breadth, criticality, spof_risk), each showing input value, contribution, weight. Total at bottom.

- `src/pages/Capture.tsx` — two-column layout. Left: form. Right: live `<ScoreBreakdown>` updating with each keystroke.

  Form fields:
  - **Workflow name** (text, required) — placeholder "Q4 close reconciliation tracker"
  - **Primary owner role** (text, required) — placeholder "FP&A senior analyst". Hint: "Refer to role, not the individual."
  - **Frequency** (select) — daily/weekly/monthly/quarterly
  - **Breadth** (number, min 1, max 50, default 1) — hint: "How many teams depend on it"
  - **Criticality** (range slider 1-5, default 3) — hint: "1 = nice to have · 5 = revenue-critical"
  - **SPOF risk** (checkbox + conditional textarea for rationale)
  - **Notes** (textarea, optional)

  On submit:
  1. INSERT into ss_workflows via supabase-js
  2. POST to `${FUNCTIONS_URL}/ss-score` with `{workflow_id}` and Bearer access_token
  3. Navigate to `/findings`

## Dependencies
- ST-001 (shell, ui primitives, supabase client)
- ST-002 (Frequency type)
- ST-004 (ss-score edge function — already deployed live, story documents it)

## Validation
1. Capture a workflow → row appears in ss_workflows with correct values
2. Live preview score matches what ss-score stores in ss_workflow_scores
3. Form rejects empty name and owner_name
4. Cancel button returns to /findings without saving
5. Spinner shows on submit, disables until done
- **Acceptance Criteria:** - A user can capture 5 workflows in 5 minutes
- Each captured workflow lands as a row in ss_workflows with correct field values
- The live score preview matches the server-stored ss_workflow_scores.score (deterministic mirror)
- Validation blocks empty name and owner role
- ss-score is called after insert and the new row gets a score within 5 seconds
- After successful save, user lands on /findings

### ST-004: Heuristic scorer v1 with explainable breakdown
- **Status:** done | **Points:** 3 | **Priority:** high | **Epic:** ST-E3
- **Description:** # ST-004: ss-score edge function (already deployed)

## Goal
Document the live ss-score function in the repo so the codebase is self-describing.

## Files this story creates

- `supabase/functions/ss-score/index.ts` — exact source of the deployed ss-score function (already running on Supabase project rynpbrojfbvullbqsbji, verify_jwt: true)
- `supabase/functions/ss-score/deno.json`

## Function contract

**Endpoint**: `POST ${SUPABASE_URL}/functions/v1/ss-score`
**Auth**: Bearer access_token (JWT-verified)
**Request body**:
```json
{ "workflow_id": "<uuid>" }
```
or
```json
{ "score_all": true }
```

**Response**:
```json
{
  "scored": <int>,
  "run_id": "<uuid>",
  "results": [{ "workflow_id": "<uuid>", "score": <number> }]
}
```

**Behavior**:
1. Resolve user from JWT (auth.getUser via anon-key client with Authorization header)
2. Fetch the user's ss_workflows (filtered by workflow_id if provided)
3. INSERT a row in ss_score_runs (user_id = auth user, ran_by = 'manual')
4. For each workflow, compute score using the heuristic (must match `lib/scoring.ts` byte-for-byte)
5. INSERT one row per workflow into ss_workflow_scores with run_id and score_breakdown jsonb
6. Return the run_id and per-workflow scores

**Heuristic** (must match client-side `lib/scoring.ts`):
- Frequency: daily=30, weekly=21, monthly=12, quarterly=3 (max 30)
- Breadth: min(25, log(max(1,breadth)+1) * 8)
- Criticality: criticality * 4 (max 20)
- SPOF risk: spof_risk ? 25 : 0
- Total: 0-100, rounded to 2 decimals

## Dependencies
- ST-002 (schema for ss_workflows, ss_score_runs, ss_workflow_scores)

## Validation
1. POST with a valid workflow_id and JWT → 200, returns run_id, ss_workflow_scores has new row
2. POST with another user's workflow_id → 0 scored (RLS filters it out)
3. POST without auth → 401
4. Re-running for the same workflow produces an identical score (deterministic)
5. Live function source matches the file in the repo (sync check via Supabase MCP get_edge_function)
- **Acceptance Criteria:** - supabase/functions/ss-score/index.ts in the repo matches the deployed function exactly
- POST to the function with a workflow_id returns the expected score
- Repeated calls produce identical scores (deterministic)
- Output matches client-side scoring.ts within floating-point tolerance
- RLS prevents cross-user access

### ST-005: Findings dashboard — ranked list with score breakdown
- **Status:** review | **Points:** 3 | **Priority:** high | **Epic:** ST-E4
- **Description:** # ST-005: Findings dashboard + drill-down

## Goal
Show all captured workflows ranked by current score, drill into any one for the full score breakdown and a recommended action.

## Files this story creates

- `src/pages/Findings.tsx` — table view sorted by latest score desc
- `src/pages/FindingDetail.tsx` — drill-down for a single workflow

### Findings.tsx

**Data fetching**:
1. SELECT * FROM ss_workflows ORDER BY created_at DESC (RLS filters by user)
2. SELECT * FROM ss_workflow_scores ORDER BY scored_at DESC
3. Reduce: keep only the most recent score per workflow_id
4. Sort workflows by latest score desc
5. For each: compute "primary risk driver" = the breakdown key with the highest contribution

**UI**:
- Header: "Workflow risk ledger" + count + "Capture workflow" button (Plus icon)
- Empty state: centered Card with "Get started" CTA → `/capture`
- Otherwise: table inside a Card with columns:
  - **Workflow** (link to `/findings/:id`, AlertTriangle icon next to name if `spof_risk`)
  - **Owner** (muted text)
  - **Driver** (mono text — the breakdown key)
  - **Score** (Badge with tone: high if >=70, med if >=40, low otherwise)
  - **Details →** (link)

### FindingDetail.tsx

**Data fetching**:
1. SELECT * FROM ss_workflows WHERE id = :id
2. SELECT * FROM ss_workflow_scores WHERE workflow_id = :id ORDER BY scored_at DESC LIMIT 1

**UI**:
- Back link to /findings (ArrowLeft)
- Header: workflow name + SPOF badge if applicable
- 3 stat Cards: Score, Frequency, Criticality (large numerals)
- ScoreBreakdown component (full breakdown of latest score)
- Recommended action Card. Logic:
  - if spof_risk: "Identify a backup operator and document the workflow."
  - else if criticality >= 4: "Document the workflow and confirm the owner has cover."
  - else: "Monitor; consider documenting if criticality grows."
- If spof_rationale present: show it in its own Card with kicker "— SPOF RATIONALE"
- If notes present: show them with kicker "— NOTES"

## Dependencies
- ST-001 (shell, ui primitives, ScoreBreakdown component already exists from ST-003)
- ST-002 (types)
- ST-003 (workflows exist to display)
- ST-004 (scores exist to display)

## Validation
1. Findings page renders an empty state when no workflows exist
2. After capturing 3 workflows, all 3 appear sorted by score desc
3. SPOF workflows show the AlertTriangle icon
4. Score badges color-code correctly (>=70 high, >=40 med, else low)
5. Clicking a row opens FindingDetail with full breakdown
6. Recommended action matches the logic for each combination of (spof_risk, criticality)
- **Acceptance Criteria:** - Top 10+ workflows render in score-descending order on /findings
- Each row links to /findings/:id which shows the score breakdown and recommended action
- Empty state renders when no workflows exist
- SPOF workflows visually distinguished (AlertTriangle icon)
- Score badges use the right tone for each score band

### ST-006: Audit report v1 — Claude-assisted Markdown
- **Status:** review | **Points:** 2 | **Priority:** medium | **Epic:** ST-E5
- **Description:** # ST-006: Audit report (Claude-assisted Markdown)

## Goal
Generate a Markdown audit report from the user's scored findings. Render it in the browser with a history sidebar.

## Files this story creates

**Frontend**
- `src/pages/Reports.tsx` — left sidebar lists past reports (date + workflow count), main panel renders selected report's Markdown via react-markdown with `prose-invert` typography

**Backend (already deployed)**
- `supabase/functions/ss-report/index.ts` — exact source of the deployed ss-report function (committed copy)
- `supabase/functions/ss-report/deno.json`

### Reports.tsx behavior

**Data fetching**:
- SELECT * FROM ss_audit_reports ORDER BY generated_at DESC (RLS filters by user)
- On mount, auto-select the most recent if any exist

**UI states**:
- Empty: centered Card with FileText icon, "No reports yet", explanation
- Populated: 4-column grid. Left column = history list. Right 3 columns = selected report rendered with react-markdown
- "Generate report" button in header — calls ss-report, refetches list, selects the new report

### ss-report contract

**Endpoint**: `POST ${SUPABASE_URL}/functions/v1/ss-report`
**Auth**: Bearer access_token
**Request body**: `{}`
**Response**: `{ ok: true, report: AuditReport }` or `{ error: string }`

**Behavior**:
1. Resolve user from JWT
2. Fetch all ss_workflows for the user
3. Fetch latest ss_workflow_scores per workflow
4. Build structured input: workflow names, scores, primary_risk_driver per workflow, top-5 SPOF, top-5 by score
5. Call Anthropic claude-sonnet-4-20250514 with a strict prompt:
   - Audit-grade tone, no marketing fluff
   - Frame "knowledge concentration" not "personal risk"
   - Forbid naming individuals
   - Sections: Executive Summary, Top Risks, SPOF Workflows, Recommended Next Steps, Methodology
6. Insert ss_audit_reports row with content_md, workflow_count, claude_input_summary, claude_model
7. Return the inserted report

ANTHROPIC_API_KEY is read from Deno.env (set in the Supabase project's secrets — already configured).

## Dependencies
- ST-001 (shell)
- ST-002 (schema)
- ST-005 (findings already populated for the report to summarize)

## Validation
1. With 0 workflows: error "No workflows captured" returned, no report row inserted
2. With 5+ scored workflows: report generates within 60 seconds, renders cleanly via react-markdown
3. Report does not name specific individuals (verify by inspecting content_md)
4. Re-running produces a similar but not identical report (Claude variance is acceptable)
5. History sidebar shows past reports in date order, clicking switches the rendered panel
- **Acceptance Criteria:** - A user with 5+ captured workflows can generate a report in under 60 seconds
- Report renders cleanly via react-markdown with prose-invert styling
- The report names top SPOF and load-bearing workflows accurately based on scores
- No specific individuals are named in the output (only roles)
- History sidebar lets the user view any past report
- supabase/functions/ss-report/index.ts in the repo matches the deployed function exactly

### ST-007: Workflow editing + delete
- **Status:** blocked | **Points:** 3 | **Priority:** high | **Epic:** ST-E2
- **Description:** # ST-007: Edit and delete captured workflows

## Goal
Users captured workflows during v1; they need to update them as situations change (someone documents the workflow → SPOF flips false; criticality changes; ownership transfers).

## Files this story touches
- `src/pages/FindingDetail.tsx` — add "Edit" and "Delete" buttons in the header
- `src/pages/Capture.tsx` — refactor into a reusable `<WorkflowForm>` component used in both create and edit modes
- New route `/findings/:id/edit` in App.tsx

## Behavior
- Edit: pre-fill form with existing workflow values; on save UPDATE ss_workflows + re-run ss-score for that workflow_id
- Delete: confirmation dialog, then DELETE FROM ss_workflows (RLS scoped). FK ON DELETE CASCADE removes ss_workflow_scores. Navigate back to /findings.

## Validation
1. Edit a workflow → field changes persist
2. Edit triggers re-scoring; new score appears on findings list
3. Delete removes the row and its scores
4. Cancelling delete leaves data unchanged
- **Acceptance Criteria:** - Edit form pre-fills correctly from existing row
- Saving triggers ss-score; new score appears on findings list within 5s
- Delete confirms, then removes the row and cascades scores
- /findings/:id/edit is auth-gated

### ST-008: PDF export of audit reports
- **Status:** planned | **Points:** 3 | **Priority:** medium | **Epic:** ST-E5
- **Description:** # ST-008: PDF export

## Goal
v1 ships Markdown-only reports. Customers want a polished PDF for their board, audit committee, or compliance file.

## Files this story creates
- `src/components/PDFExport.tsx` — wraps a report and provides "Download PDF" button
- New dependency: `@react-pdf/renderer` (or `html2pdf.js` — decide based on Markdown rendering quality)

## Behavior
- "Download PDF" button on Reports.tsx next to each report in the history list
- Click: render report to PDF in browser (no server roundtrip — keeps customer data local)
- File: `standstill-audit-{date}.pdf`
- Layout: cover page (org name placeholder, generated_at, workflow_count), then report body

## Validation
1. PDF downloads on click
2. Markdown renders as proper PDF with headings, lists, paragraphs
3. Generated date appears on the cover page
4. No data leaves the browser during PDF generation
- **Acceptance Criteria:** - Download PDF button on each report in the history sidebar
- Output is a well-formed PDF with proper Markdown rendering
- File is named standstill-audit-{date}.pdf
- Generation happens entirely client-side

### ST-009: CSV upload — capture multiple workflows at once
- **Status:** blocked | **Points:** 5 | **Priority:** medium | **Epic:** ST-E2
- **Description:** # ST-009: CSV import

## Goal
Self-audit is faster if a Chief of Staff can paste a CSV instead of filling the form 30 times. v0 of file-evidence: structured CSV import.

## Files this story creates
- `src/pages/Import.tsx` — file picker + preview table + import button
- `src/lib/csv.ts` — parses CSV into Workflow drafts using papaparse
- New dependency: `papaparse`
- New nav item Import (Upload icon) added to Layout sidebar

## CSV schema (documented in UI)
```csv
name,owner_role,frequency,breadth,criticality,spof_risk,spof_rationale,notes
"Q4 close","FP&A senior analyst",monthly,3,5,true,"Only one person knows the spreadsheet","Critical for board pack"
```

## Behavior
1. User uploads CSV via file picker (drag-drop too)
2. Parse and validate rows
3. Preview table shows parsed rows + any validation errors
4. User clicks Import → INSERT all valid rows into ss_workflows + call ss-score with score_all=true
5. Navigate to /findings

## Validation
1. Valid CSV imports cleanly with all rows landing in ss_workflows
2. Invalid rows show inline errors and are skipped (not all-or-nothing)
3. Score job runs after import; all imported workflows have scores within 30s
- **Acceptance Criteria:** - A 10-row CSV imports in under 30 seconds end-to-end
- Invalid rows surface as preview errors and are excluded
- All imported rows get scored via ss-score
- Import nav item visible in sidebar

### ST-010: Score weight tuning per deployment
- **Status:** planned | **Points:** 5 | **Priority:** low | **Epic:** ST-E4
- **Description:** # ST-010: Per-deployment scoring weight tuning

## Goal
v1 ships fixed heuristic weights. Different orgs care about different inputs (a heavily SPOF-conscious org wants spof_risk weighted higher). Allow per-deployment tuning without forking the codebase.

## Files this story creates
- `supabase/migrations/00200000000000_tenant_settings.sql` — new `ss_tenant_settings` table with `scoring_weights jsonb`
- `src/pages/Settings.tsx` — sliders for the 4 weights (max contribution per input)
- Update `src/lib/scoring.ts` and `supabase/functions/ss-score/index.ts` to read weights from tenant_settings, fall back to defaults

## Default weights (v1 baseline)
```json
{ "frequency_max": 30, "breadth_max": 25, "criticality_max": 20, "spof_max": 25 }
```

## Behavior
- Settings page shows 4 sliders 0-50, must sum to 100
- Save → upsert ss_tenant_settings row
- Future scoring runs use new weights; existing scored runs are NOT recomputed automatically (avoid surprise re-rankings)
- Optional "Re-score all" button to re-run ss-score for all workflows

## Validation
1. Adjust sliders → save → re-score → scores reflect new weights
2. Sum-to-100 validation prevents bad input
3. ss_workflow_scores from before the change remain intact
- **Acceptance Criteria:** - Settings page renders with 4 weight sliders summing to 100
- Save updates ss_tenant_settings; both ss-score and lib/scoring.ts honor new weights
- Old scores remain (no silent rewrite)
- Re-score-all button is available

