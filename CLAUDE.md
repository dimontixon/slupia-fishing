# CLAUDE.md

Project context for Claude Code. Read this at the start of every session.

## Project overview

A booking website for fishing spots (sectors) on a specific lake in Poland.
There is a satellite photo of the lake with marked sectors — the site must show
an interactive map: clicking (desktop) or tapping (mobile) a sector opens the
booking flow for it.

Three parts of the system:
1. **Public site** (client-facing) — map view, booking flow, personal account.
2. **Admin panel** — for the lake owner, full control over sectors, booking settings, clients, bookings.
3. **Backend/API** — booking logic, auth, database access.

## Tech stack

- **Next.js 16 (App Router) + TypeScript** — frontend and backend (API routes) in one project
- **PostgreSQL** — main database
- **Prisma** — ORM, schema-as-code, migrations
- **Tailwind CSS + shadcn/ui** — styling and ready-made UI components for the admin panel
- **NextAuth (Auth.js)** — client authentication by phone number
- **SVG** — interactive sector map (polygons over the satellite photo), no map libraries needed (Leaflet etc. are for geographic tile maps, not applicable here)
- **Docker** — used only for local Postgres during development
- **npm** — package manager (not yarn, not pnpm)

## Language & localization

- Client-facing UI — **Polish only** (PL). All labels, messages, confirmations — in Polish.
- Admin panel UI — also Polish (the owner is Polish).
- Currency — **PLN only**, no multi-currency support, price format `123,00 zł`.
- Code comments, variable/function names, commit messages — **English**, as is standard in development. Only user-facing text is Polish.

## Core booking business logic

- Time unit for booking — a **12-hour slot**.
- A slot can only start at fixed times: `12:00` or `18:00` (stored in `BookingSettings`, editable by the owner in the admin panel — never hardcode).
- Booking duration = number of consecutive slots (1 = half a day, 2 = a full day, 3 = 1.5 days, 4 = 2 days, etc.), step = 12 hours.
- `minSlots` / `maxSlots` — minimum and maximum booking duration, configurable by the owner.
- **Bookings for the same sector must never overlap in time.** Overlap check (`startAt`/`endAt`) is mandatory before creating a booking, wrap it in a transaction.
- Price = `slotsCount * sector.basePrice`.
- Booking statuses: `PENDING → CONFIRMED → COMPLETED`, or `CANCELLED`. Whether manual owner confirmation is required is a setting, not hardcoded.
- Client cancellation rule (how many hours/days before arrival cancellation is allowed) is also a setting, not hardcoded.

## Data model (reference, may evolve)

- `Sector` — id, name, polygon (coordinates **as percentages of photo width/height, not px**), isActive, basePrice, notes
- `BookingSettings` — slotStartTimes (array, e.g. `["12:00","18:00"]`), slotStepHours, minSlots, maxSlots, cancellationRules
- `Client` — id, phone (**format +48XXXXXXXXX**), name, createdAt, isBlocked
- `Booking` — id, sectorId, clientId, startAt, endAt, slotsCount, status, totalPrice, createdAt

## Authentication

- Clients: login **only via Polish phone number** (+48), no password, via SMS OTP code.
- **Do not send real SMS in local development** — log the OTP code to the server console instead, to avoid paying for an SMS provider before the project is production-ready.
- Admin panel — a separate login flow, not shared with the client flow.

## Interactive sector map

- Satellite photo as background, `<svg>` with `<polygon>` on top for each sector.
- Polygon coordinates — **in percentages (0–100)**, so the map scales correctly on any screen without recalculation.
- Click and tap are handled by native browser events (`onClick` fires on tap too) — no separate mobile-specific logic needed.
- Sector state (free / booked for selected dates / selected by user) shown via different polygon `fill`/`opacity`.

## Repository structure

- Standard Next.js App Router structure.
- `/admin` — a separate route segment for the admin panel, protected by its own auth check (middleware).
- `prisma/schema.prisma` — source of truth for the data model.
- `.env` — **never commit**, holds `DATABASE_URL` and secrets.

## Git workflow

- Every major feature — its own branch: `feature/short-name` (e.g. `feature/sector-map`, `feature/booking-flow`).
- Before large changes (more than 2-3 files) — use Plan Mode first, agree on the plan, then execute.
- Commit messages — English, short and descriptive (conventional commits welcome: `feat:`, `fix:`, `chore:`).
- Never commit `node_modules`, `.env`, build artifacts — check `.gitignore`.
- Test locally (`npm run dev`, `npx prisma studio`) before committing.

## Out of scope for MVP (don't build unless asked)

- No real SMS provider integration (console log only).
- No online payment integration.
- No deployment — the project runs locally (`npm run dev` + Docker Postgres) until a separate deployment task is requested.
- No multi-currency, no multi-language support — PL and PLN only.
- No drag-and-drop polygon point editing in the admin panel for MVP — editing polygons via JSON/form is enough at this stage.

## Code style

- TypeScript strict mode.
- Functional React components, hooks, no class components.
- Naming: camelCase for variables/functions, PascalCase for components and types.
- Avoid `any` — use Prisma-generated types where possible.