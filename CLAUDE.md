# Standstill

## Supabase
Project: rynpbrojfbvullbqsbji

## Problem
Enterprises run on a hidden layer of work that never went through procurement: spreadsheets that became load-bearing, email chains that became processes, and workflows that exist only because one person remembers how they work. There is no map of which spreadsheets are critical, which email-chain processes have single points of failure, or which institutional knowledge will leak the day a key contributor resigns. Audit, business continuity, and Chief of Staff functions try to surface this manually and consistently fail because the unit of the problem is too small to justify a project and there are too many of them.

## Vision
A continuous, read-only audit of the shadow workflow layer. Standstill connects to a company's working surfaces — email, file shares, calendar, collaboration tools — indexes activity patterns, and produces a ranked map of load-bearing spreadsheets, email-chain processes, and single-point-of-failure (SPOF) workflows. Each finding has a score, an owner, a recommended action, and a trend over time. The output is a quarterly executive report and a live dashboard that converts shadow risk into an institutional ledger.

## Users
Director of Internal Audit, Chief of Staff, VP of Operations, CFO at mid-to-large enterprises (1,000+ employees) with sprawling internal-process surface area. Especially critical for regulated industries (financial services, insurance, healthcare, federal) where SPOF risk is a compliance concern, not just an operational one.

## Features
[
  "Microsoft Graph + Google Workspace connectors (read-only, metadata-first)",
  "Spreadsheet load-bearing scorer (open frequency, dependency graph, edit graph, breadth of consumers)",
  "Email-chain process detector (recurring threads with stable participant patterns and forward velocity)",
  "Single-point-of-failure clustering by individual contributor across artifacts",
  "Risk dashboard with scored findings, owner identification, and recommended actions",
  "Quarterly audit-trail report export (PDF) for executive review",
  "Privacy-fortress posture: tenant-scoped data, no egress beyond customer perimeter"
]

## Stack
{
  "design": "Neumorphism slate (default Dynamic-Ally aesthetic)",
  "backend": [
    "Supabase Postgres",
    "pgvector",
    "Edge Functions (Deno)",
    "pg_net for async orchestration"
  ],
  "frontend": [
    "React",
    "TypeScript",
    "Vite",
    "Tailwind",
    "shadcn/ui",
    "Framer Motion",
    "Lucide"
  ],
  "integrations": [
    "Microsoft Graph API",
    "Google Workspace API",
    "SSO/OIDC for tenant auth"
  ]
}

## Design
{
  "aesthetic": {
    "style": "Glassmorphism",
    "description": "Glassmorphism"
  },
  "color": {
    "family": "Slate",
    "primary": "#818CF8",
    "surface": "#0A0B0D"
  },
  "fonts": {
    "body_font": "Inter",
    "heading_font": "Inter",
    "google_fonts_url": "https://fonts.googleapis.com/css2?family=Inter&family=Inter&display=swap"
  },
  "framework": {
    "framework": "shadcn/ui",
    "description": "shadcn/ui"
  },
  "icons": {
    "set": "Lucide"
  }
}

## Constitutions
- Privacy Fortress

## Hard Rules
- Never ship code that harms users, even under deadline pressure
- No secrets in code, repos, or logs — ever
- All user input is hostile until validated
- Authentication and authorization on every endpoint, not just the frontend
- All systems must map to NIST 800-53 control families before deployment
- FedRAMP authorization boundaries must be defined and documented at project inception
- FAR and DFARS clauses applicable to the contract must be identified and tracked
- Section 508 and WCAG 2.2 AA compliance is mandatory for all user-facing components
- FISMA categorization must be established before architecture begins
- FIPS 140-2 validated cryptographic modules for all encryption at rest and in transit
- All data must reside in CONUS-approved regions — no exceptions
- All system actions must produce immutable audit logs with timestamp, actor, and action
- All third-party components must have FedRAMP or equivalent authorization
- Collect only the minimum data necessary for the stated purpose — enforce at schema level
- All PII must be encrypted at rest and in transit with no exceptions

## Intentions
- [goal] Surface the shadow workflow layer of an enterprise within 30 days of deployment
- [principle] Read-only at the source, always
- [principle] Metadata-first, content opt-in
- [principle] Frame findings as knowledge concentration, never as personal risk
- [principle] Every score is explainable
- [constraint] Multi-tenant by default with strict RLS isolation
- [constraint] No data egress beyond the customer perimeter
- [anti_pattern] Do not name individuals in any default view
- [quality_bar] False-positive rate on load-bearing flags below 20% by end of pilot
- [user_promise] A pilot is operable by the customer's platform team in under two days

## Integrations
- Microsoft Graph
- Google Workspace
- Anthropic Claude
- Supabase Vault

## Env
See .env.example
