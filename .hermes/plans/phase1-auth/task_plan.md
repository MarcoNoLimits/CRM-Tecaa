# Task Plan — phase1-auth

> Goal: Wire Supabase Auth into the CRM scaffold so the app has sign-in/sign-up, a protected app shell, and a session-aware topbar.

Basis: CRM-Tecaa BUILD_PROMPT.md Phase 1. Stack locked (React19+Vite+TS, supabase-js, React Router v7, TanStack Query). Do NOT re-negotiate.

## Phases

- [x] **Phase 1a: Verify current foundation compiles**
  - Acceptance: `npm run build` exits 0 on the existing scaffold; supabase client import resolves.
  - [x] Run `npm run build`, capture output
  - [x] Confirm `src/lib/supabase.ts` wiring matches .env keys
- [ ] **Phase 1b: Auth routes + forms**
  - Acceptance: `/login` and `/signup` routes render; Zod-validated forms post to Supabase.
  - [ ] Add `LoginPage`, `SignUpPage` under `src/routes/auth/`
  - [ ] Register routes in router; add `auth` route group
- [ ] **Phase 1c: Protected shell + session state**
  - Acceptance: unauthenticated visits redirect to `/login`; topbar shows user email + sign-out.
  - [ ] `AuthGuard` wrapper on the `_layout` route
  - [ ] `useSession` hook (supabase-js) + Zustand store
  - [ ] Topbar sign-out wired to `signOut()`
- [ ] **Phase 1d: RLS + users table seed**
  - Acceptance: a `profiles` table mirrors `auth.users` via trigger; RLS policy allows owner read.
  - [ ] Write migration SQL + trigger
  - [ ] Verify a signed-up user can read their own profile row

## Constraints / tradeoffs

- No API server; RLS enforces permissions — every query must satisfy a policy.
- Side drawers for forms, not centered modals.
- No inline colors; use `@theme` tokens from `src/app.css`.
- Optimistic updates for mutations, rollback on error.

## Definition of done

- All checkboxes ticked, each verified by real build/test output (logged in progress.md)
- Phase 1 in BUILD_PROMPT.md marked complete against its checklist
- No open assumptions remaining in findings.md