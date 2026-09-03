# Findings — phase1-auth

> Append-only. Chronological discoveries, research results, decisions, corrections. Never rewrite history.

## 2026-09-02

### Discovery: current state of scaffold
- `src/lib/supabase.ts` exists (paired with CREATE_CLIENT) but no auth pages/routes present yet.
- `src/routes/` has `dashboard/index.tsx` + `_layout.tsx` only. Router (App.tsx) needs the auth group added.
- `.github`/deploy not relevant here; no git remote issues observed.

### Constraint (from AGENTS.md / BUILD_PROMPT.md)
- RLS is the enforcement layer — no proxy API server. Every Supabase query must be policy-covered.
- Auth must use supabase-js + React Router v7 loader/data patterns where applicable (no bare `useEffect` redirects if loader pattern fits).
- Do not add inline colors; use `@theme` design tokens.

### Decision still open
- Whether to use React Router loaders for the auth guard (data-router) vs. a wrapper component on the layout route. Document choice here once tried.

## 2026-09-02 (later)

_(keep appending below — oldest at top, newest at bottom)_