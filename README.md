# Standstill

A guided self-audit dashboard for shadow workflow risk in enterprises.

## v1 Scope

- **Capture**: Structured form for shadow workflow input
- **Score**: Transparent heuristic scoring of workflows
- **Report**: Claude-assisted audit report generation

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Supabase Postgres + Edge Functions
- AI: Anthropic Claude API
- Auth: Supabase email/password
- Deploy: Netlify

## Development

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture

- Single-tenant for v1 (multi-tenant-ready schema)
- No OAuth integrations in v1
- Heuristic scoring only (no ML)
- Privacy-first: no individual naming in default views