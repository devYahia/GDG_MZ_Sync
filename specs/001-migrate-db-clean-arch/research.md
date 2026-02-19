# Research: Database Migration & Clean Architecture Refactor

**Branch**: `001-migrate-db-clean-arch`
**Date**: 2026-02-17

---

## R-001: Supabase Dependency Audit

### Current State

The project uses Supabase in **two distinct layers**:

#### Layer 1: Frontend (Next.js) - Supabase SSR Client
| File | Supabase Usage |
|------|---------------|
| `lib/supabase/client.ts` | `createBrowserClient()` - Client-side Supabase |
| `lib/supabase/server.ts` | `createServerClient()` - Server-side Supabase |
| `lib/supabase/middleware.ts` | `createServerClient()` - Auth middleware (session refresh, route guards) |
| `lib/supabase/utils.ts` | `getCurrentUser()`, `isAuthenticated()` helpers |
| `middleware.ts` | Imports from `lib/supabase/middleware` |
| `app/(auth)/actions.ts` | `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`, `supabase.from("profiles")` |
| `app/(dashboard)/actions.ts` | `supabase.auth.getUser()`, `supabase.from("profiles").update()` |
| `app/(dashboard)/layout.tsx` | `supabase.auth.getUser()`, `supabase.from("profiles").select()` |
| `app/actions/credits.ts` | `supabase.from("profiles").select/update()` for credits |
| `app/actions/projects.ts` | `supabase.from("intern_progress")`, `supabase.from("simulations")` |
| `app/api/progress/route.ts` | `supabase.from("intern_progress").upsert()` |
| `app/api/notify-review/route.ts` | Supabase client usage |
| `app/api/github/push/route.ts` | Supabase client usage |
| `components/dashboard/AppSidebar.tsx` | Supabase client for user data |
| `components/project/ProjectPresence.tsx` | Supabase Realtime (presence) |

#### Layer 2: Backend (Python/FastAPI) - Supabase Python Client
| File | Supabase Usage |
|------|---------------|
| `backend/main.py` | `create_client(url, key)` - Service role client, `supabase.table("simulations").insert()`, `supabase.table("personas").insert()` |

### Tables Identified (from `database.types.ts` + code usage)
1. **profiles** - User profile data, credits, onboarding state
2. **intern_progress** - Task/project progress tracking per user
3. **simulations** - AI-generated simulation storage
4. **personas** - Simulation personas (linked to simulations)

### NPM Packages to Remove
- `@supabase/ssr` (^0.8.0)
- `@supabase/supabase-js` (^2.95.3)

### Python Packages to Remove
- `supabase` (in `backend/requirements.txt`)

---

## R-002: Authentication Strategy

### Decision: **NextAuth.js (Auth.js v5)**

### Rationale
- **Full autonomy**: No external SaaS dependency for auth.
- **Direct Postgres integration**: Uses the same self-hosted DB via Prisma/Drizzle adapter.
- **Built-in middleware**: Replaces Supabase middleware for route guards.
- **Session management**: JWT or Database sessions, both supported.
- **Next.js native**: First-class support for App Router, Server Components, Server Actions.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|-----------------|
| Keep Supabase Auth | Maintains SaaS dependency; contradicts project goal |
| Lucia Auth | Deprecated; maintainer recommends rolling your own |
| Custom JWT | Too much boilerplate; reinventing the wheel |
| Clerk/Auth0 | External SaaS; same issue as Supabase |

### Migration Path
1. Current Supabase Auth stores users in `auth.users` (Supabase-managed schema).
2. NextAuth.js will create its own tables: `users`, `accounts`, `sessions`, `verification_tokens`.
3. The existing `profiles` table concept merges into the `users` table with extra columns.

---

## R-003: ORM / Data Access Choice

### Decision: **Drizzle ORM**

### Rationale
- **Lightweight**: ~7.4kb bundle, minimal runtime overhead.
- **Type-safe**: Full TypeScript inference from schema definitions.
- **SQL-like**: API mirrors SQL closely; no query-language abstraction layer.
- **Migration system**: Built-in `drizzle-kit` for schema migrations.
- **Perfect for Clean Architecture**: Schema definitions are separate from query logic; repository pattern fits naturally.
- **Edge/Serverless ready**: Works in Edge Runtime (important for middleware).

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|-----------------|
| Prisma | Heavier binary engine (~15MB), slower cold starts, less SQL-like |
| Kysely | No migration system built-in; more boilerplate |
| Raw `pg` | No type safety; too much boilerplate for repository pattern |

---

## R-004: Data Migration Strategy

### Decision: **Fresh Start (Schema Parity)**

### Rationale
- The project is in early/hackathon stage; existing data is test/demo data.
- A fresh schema allows us to design the ideal normalized structure without legacy constraints.
- The schema will maintain **functional parity** with current tables (profiles, simulations, personas, intern_progress) but with proper relationships, constraints, and indexes.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|-----------------|
| Full data migration | Unnecessary complexity for demo/test data |
| Schema-only migration | Same as fresh start but with extra steps |

---

## R-005: Clean Architecture Layer Mapping

### Decision: Layered Architecture for Next.js Monorepo

The project is a **Next.js monorepo** with a **Python FastAPI backend**. Clean Architecture is applied within each.

### Next.js (Frontend + BFF):
```
src/
  domain/           # Entities, value objects, interfaces (ZERO dependencies)
    entities/        # User, Project, Simulation (plain TS interfaces)
    repositories/    # Repository interfaces (contracts)
    errors/          # Domain-specific error types

  application/       # Use cases (depends ONLY on domain)
    use-cases/       # Business logic orchestration
    dto/             # Data Transfer Objects

  infrastructure/    # Framework adapters (depends on domain + application)
    database/        # Drizzle schema, repository implementations
    auth/            # NextAuth.js config, adapters
    api/             # External API clients (Gemini, GitHub)

  presentation/      # UI Layer (Next.js App Router)
    app/             # Route handlers, pages, layouts
    components/      # React components
    hooks/           # Custom React hooks
    providers/       # Context providers
```

### Python Backend (FastAPI):
```
backend/
  domain/            # Pydantic models (entities)
  application/       # Service layer (LLM orchestration)
  infrastructure/    # DB access (psycopg2/asyncpg), external APIs
  api/               # FastAPI routes (thin controllers)
```

---

## R-006: Self-Hosted Postgres Connection

### Decision: Direct `pg` driver via Drizzle

**Connection string**: `postgres://postgres:***@kcwgkswc004owgws848s4oks:5432/postgres`

### Implementation
- **Next.js**: `drizzle-orm/node-postgres` with connection pooling.
- **Python Backend**: `psycopg2` or `asyncpg` (replacing Supabase Python client).
- **Connection pooling**: Use `pg` Pool with `max: 10` connections.
- **SSL**: Disabled for internal container network (both services in same Coolify stack).

---

## R-007: Realtime Replacement

### Current Usage
- `components/project/ProjectPresence.tsx` uses Supabase Realtime for presence tracking.

### Decision: **Defer to Phase 2**
Realtime features are non-critical for MVP. If needed later, options:
- **Ably** (free tier, simple API)
- **Socket.io** (self-hosted, more control)
- **Liveblocks** (presence-specific, generous free tier)

For now, remove the Realtime dependency and mark the feature as "coming soon."

---

## R-008: Row-Level Security Replacement

### Current Usage
- Supabase RLS policies on all tables.

### Decision: **Application-Level Security**
Since we are moving away from Supabase's built-in RLS:
1. **Server Actions**: All mutations go through Next.js Server Actions which validate `session.user.id` before any DB query.
2. **Repository Pattern**: Every repository method requires a `userId` parameter; queries are always scoped.
3. **Middleware**: NextAuth.js middleware guards protected routes.
4. **Postgres RLS**: Optionally enabled on the self-hosted DB as a defense-in-depth layer (using the app user's role).

This is equivalent to "application-level RLS" and matches the existing pattern in `app/actions/*.ts`.
