# CRM Web App — Build Prompt for IDE AI Agent

> Copy-paste this entire file as the initial prompt to your AI agent inside
> Antigravity or VS Code (Copilot / Cursor / Claude). It gives the agent full
> context of what's been decided, the architecture, and exactly what to build.

---

## Mission

Build a full-featured CRM web application at `C:\GitHub\CRM-Tecaa\` with the following modules: Contacts, Companies, Pipeline (Deals), Activities, Tasks, and Dashboard. The app uses **React + TypeScript + Vite** for the frontend and **Supabase** for the backend (Postgres, Auth, RLS). The design system is **Linear-inspired dark mode** with all tokens defined in `src/app.css` via Tailwind's `@theme`.

## Before you start

1. **Read `AGENTS.md`** (in this directory) — it contains the full architecture, design tokens, patterns, and rules. Follow it strictly.
2. **Do NOT re-negotiate the stack.** React + Vite + Supabase + Tailwind v4 + Radix UI + TanStack Query is locked.
3. **Do NOT add inline colors.** Use the CSS theme tokens from `@theme` in `app.css`.
4. **Use optimistic updates** for all mutations with rollback on error.
5. **Side drawers** for forms, not centered modals.

## Phase-by-phase execution

Build in this order, one phase at a time. After each phase, verify with `npm run build` (no errors) and `npm run dev` (smoke test in browser).

---

### Phase 0 — Project Scaffold & Design Foundation

1. `npm create vite@latest . -- --template react-ts` (in this directory)
2. Install ALL dependencies:
```
npm install react-router-dom @tanstack/react-query zustand react-hook-form @hookform/resolvers zod
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-tooltip @radix-ui/react-toast
npm install lucide-react clsx tailwind-merge date-fns
npm install -D tailwindcss @tailwindcss/vite biome vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @dnd-kit/core @dnd-kit/sortable
npm install -D supabase @playwright/test
```
3. Configure **Tailwind v4**: in `src/app.css`, replace the default content with `@import "tailwindcss";` and add the full `@theme` block from `AGENTS.md` (Background Hierarchy, Text, Accent, Borders, Semantic Colors, Typography, Border Radius, Spacing).
4. Add **Inter + JetBrains Mono** fonts in `index.html` via Google Fonts.
5. Enable OpenType features `cv01` and `ss03` on Inter in `index.html` CSS.
6. Configure **Biome** — create `biome.json` at root with `"formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 }`, `"linter": { "enabled": true }`, `"javascript": { "formatter": { "quoteStyle": "single" } }`.
7. Configure **Vite** to use Tailwind plugin in `vite.config.ts`.
8. Create the full **directory structure** as listed in `AGENTS.md` (all folders).
9. Build **UI primitives**: Button, Input, Dialog, DropdownMenu, Select, Badge, Tooltip, Toast, Command (Cmd+K palette trigger). Each wraps its Radix UI primitive + applies Linear styling via `cn()` from `src/lib/utils.ts`.
10. Build the **app shell**: Sidebar (collapsible, with nav items and Lucide icons), Topbar (breadcrumb + Cmd+K trigger + user avatar), and `_layout.tsx` using `<Outlet />`.
11. Create `src/lib/utils.ts` with the `cn()` helper using `clsx` + `tailwind-merge`.
12. Create `src/lib/constants.ts` with route paths as constants.

**Verify:** `npm run build` passes, `npm run dev` shows the dark-themed shell with working sidebar.

---

### Phase 1 — Auth & Supabase

1. Initialize Supabase: `npx supabase init`, `npx supabase link --project-ref <your-project-id>`
2. Write the full migration at `supabase/migrations/0001_core_schema.sql` with all 7 tables + RLS policies (see schema in AGENTS.md).
3. Apply: `npx supabase db push`
4. Generate types: `npx supabase gen types typescript --linked > src/types/schema.ts`
5. Create `src/lib/supabase.ts` with the Supabase client using env vars.
6. Create `src/hooks/use-auth.ts` with sign-up, sign-in, sign-out, and session tracking.
7. Create `src/stores/auth-store.ts` to mirror auth state in Zustand.
8. Create `src/components/auth/login-page.tsx` — email/password login with error states.
9. Create `src/components/auth/auth-guard.tsx` — wraps protected routes, redirects to `/login` if unauthenticated.
10. Set up React Router with all route definitions in `App.tsx`: login route, protected routes under the app shell layout.

**Verify:** Login flow works, unauthenticated users are redirected, protected pages render.

---

### Phase 2 — Contacts

1. Create `src/hooks/use-contacts.ts` with TanStack Query hooks (list, create, update, delete) with optimistic updates.
2. Build the contacts list page at `src/routes/contacts/index.tsx`:
   - Data table with columns: Name, Email, Company, Status, Owner, Created
   - Search bar (debounced ILIKE on name)
   - Sortable columns
   - Status badges (active=green, inactive=gray, lead=indigo, archived=text-quaternary)
   - Row click → navigate to detail
   - Bulk selection via checkbox
   - Empty state when no contacts
3. Build the contact detail page at `src/routes/contacts/$id.tsx`:
   - Left panel: contact info (editable inline fields)
   - Right panel: linked deals card + tasks card
   - Bottom: activity timeline
4. Build the contact form (React Hook Form + Zod) and side drawer at `src/components/contacts/contact-drawer.tsx`.
5. Wire "New Contact" button in the topbar/sidebar to open the drawer.

**Verify:** Can create, view, edit, search, and delete contacts. Table renders with correct status colors.

---

### Phase 3 — Companies

Same pattern as Contacts:
1. `src/hooks/use-companies.ts` — TanStack Query hooks
2. Company list: Name, Domain, Industry, Size, Contact count, Owner
3. Company detail: info panel + linked contacts list + deals list
4. Company drawer/form for create/edit

**Verify:** Can create company, link it to existing contacts, see contacts listed on company page.

---

### Phase 4 — Pipeline (Deals)

1. Create `src/hooks/use-deals.ts` with TanStack Query hooks, including stage reordering.
2. Build the Kanban board at `src/routes/pipeline/index.tsx` using `@dnd-kit`:
   - Columns rendered dynamically from `pipeline_stages` table
   - Column header: stage name + color dot + deal count + total value
   - Deal cards show: title, value, contact name, probability %, days in stage
   - Drag card between columns → optimistic update, then persist
   - Closed Won/Lost columns collapsed by default, expandable
3. Build deal side panel at `src/components/pipeline/deal-panel.tsx` (edit form in drawer).
4. Build deal create dialog (quick-create from pipeline page, auto-assigns to current stage).

**Verify:** Can create deals, drag them through stages, values update on drop. Deals appear on contact/company detail pages.

---

### Phase 5 — Activities

1. Create `src/hooks/use-activities.ts`.
2. Build the activity feed at `src/routes/activities/index.tsx`:
   - Filter bar: by type (call/email/meeting/note), date range, owner
   - Chronological list with icons per type
   - Each item links to the related contact/company/deal
3. Build the "Log Activity" dialog with type selector, subject, description, entity link.

**Verify:** Can log activities from the activities page and from contact/company/deal detail pages.

---

### Phase 6 — Tasks

1. Create `src/hooks/use-tasks.ts`.
2. Build tasks page with view toggle (List / Board):
   - **List view**: data table with title, priority, assignee, due date, status
   - **Board view**: Kanban by status (backlog → todo → in_progress → done → cancelled)
3. Priority indicators: urgent=red, high=orange, medium=yellow, low=gray (text colors).
4. Due date badges: overdue=red, today=orange, tomorrow=yellow.
5. Quick checkbox completion (optimistic update).
6. Task create/edit drawer.

**Verify:** Can create, assign, reorder, complete tasks. They appear on contact/deal detail pages when linked.

---

### Phase 7 — Dashboard

1. Create `src/hooks/use-dashboard.ts` — aggregates data across tables.
2. Build dashboard at `src/routes/dashboard/index.tsx`:
   - 4 KPI cards: Active deals count, Pipeline value (sum of open deals), Activities due today, Tasks overdue
   - Pipeline funnel (horizontal bars by stage showing deal count + value)
   - Upcoming activities list (next 5)
   - Recent deals list (last 5 created)
   - My Tasks summary (incomplete tasks assigned to current user)
   - Team Tasks summary (incomplete tasks assigned to others)
3. Each list item is clickable (links to the relevant entity).

**Verify:** Dashboard shows real data from the database, links work, KPIs update after creating deals/tasks.

---

### Phase 8 — Command Palette & Polish

1. Build the Cmd+K command palette at `src/components/ui/command.tsx`:
   - Opens with `Cmd+K`, closes with `Escape`
   - Debounced search (300ms) across contacts, companies, deals (3 parallel queries)
   - Results grouped by type (Contacts / Companies / Deals)
   - Arrow keys + Enter to navigate/select
   - Actions: "New contact", "New deal", "New task", "Log activity"
   - Navigation: type page names or `/shortcuts`
2. Add keyboard shortcuts: `c`=new contact, `d`=new deal, `t`=new task, `g i`=go to activities, `g d`=go to dashboard, `g p`=go to pipeline.
3. Polish sidebar — highlight active route, collapse animation, tooltips on collapsed icons.
4. Ensure all loading states show skeleton screens (not spinners).
5. Ensure all empty states show helpful illustrations/messages with action buttons.

**Verify:** Cmd+K searches correctly, shortcuts work, UI feels polished.

---

### Phase 9 — Settings

1. Pipeline stage manager: add, rename, reorder, delete stages. Color picker per stage.
2. Team manager: list team members with roles, invite dialog (via Supabase admin API).

---

### Phase 10 — Testing

1. Unit tests for all UI primitives (render, click, disabled states).
2. Integration tests for: auth flow (login → redirect), contacts CRUD flow.
3. E2E tests (Playwright): full user journey — login → create contact → assign company → create deal → drag through pipeline → log activity → complete task.

---

## Quality Gates (per phase)

Before moving to the next phase:
- [ ] `npm run build` — zero TypeScript errors, zero build warnings
- [ ] `npm run dev` — manual smoke test in browser
- [ ] `npx biome check .` — zero lint/format issues
- [ ] No inline colors (all via `theme()` or Tailwind utility classes)
- [ ] No `any` types (use generated Supabase types)
- [ ] All mutations use optimistic updates with error rollback
- [ ] All forms use React Hook Form + Zod validation
- [ ] All side drawers (not centered modals) for entity forms

---

## Stuck? Follow the `AGENTS.md`

If you're uncertain about:
- A color → check the `@theme` tokens in `src/app.css`
- A component pattern → reference the UI primitives in `src/components/ui/`
- A data access pattern → check `src/hooks/use-contacts.ts` for the established pattern
- The database schema → check `supabase/migrations/0001_core_schema.sql`
- Build errors → check `.vscode/settings.json` for tooling config

Do not invent workarounds. If something doesn't work, either fix it properly or ask the user.