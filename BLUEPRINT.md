# Standstill v1 — Implementation Blueprint

This document is the single source of truth for executing Standstill v1. Any agent, contractor, or human picking up a story should read this first, then read their story.

## How to "trigger" a story

Standard prompt format for any executor:

```
Open project Standstill (eldorajo/standstill).
Read the implementation blueprint in claude_project_files.
Execute story <ST-XXX>.
The story description tells you the files to create, the contracts they satisfy, and validation steps.
When complete, mark the story status='in_progress' → 'done' via dash-api-v2.
Push code to GitHub via sv-launch-v2 or by direct git commit on a feature branch.
```

## Repo layout (final state after Sprint 1)

```
eldorajo/standstill/
├── README.md
├── CLAUDE.md                    # ST-001
├── package.json                 # ST-001
├── tsconfig.json                # ST-001
├── tsconfig.node.json           # ST-001
├── vite.config.ts               # ST-001
├── tailwind.config.js           # ST-001
├── postcss.config.js            # ST-001
├── index.html                   # ST-001
├── .env.example                 # ST-001
├── .gitignore                   # ST-001
├── src/
│   ├── main.tsx                 # ST-001
│   ├── App.tsx                  # ST-001
│   ├── index.css                # ST-001
│   ├── lib/
│   │   ├── supabase.ts          # ST-001
│   │   ├── types.ts             # ST-002
│   │   └── scoring.ts           # ST-003 (mirrors ss-score)
│   ├── components/
│   │   ├── ui.tsx               # ST-001 (Button, Input, Textarea, Select, Label, Card, Badge, Spinner)
│   │   ├── AuthGuard.tsx        # ST-001
│   │   ├── Layout.tsx           # ST-001
│   │   └── ScoreBreakdown.tsx   # ST-003
│   └── pages/
│       ├── Login.tsx            # ST-001
│       ├── Capture.tsx          # ST-003
│       ├── Findings.tsx         # ST-005
│       ├── FindingDetail.tsx    # ST-005
│       └── Reports.tsx          # ST-006
└── supabase/
    ├── migrations/
    │   └── 20260501000000_initial_schema.sql   # ST-002 (committed copy of applied migration)
    └── functions/
        ├── ss-score/             # ST-004 (committed copy of deployed function)
        │   ├── index.ts
        │   └── deno.json
        └── ss-report/            # ST-006 (committed copy of deployed function)
            ├── index.ts
            └── deno.json
```

## Live Supabase resources

**Project**: `rynpbrojfbvullbqsbji` (us-east-2, Pro)
**URL**: `https://rynpbrojfbvullbqsbji.supabase.co`

Already deployed (do NOT redeploy under same name — Supabase has a redeploy bug; if you need a new version, use a v2/v3 suffix):
- Schema migration `standstill_initial_schema` (5 ss_* tables with RLS)
- Edge function `ss-score` (verify_jwt: true)
- Edge function `ss-report` (verify_jwt: true, calls Anthropic Claude)

## Design tokens (Tailwind config)

Slate / Neumorphism. Colors:
- `surface: '#0A0B0D'` (page background)
- `elev: '#111316'` (cards, sidebar)
- `sunken: '#06070A'` (recessed inputs, active nav)
- `border: 'rgba(255,255,255,0.08)'`
- `border-strong: 'rgba(255,255,255,0.16)'`
- `ink: '#F2F3F5'` (primary text)
- `muted: '#9AA0A6'` (secondary text)
- `dim: '#5C6166'` (tertiary text)
- `accent: '#818CF8'` (interactive primary)
- `accent-soft: '#A99CFF'` (hover)
- `risk-low: '#34D399'`, `risk-med: '#F59E0B'`, `risk-high: '#F87171'`

Fonts: Inter (sans), IBM Plex Mono (mono). Loaded from Google Fonts in index.html.

Shadows:
- `shadow-neu: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.4)'`
- `shadow-neu-sunken: 'inset 0 2px 6px rgba(0,0,0,0.5)'`

Custom CSS classes (defined in src/index.css):
- `.neu-card` → `bg-elev border border-border rounded-xl shadow-neu`
- `.neu-sunken` → `bg-sunken border border-border rounded-lg shadow-neu-sunken`
- `.kicker` → `font-mono text-xs uppercase tracking-wider text-muted`

## Cross-cutting code conventions

1. **Imports**: relative imports within src; absolute paths via `import { X } from '@supabase/supabase-js'`
2. **Types**: import shared types from `../lib/types` (or `../../lib/types` from pages)
3. **Supabase client**: always import from `../lib/supabase`, never instantiate inline
4. **Edge function calls**: always use `Bearer ${session?.access_token}`; URLs from `FUNCTIONS_URL`
5. **Errors**: render via `<div className="text-sm text-risk-high bg-risk-high/10 border border-risk-high/20 px-3 py-2 rounded-lg">{error}</div>`
6. **Empty states**: render inside `<Card className="text-center py-12">`
7. **Loading**: `<Spinner />` inline for buttons; centered Spinner for full-page
8. **Sort orders**: findings descending by score; reports descending by generated_at
9. **No console.log in committed code** (warnings in supabase.ts for missing env are exempt)
10. **No `any` types**

## Core contracts

### Frequency type (src/lib/types.ts)
```ts
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
```

### Heuristic scoring (src/lib/scoring.ts AND supabase/functions/ss-score must match byte-for-byte)
```
freqMap = {daily:30, weekly:21, monthly:12, quarterly:3}
freqContrib = freqMap[frequency]
breadthContrib = min(25, log(max(1,breadth)+1) * 8)
critContrib = criticality * 4
spofContrib = spof_risk ? 25 : 0
score = round((freq+breadth+crit+spof)*100)/100  // 0-100
```

ScoreBreakdown JSON structure:
```ts
{
  frequency: { input: Frequency, weight: 30, contribution: number },
  breadth: { input: number, weight: 25, contribution: number },
  criticality: { input: number, weight: 20, contribution: number },
  spof_risk: { input: boolean, weight: 25, contribution: number }
}
```

## Story dependency graph (Sprint 1)

```
ST-001 (foundation) ─┬─→ ST-003 (capture) ──→ ST-005 (findings)
                     ├─→ ST-002 (schema)        │
                     │      ↓                    ↓
                     │   ST-004 (score) ─────────┤
                     │                           ↓
                     └────────────────────→ ST-006 (report)
```

Recommended execution order: ST-001 → ST-002 → ST-004 → ST-003 → ST-005 → ST-006.

(ST-002 and ST-004 are mostly documentation since the live DB and edge functions are already deployed; they primarily commit the source-of-truth files into the repo.)

## Validation matrix (whole-app smoke test)

After all 6 stories ship, this scenario should work end-to-end:

1. Navigate to https://stackblitz.com/github/eldorajo/standstill
2. Set VITE_SUPABASE_ANON_KEY in StackBlitz env panel
3. Sign up with a fresh email
4. Land on /findings — empty state visible
5. Click "Get started" → /capture
6. Capture 5 workflows with varied frequency/breadth/criticality/spof_risk values
7. Each save returns to /findings with the new workflow ranked by score
8. Click any workflow → drill into FindingDetail with score breakdown + recommended action
9. Navigate to /reports → "Generate report" → wait <60s → Markdown report renders
10. Sign out → returns to /login

## What to NEVER do

- Do not bypass auth (no public routes other than /login)
- Do not invent new tables that don't follow the ss_* prefix and tenant_id-on-day-one convention
- Do not name individuals in any default view (only roles)
- Do not commit secrets to the repo (.env is gitignored)
- Do not redeploy ss-score or ss-report under the same name (Supabase redeploy bug — use ss-score-v2 if a fix is needed)
- Do not call Claude with raw user-typed content (only structured findings)

## Handoff to Sprint 2

Sprint 2 stories (ST-007 to ST-010) only become workable after Sprint 1 is done and validated. Reading order: ST-007 (edit/delete) → ST-009 (CSV import) → ST-008 (PDF export) → ST-010 (weight tuning).
