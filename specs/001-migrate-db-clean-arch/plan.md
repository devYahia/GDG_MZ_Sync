# Implementation Plan: Database Migration & Clean Architecture Refactor

**Branch**: `001-migrate-db-clean-arch` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-migrate-db-clean-arch/spec.md`

## Summary

Migrate the Interna. Virtual platform from Supabase (SaaS) to a self-hosted PostgreSQL database running on a Coolify container, replacing all Supabase dependencies (Auth, DB Client, Realtime) with self-owned alternatives (NextAuth.js, Drizzle ORM). Simultaneously, restructure the entire codebase following Clean Architecture principles to achieve maximum scalability, maintainability, and contributor friendliness.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict), Python 3.10+
**Primary Dependencies**: Next.js 14.2.x, Drizzle ORM, NextAuth.js v5, FastAPI, Tailwind CSS v4, Shadcn UI
**Storage**: PostgreSQL 14+ (self-hosted container at `kcwgkswc004owgws848s4oks:5432`)
**Testing**: Vitest (unit/integration), Playwright (e2e - future)
**Target Platform**: Linux server (Coolify CI/CD), Web browser
**Project Type**: Web application (Next.js monorepo + Python microservice)
**Performance Goals**: TTFB < 200ms, Cold start < 3s
**Constraints**: Zero Supabase SaaS dependency post-refactor, all data in self-hosted Postgres
**Scale/Scope**: ~26 files with Supabase imports, 4 DB tables, 7 API routes, ~70 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution template is not yet customized. However, the user's global rules serve as the effective constitution. Validation:

| Gate | Status | Notes |
|------|--------|-------|
| TypeScript Strict mode | PASS | Maintained |
| Next.js 14.2.x App Router | PASS | No version change |
| Tailwind CSS v4 | PASS | No change |
| Shadcn UI + Lucide React | PASS | No change |
| Server Actions for Mutations | PASS | All mutations remain server actions |
| Zod validation for all inputs | PASS | Maintained |
| Responsive by default | PASS | UI layer unchanged |
| Atomic DB operations | PASS | Drizzle transactions replace Supabase atomic ops |
| Separate Admin/Customer tables | PASS | Maintained via schema design |
| next/font/google only | PASS | No change |
| SemVer + Conventional Commits | PASS | Will follow |
| No node_modules in git | PASS | .gitignore enforced |

**Result**: All gates PASS. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/001-migrate-db-clean-arch/
  plan.md              # This file
  spec.md              # Feature specification
  research.md          # Phase 0: All research decisions
  data-model.md        # Phase 1: Complete data model
  quickstart.md        # Phase 1: Developer quickstart
  contracts/
    api-contracts.md   # Phase 1: API contracts & repository interfaces
  checklists/
    requirements.md    # Spec quality checklist
```

### Source Code (repository root)

```text
src/
  domain/
    entities/
      user.ts                    # User entity interface
      simulation.ts              # Simulation entity interface
      persona.ts                 # Persona entity interface
      progress.ts                # InternProgress entity interface
    repositories/
      user-repository.ts         # IUserRepository interface
      simulation-repository.ts   # ISimulationRepository interface
      persona-repository.ts      # IPersonaRepository interface
      progress-repository.ts     # IProgressRepository interface
    errors/
      app-error.ts               # Base application error
      not-found-error.ts         # Entity not found
      auth-error.ts              # Authentication errors
      validation-error.ts        # Input validation errors

  application/
    use-cases/
      auth/
        login.ts                 # Login use case
        signup.ts                # Signup use case
        signout.ts               # Signout use case
      onboarding/
        complete-onboarding.ts   # Onboarding completion
      credits/
        check-and-deduct.ts      # Credit deduction
        get-credits.ts           # Credit query
        add-credits.ts           # Credit addition
      projects/
        get-user-projects.ts     # Merged project list
      progress/
        upsert-progress.ts       # Progress tracking
    dto/
      user-dto.ts
      simulation-dto.ts
      credit-dto.ts
      project-dto.ts

  infrastructure/
    database/
      drizzle.ts                 # Drizzle client instance
      schema/
        users.ts                 # Users table (NextAuth + profile)
        accounts.ts              # Accounts table (NextAuth)
        sessions.ts              # Sessions table (NextAuth)
        verification-tokens.ts   # Verification tokens (NextAuth)
        simulations.ts           # Simulations table
        personas.ts              # Personas table
        intern-progress.ts       # Progress table
        index.ts                 # Schema barrel export
      repositories/
        drizzle-user-repository.ts
        drizzle-simulation-repository.ts
        drizzle-persona-repository.ts
        drizzle-progress-repository.ts
      migrations/                # Drizzle-kit auto-generated
    auth/
      auth.config.ts             # NextAuth.js configuration
      auth.ts                    # NextAuth.js handler
      actions.ts                 # Auth server actions
    api/
      backend-client.ts          # Python backend API client
    container.ts                 # Dependency injection container

  presentation/
    app/                         # Next.js App Router (existing pages, refactored)
      (auth)/
        login/page.tsx
        signup/page.tsx
        onboarding/page.tsx
        actions.ts               # Thin wrapper calling use cases
      (dashboard)/
        layout.tsx
        dashboard/
          page.tsx
          projects/page.tsx
          profile/page.tsx
          progress/page.tsx
          resources/page.tsx
        project/[id]/page.tsx
        simulations/[id]/page.tsx
        code-review/page.tsx
        ide/page.tsx
        sandbox/page.tsx
        actions.ts               # Thin wrapper calling use cases
      api/
        auth/[...nextauth]/route.ts  # NextAuth.js API route
        progress/route.ts
        chat/route.ts
        generate-simulation/route.ts
        github/push/route.ts
        notify-review/route.ts
      page.tsx                   # Landing page
      layout.tsx                 # Root layout
      globals.css
    components/                  # All React components (moved from /components)
      ui/                        # Shadcn UI primitives
      dashboard/                 # Dashboard-specific components
      project/                   # Project-specific components
      landing/                   # Landing page components
      ide/                       # IDE components
      providers/                 # Context providers
    hooks/                       # Custom React hooks
    lib/
      utils.ts                   # Utility functions
      tasks.ts                   # Predefined task data
      resources.ts               # Learning resources data
      api.ts                     # API type definitions

backend/
  domain/
    models.py                    # Pydantic models (from schemas.py)
  application/
    llm_service.py               # LLM orchestration
    enhanced_review_service.py   # Code review service
    repo_service.py              # Repository operations
    daytona_service.py           # Workspace management
  infrastructure/
    database.py                  # asyncpg/psycopg2 connection
    constants.py                 # Configuration constants
  api/
    main.py                      # FastAPI app + routes
```

**Structure Decision**: Clean Architecture with 4 layers (domain, application, infrastructure, presentation) applied to the Next.js monorepo. The `src/` directory contains all application code organized by architectural layer. The `presentation/` layer maps directly to Next.js conventions (app router, components). The Python backend follows a similar but lighter structure.

## Complexity Tracking

| Decision | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|--------------------------------------|
| Repository pattern | Decouples business logic from DB framework | Direct Drizzle calls in server actions would couple every action to ORM |
| DI Container | Provides testability without mocks | Manual instantiation would scatter `new DrizzleXRepository(db)` everywhere |
| 4-layer architecture | Ensures long-term maintainability | 2-layer (route + db) would not scale and mixes concerns |
| NextAuth.js | Full auth independence | Keeping Supabase Auth contradicts the migration goal |

## Phases Summary

| Phase | Deliverable | Status |
|-------|------------|--------|
| Phase 0 | [research.md](./research.md) | COMPLETE |
| Phase 1 | [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md) | COMPLETE |
| Phase 2 | [tasks.md](./tasks.md) | COMPLETE |
