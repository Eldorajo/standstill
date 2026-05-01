# Standstill — Project Status

> Auto-generated from SerVet Skill MCP | Last updated: 2026-05-01 22:37:49 UTC

## Overview

| | |
|---|---|
| **Status** | active |
| **Progress** | 0% (0/21 points) |
| **Stories** | 0 done, 0 in progress, 6 planned, 0 blocked |
| **Epics** | 5 |
| **Sprints** | 1 |

## Problem
Enterprises run on a hidden layer of work that never went through procurement: spreadsheets that became load-bearing, email chains that became processes, and workflows that exist only because one person remembers how they work. There is no map of which spreadsheets are critical, which email-chain processes have single points of failure, or which institutional knowledge will leak the day a key contributor resigns. Audit, business continuity, and Chief of Staff functions try to surface this manually and consistently fail because the unit of the problem is too small to justify a project and there are too many of them.

## Vision
A continuous, read-only audit of the shadow workflow layer. Standstill connects to a company's working surfaces — email, file shares, calendar, collaboration tools — indexes activity patterns, and produces a ranked map of load-bearing spreadsheets, email-chain processes, and single-point-of-failure (SPOF) workflows. Each finding has a score, an owner, a recommended action, and a trend over time. The output is a quarterly executive report and a live dashboard that converts shadow risk into an institutional ledger.

## Sprint Board

### Sprint 1: Ship a working v1: scaffold + auth + workflow capture + scorer + findings list. By end of sprint, a Chief of Staff can sign in, capture 5 workflows, see them scored and ranked. (planning)
0/21 points | 2026-05-04 → 2026-05-15

### Done ✅

| Story | Title | Points | Assignee | Completed |
|-------|-------|--------|----------|-----------|

### In Progress 🔄

| Story | Title | Points | Assignee | Started |
|-------|-------|--------|----------|---------|

### Planned 📋

| Story | Title | Points | Priority | Epic |
|-------|-------|--------|----------|------|
| ST-001 | Project scaffold + Supabase auth + dashboard shell | 5 | critical | ST-E1 |
| ST-002 | Schema: workflows, scores, audit_reports — multi-tenant-ready columns from day one | 3 | critical | ST-E1 |
| ST-003 | Workflow capture form (single-page, save to workflows table) | 5 | high | ST-E2 |
| ST-004 | Heuristic scorer v1 with explainable breakdown | 3 | high | ST-E3 |
| ST-005 | Findings dashboard — ranked list with score breakdown | 3 | high | ST-E4 |
| ST-006 | Audit report v1 — Claude-assisted Markdown | 2 | medium | ST-E5 |

## Epics

### ST-E1: Foundation (0/2 stories done)
React + Supabase scaffold. Auth (email/password). Single-tenant schema with multi-tenant-ready columns. Dashboard shell with sidebar nav.

### ST-E2: Workflow Capture (0/1 stories done)
Guided self-audit form. Multi-step capture of shadow workflows (name, owner, frequency, breadth, criticality, SPOF risk). Edit + delete + list.

### ST-E3: Heuristic Scoring Engine (0/1 stories done)
Transparent, explainable scoring. Each finding gets a 0–100 score with a published breakdown by named input. Score history persisted per workflow so trends are queryable.

### ST-E4: Findings Dashboard (0/1 stories done)
Top-N ranked workflows. Sort, filter, drill into score breakdown. Recommended action per finding. Sober, audit-grade UI — no gamification.

### ST-E5: Audit Report Generation (0/1 stories done)
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

## Build History

| Story | Status | Summary | Date |
|-------|--------|---------|------|
| SS-001 | failed |  | 2026-05-01T21:36 |

## Story Details

### ST-001: Project scaffold + Supabase auth + dashboard shell
- **Status:** planned | **Points:** 5 | **Priority:** critical | **Epic:** ST-E1
- **Description:** Bolt.new prompt builds the v1 React + Vite + Tailwind + shadcn/ui app on the Slate / Neumorphism design system. Wires Supabase email/password auth with a sign-in page. Dashboard shell has a left sidebar with the four primary nav items: Capture, Findings, Reports, Settings. Single-tenant for v1 (one auth user per deployment).
- **Acceptance Criteria:** A logged-in user lands on the empty dashboard. Sidebar nav present. Logout works. The deploy on Netlify is reachable via a public URL.

### ST-002: Schema: workflows, scores, audit_reports — multi-tenant-ready columns from day one
- **Status:** planned | **Points:** 3 | **Priority:** critical | **Epic:** ST-E1
- **Description:** Migration creates: workflows (tenant_id default singleton, name, owner_name, frequency, breadth, criticality, spof_risk, notes, created_at), workflow_scores (tenant_id, workflow_id, run_id, score, score_breakdown jsonb, scored_at), score_runs (tenant_id, ran_at, ran_by). RLS placeholders included but permissive in v1. tenant_id column on every table even though only one tenant exists in v1.
- **Acceptance Criteria:** Tables exist with the listed columns. RLS enabled. A test insert + select round-trips. Schema does not require rework when multi-tenant arrives — only RLS policy updates and tenant scoping.

### ST-003: Workflow capture form (single-page, save to workflows table)
- **Status:** planned | **Points:** 5 | **Priority:** high | **Epic:** ST-E2
- **Description:** A "Capture a Workflow" page with structured fields: workflow name, primary owner, frequency (daily/weekly/monthly/quarterly), breadth (number of teams that depend on it), criticality (1–5 scale), SPOF risk (yes/no with rationale), free-text notes. On save, a row lands in workflows. List view shows all captured workflows with a count badge in the sidebar.
- **Acceptance Criteria:** A user can capture 5 workflows in 5 minutes. Each lands as a row. List view shows them. Editing an existing workflow round-trips correctly. Validation blocks empty name + owner.

### ST-004: Heuristic scorer v1 with explainable breakdown
- **Status:** planned | **Points:** 3 | **Priority:** high | **Epic:** ST-E3
- **Description:** Edge function ss-score that, on workflow create or update, computes a 0–100 score. Inputs: frequency (daily=1.0, weekly=0.7, monthly=0.4, quarterly=0.1), breadth (log scaled), criticality (linear), spof_risk (binary boolean → +25). Stores the score with a JSON breakdown {input_name: contribution} in workflow_scores, and appends a row to score_runs. Re-running for the same inputs produces the same score (deterministic).
- **Acceptance Criteria:** After ST-003 captures workflows, scoring runs and persists. Each workflow has at least one score. score_breakdown JSON shows each input's contribution. Running ss-score twice for the same workflow produces identical scores.

### ST-005: Findings dashboard — ranked list with score breakdown
- **Status:** planned | **Points:** 3 | **Priority:** high | **Epic:** ST-E4
- **Description:** Findings page lists workflows sorted by current score (descending). Each row: name, owner, score, primary risk-driver (the highest-contributing input), recommended action (placeholder for v1: "Document this workflow" or "Identify a backup owner"). Clicking a row opens a drill-down panel showing the full score breakdown. No name-based filtering for v1; filter by frequency / criticality only.
- **Acceptance Criteria:** Top 10 workflows render in score order. Drill-down panel shows breakdown. Filters work. UI matches Slate / Neumorphism design tokens.

### ST-006: Audit report v1 — Claude-assisted Markdown
- **Status:** planned | **Points:** 2 | **Priority:** medium | **Epic:** ST-E5
- **Description:** Edge function ss-report generates a Markdown audit report from current scored findings: executive summary, top 5 SPOF risks, top 5 load-bearing workflows, recommended next steps. Calls Anthropic Claude with structured input (the scored findings, NOT raw user notes). Returned Markdown renders in a Reports page with copy-to-clipboard. PDF export deferred to v0.2.
- **Acceptance Criteria:** A user with 5+ captured workflows can generate a report in under 60 seconds. The report names the top SPOF and top load-bearing workflows accurately based on scores. Markdown renders cleanly. Re-running produces a similar but not identical report (Claude variance is acceptable).

