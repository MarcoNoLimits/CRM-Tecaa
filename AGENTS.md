# CRM Web App — Agent Context

> This file provides architectural context for AI agents working on this project.
> When a new agent enters this project, read this file first to understand all
> decisions already made — do not re-negotiate the stack, design, or patterns.

---

## Tech Stack (locked — do not change without user request)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | React 19 + Vite + TypeScript | Fast dev, full type safety |
| **Styling** | Tailwind CSS v4 | Design tokens via `@theme`, no runtime |
| **Backend** | Supabase (Postgres, Auth, RLS, Realtime) | No proxy API server, all client-side via supabase-js |
| **Routing** | React Router v7 | Loader/action data patterns, nested layouts |
| **Server State** | TanStack Query v5 | Caching, optimistic updates, background refetch |
| **UI State** | Zustand | Lightweight, no boilerplate |
| **Forms** | React Hook Form + Zod | Performant, typed validation |
| **UI Primitives** | Radix UI | Accessible, headless, composable |
| **Icons** | lucide-react | Clean SVG icon set |
| **Drag & Drop** | @dnd-kit | Kanban board, reordering |
| **Lint/Format** | Biome | Fast, single tool |
| **Unit Tests** | Vitest + Testing Library | React-centric assertions |
| **E2E Tests** | Playwright | Cross-browser, reliable selectors |

> **Why no API server?** Supabase provides Postgres + Auth + RLS at the database
> level. The React app calls Supabase directly. This avoids maintaining a proxy
> API server and lets RLS enforce permissions on every query. If you need server-
> side logic later, use Supabase Edge Functions (Deno) or a separate service.

---

## Project Structure

```
CRM-Tecaa/
├── AGENTS.md                      # ← You are here
├── .vscode/                       # IDE configs (settings, extensions, launch)
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── supabase/
│   ├── config.toml                # Supabase local config
│   └── migrations/
│       └── 0001_core_schema.sql   # Full schema + RLS
├── src/
│   ├── main.tsx                   # Entry, renders App
│   ├── app.css                    # Tailwind import + @theme design tokens
│   ├── App.tsx                    # Router definition
│   │
│   ├── routes/                    # Page-level route components
│   │   ├── _layout.tsx            # App shell (sidebar + topbar + Outlet)
│   │   ├── auth/
│   │   │   └── login.tsx
│   │   ├── dashboard/
│   │   │   └── index.tsx
│   │   ├── contacts/
│   │   │   ├── index.tsx          # List page
│   │   │   └── $id.tsx            # Detail page
│   │   ├── companies/
│   │   │   ├── index.tsx
│   │   │   └── $id.tsx
│   │   ├── pipeline/
│   │   │   └── index.tsx          # Kanban board
│   │   ├── activities/
│   │   │   └── index.tsx
│   │   ├── tasks/
│   │   │   └── index.tsx
│   │   └── settings/
│   │       └── index.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # Primitives (Button, Input, Dialog, etc.)
│   │   ├── layout/                # Sidebar, Topbar, AppShell
│   │   ├── data/                  # DataTable, KanbanBoard, Timeline
│   │   ├── contacts/              # Contact-specific components
│   │   ├── companies/             # Company-specific components
│   │   ├── pipeline/              # Deal-specific components
│   │   ├── activities/            # Activity-specific components
│   │   ├── tasks/                 # Task-specific components
│   │   └── dashboard/             # Dashboard widgets
│   │
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client init
│   │   ├── utils.ts               # cn() helper, formatters
│   │   └── constants.ts           # Route paths, enums
│   │
│   ├── hooks/
│   │   ├── use-auth.ts            # Auth state & methods
│   │   ├── use-contacts.ts        # TanStack Query hooks for contacts
│   │   ├── use-companies.ts       # TanStack Query hooks for companies
│   │   ├── use-deals.ts           # TanStack Query hooks for deals
│   │   ├── use-activities.ts      # TanStack Query hooks for activities
│   │   ├── use-tasks.ts           # TanStack Query hooks for tasks
│   │   ├── use-dashboard.ts       # Dashboard aggregation hook
│   │   ├── use-command-palette.ts # Cmd+K search hook
│   │   └── use-debounce.ts        # Generic debounce hook
│   │
│   ├── stores/
│   │   ├── ui-store.ts            # Sidebar state, active panel, filters
│   │   └── auth-store.ts          # Auth state mirror (Zustand)
│   │
│   ├── types/
│   │   └── schema.ts              # Generated Supabase types
│   │
│   └── styles/                    # Additional CSS if needed
│
├── e2e/                           # Playwright tests
│   ├── auth.spec.ts
│   ├── contacts.spec.ts
│   └── pipeline.spec.ts
│
└── .hermes/
    └── plans/                     # Implementation plans
```

---

## Design System Tokens

**All design tokens live in `src/app.css` via Tailwind's `@theme` directive.**
Never add ad-hoc color values in component files — use the theme tokens below.

### Background Hierarchy (luminance stepping instead of shadows)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#08090a` | Page background, deepest canvas |
| `bg-panel` | `#0f1011` | Sidebar, panels, input backgrounds |
| `bg-surface` | `#191a1b` | Cards, dropdowns, elevated surfaces |
| `bg-surface-2` | `#28282c` | Hover states, active elements |
| `bg-hover` | `rgba(255,255,255,0.04)` | Universal hover overlay |
| `bg-active` | `rgba(255,255,255,0.06)` | Active/pressed states |

### Text

| Token | Value | Usage |
|-------|-------|-------|
| `text-primary` | `#f7f8f8` | Headings, primary labels (not pure white) |
| `text-secondary` | `#d0d6e0` | Body text, descriptions |
| `text-tertiary` | `#8a8f98` | Muted text, placeholders, metadata |
| `text-quaternary` | `#62666d` | Disabled text, timestamps |

### Accent (Indigo-Violet — the only chromatic color in chrome)

| Token | Value | Usage |
|-------|-------|-------|
| `accent` | `#5e6ad2` | Primary CTAs, active states, brand marks |
| `accent-hover` | `#828fff` | Hover on accent elements |
| `accent-muted` | `#7170ff` | Links, secondary accent |

### Borders (always semi-transparent white — never solid dark colors)

| Token | Value | Usage |
|-------|-------|-------|
| `border-default` | `rgba(255,255,255,0.08)` | Cards, inputs, dividers |
| `border-subtle` | `rgba(255,255,255,0.05)` | Subtle structural lines |
| `border-hover` | `rgba(255,255,255,0.12)` | Hover border highlight |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#27a644` | Active status, completed |
| `warning` | `#f59e0b` | Attention needed, mid-priority |
| `error` | `#ef4444` | Overdue, urgent, errors |

### Typography

| Property | Value |
|----------|-------|
| **Primary font** | Inter (via Google Fonts in `index.html`) |
| **Mono font** | JetBrains Mono (via Google Fonts in `index.html`) |
| **Font features** | `cv01`, `ss03` on ALL Inter text — transforms standard Inter into Linear's version |
| **Weight 400** | Body, reading text |
| **Weight 510** | UI labels, navigation, emphasis — this is our signature weight |
| **Weight 590** | Headings, strong labels |

### Border Radius

| Token | Value |
|-------|-------|
| `radius-sm` | 4px |
| `radius-md` | 6px (buttons, inputs) |
| `radius-lg` | 8px (cards) |
| `radius-xl` | 12px (panels, dialogs) |
| `radius-full` | 9999px (pills, badges) |

### Spacing

Base unit: 8px. Scale: 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

---

## Key UI Patterns (do not deviate)

### 1. Surface elevation via luminance stepping

On dark backgrounds, shadows are invisible. Instead, elevate surfaces by making them \*lighter\*:
- **Level 0** (deepest): `bg-primary` (`#08090a`)
- **Level 1** (panels): `bg-panel` (`#0f1011`)
- **Level 2** (cards): `bg-surface` (`#191a1b`)
- **Level 3** (hovered): `bg-surface-2` (`#28282c`)

### 2. Borders are semi-transparent white

```css
/* Good */
border: 1px solid rgba(255, 255, 255, 0.08);

/* Bad — invisible on dark backgrounds */
border: 1px solid #333;
```

### 3. Side drawers, not modals

Entity forms (contact create, deal edit) use a **right-side slide-over panel** (Radix Dialog with `data-[state=open]:animate-in`), **not** a centered modal. This is the Linear pattern — keeps context visible on the left.

### 4. Optimistic updates on all mutations

Every mutation (drag deal, toggle task, create/update entity) must:
1. Update the cache immediately
2. Persist to Supabase
3. Rollback cache on error
4. Invalidate query on settle

```ts
const mutation = useMutation({
  mutationFn: (data) => supabase.from('contacts').insert(data),
  onMutate: async (newContact) => {
    await queryClient.cancelQueries({ queryKey: ['contacts'] });
    const previous = queryClient.getQueryData(['contacts']);
    queryClient.setQueryData(['contacts'], (old) => [...old, newContact]);
    return { previous };
  },
  onError: (err, newContact, context) => {
    queryClient.setQueryData(['contacts'], context.previous);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
});
```

### 5. Keyboard-first navigation

- `Cmd+K` opens command palette (search contacts, companies, deals + navigate)
- `c` → new contact, `d` → new deal, `t` → new task
- `Escape` closes any open panel/drawer
- Arrow keys navigate table rows
- Tab through forms naturally

---

## Supabase Schema (summary)

Full schema in `supabase/migrations/0001_core_schema.sql`. Key tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | Extends auth.users | `full_name`, `role` (admin/manager/member) |
| `companies` | Accounts | `name`, `domain`, `industry`, `owner_id` |
| `contacts` | Individuals | `first_name`, `last_name`, `email`, `company_id`, `status` (active/inactive/lead/archived) |
| `pipeline_stages` | Configurable Kanban columns | `name`, `color`, `position`, `probability` |
| `deals` | Opportunities | `title`, `value`, `stage_id`, `contact_id`, `company_id`, `owner_id` |
| `activities` | Interaction log | `type` (call/email/meeting/note), `subject`, `contact_id`, `due_date` |
| `tasks` | Todo items | `title`, `status`, `priority`, `assignee_id`, `due_date` |

**RLS:** v1 uses simple authenticated-user-can-read-write pattern with admin-only delete.
Future versions will add org_id-based multi-tenancy.

---

## Commands

```bash
npm run dev          # Start dev server (Vite) → http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Vitest (unit + integration)
npx playwright test  # E2E tests
npx biome check .    # Lint + format
npx supabase db push          # Apply migrations to linked project
npx supabase gen types typescript --linked  # Regenerate types from schema
```

---

## What to avoid (anti-patterns)

| ❌ Don't | ✅ Do instead |
|----------|---------------|
| Add inline hex colors | Use theme tokens (`bg-surface`, `text-secondary`) |
| Use solid dark borders (`#333`) | Use `rgba(255,255,255,0.08)` |
| Center modals for forms | Right-side slide-over drawer |
| Wrap every query in try/catch | Use TanStack Query's `onError` |
| Manually manage loading/error | Use TanStack Query's `isLoading`, `isError` |
| Call `supabase.auth` in components | Wrap in `use-auth` hook |
| Use `any` or `as any` | Generate proper types from Supabase schema |
| Shadow DOM or CSS-in-JS | Tailwind classes with `cn()` merge |

---

## IDE Setup

This project includes VS Code / Antigravity configs in `.vscode/`:

| File | Purpose |
|------|---------|
| `.vscode/settings.json` | Format on save with Biome, Tailwind intellisense, font preferences |
| `.vscode/extensions.json` | Recommended extensions (Biome, Tailwind, Copilot, GitLens, etc.) |
| `.vscode/launch.json` | Debug configs for Chrome (dev server) and Vitest |

**When you open the project for the first time:**
1. Accept the prompt to install recommended extensions
2. Make sure `node_modules` exists (`npm install`)
3. Set your Supabase env vars in a `.env` file (see Phase 1)

---

## Implementation Status

_This section is updated as work progresses._

- [x] Phase 0: Scaffold & Design Foundation — Completed (2026-08-16)
- [x] Phase 1: Auth & Supabase Setup — Completed (2026-09-03)
- [x] Phase 2: Contacts Module — Completed (2026-09-03)
- [x] Phase 3: Companies Module — Completed (2026-09-03)
- [x] Phase 4: Pipeline (Deals) Module — Completed (2026-09-03)
- [x] Phase 5: Activities Module — Completed (2026-09-03)
- [x] Phase 6: Tasks Module — Completed (2026-09-03)
- [x] Phase 7: Dashboard Module — Completed (2026-09-03)
- [ ] Phase 8: Command Palette & Polish — Pending
- [x] Phase 9: Settings & Admin — Completed (2026-09-03)
- [ ] Phase 10: Testing & Hardening — Pending