# CRM-Tecaa

**A customer relationship manager for small teams: contacts, companies, a deal pipeline, activities and tasks.**

> **Status: early work in progress.** The app is scaffolded with all its modules, data hooks and tests, but it isn't deployed yet.

## Modules

| Module | What it does |
|---|---|
| **Dashboard** | Contact and open-deal totals, pipeline value, recent deals and upcoming activities |
| **Contacts** | List and detail pages, edited in a side drawer |
| **Companies** | Companies and their contacts and deals |
| **Pipeline** | Deals on a drag-and-drop Kanban board by stage |
| **Activities** | Calls, meetings, emails and notes logged against contacts and deals |
| **Tasks** | To-dos with due dates |
| **Settings** | App settings |

A command palette and side drawers (rather than modal dialogs) keep you in context, and every change is applied optimistically and rolled back if the server rejects it.

## Architecture

There's no API server: the React app talks to Supabase directly, and Postgres row-level security decides what each user may read or write. Server-only logic, when it's needed, goes in Supabase Edge Functions.

| Layer | Choice |
|---|---|
| App | React 19, Vite, TypeScript |
| Routing | React Router v7 |
| Server state | TanStack Query v5 (caching and optimistic updates) |
| UI state | Zustand |
| Forms | React Hook Form + Zod |
| UI | Radix UI primitives, Tailwind CSS, lucide-react icons |
| Drag and drop | dnd-kit |
| Backend | Supabase: Postgres with RLS, Auth |
| Quality | Biome (lint and format), Vitest + Testing Library, Playwright |

The database schema is in [`supabase/migrations/`](supabase/migrations/): profiles, companies, contacts, pipeline stages, deals, activities and tasks, in a dedicated `crm` schema.

## Running locally

```bash
npm install
cp .env.example .env    # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

| Command | What it does |
|---|---|
| `npm run build` | Type-check and build |
| `npm test` | Unit tests (Vitest) |
| `npx playwright test` | End-to-end tests for sign-in, contacts and the pipeline |
| `npm run lint` | Biome checks |

## Project structure

```
src/routes/       one folder per module, plus auth
src/components/   module components (drawers, Kanban board, data table) and UI primitives
src/hooks/        TanStack Query hooks per entity
src/stores/       Zustand stores (auth, UI)
src/lib/          Supabase client, constants, utilities
e2e/              Playwright tests
supabase/         config and migrations
```
