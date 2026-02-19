# Tasks: Database Migration & Clean Architecture Refactor

**Input**: Design documents from `/specs/001-migrate-db-clean-arch/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Not explicitly requested. Test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Clean Architecture directory structure and install new dependencies.

- [ ] T001 Create `src/domain/entities/` `src/domain/repositories/` `src/domain/errors/` directory structure per plan.md
- [ ] T002 Create `src/application/use-cases/` `src/application/dto/` directory structure per plan.md
- [ ] T003 Create `src/infrastructure/database/schema/` `src/infrastructure/database/repositories/` `src/infrastructure/database/migrations/` `src/infrastructure/auth/` `src/infrastructure/api/` directory structure per plan.md
- [ ] T004 Create `src/presentation/` directory and move `app/` `components/` `hooks/` into `src/presentation/` per plan.md
- [ ] T005 Install Drizzle ORM dependencies: `drizzle-orm` `pg` `@types/pg` `drizzle-kit` in package.json
- [ ] T006 Install NextAuth.js v5 dependencies: `next-auth@beta` `@auth/drizzle-adapter` in package.json
- [ ] T007 Remove Supabase dependencies: `@supabase/ssr` `@supabase/supabase-js` from package.json
- [ ] T008 Update `tsconfig.json` path aliases to reflect `src/` structure (`@/domain/*`, `@/application/*`, `@/infrastructure/*`, `@/presentation/*`)
- [ ] T009 Update `.env.example` replacing Supabase vars with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` per quickstart.md
- [ ] T010 Update `next.config.mjs` to adjust source directories if needed for `src/presentation/app`

**Checkpoint**: Directory structure created, dependencies installed, old Supabase packages removed. Project should still compile (with errors from removed imports - expected).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain entities, database schema, auth system, and DI container that ALL user stories depend on.

**WARNING**: No user story work can begin until this phase is complete.

### Domain Layer (Zero Dependencies)

- [ ] T011 [P] Create User entity interface in `src/domain/entities/user.ts` (id, name, email, field, experienceLevel, interests, credits, onboardingCompleted, region, bio, image, createdAt, updatedAt)
- [ ] T012 [P] Create Simulation entity interface in `src/domain/entities/simulation.ts` (id, userId, title, context, domain, difficulty, level, techStack, overview, milestones, resources, quiz, etc.)
- [ ] T013 [P] Create Persona entity interface in `src/domain/entities/persona.ts` (id, simulationId, name, role, personality, systemPrompt, initialMessage)
- [ ] T014 [P] Create InternProgress entity interface in `src/domain/entities/progress.ts` (id, userId, projectId, status, lastActivityAt, lastReviewAt, lastReviewApproved)
- [ ] T015 [P] Create IUserRepository interface in `src/domain/repositories/user-repository.ts` (findById, findByEmail, create, update, updateCredits)
- [ ] T016 [P] Create ISimulationRepository interface in `src/domain/repositories/simulation-repository.ts` (findById, findByUserId, create, delete)
- [ ] T017 [P] Create IPersonaRepository interface in `src/domain/repositories/persona-repository.ts` (findBySimulationId, createMany)
- [ ] T018 [P] Create IProgressRepository interface in `src/domain/repositories/progress-repository.ts` (findByUserId, upsert)
- [ ] T019 [P] Create base AppError class in `src/domain/errors/app-error.ts` with subclasses NotFoundError, AuthError, ValidationError in `src/domain/errors/`

### Database Schema (Drizzle)

- [ ] T020 Create Drizzle client instance and connection pool in `src/infrastructure/database/drizzle.ts` using `DATABASE_URL` env var
- [ ] T021 [P] Create users table schema in `src/infrastructure/database/schema/users.ts` per data-model.md (NextAuth fields + profile fields merged)
- [ ] T022 [P] Create accounts table schema in `src/infrastructure/database/schema/accounts.ts` per data-model.md (NextAuth OAuth)
- [ ] T023 [P] Create sessions table schema in `src/infrastructure/database/schema/sessions.ts` per data-model.md (NextAuth sessions)
- [ ] T024 [P] Create verification_tokens table schema in `src/infrastructure/database/schema/verification-tokens.ts` per data-model.md
- [ ] T025 [P] Create simulations table schema in `src/infrastructure/database/schema/simulations.ts` per data-model.md
- [ ] T026 [P] Create personas table schema in `src/infrastructure/database/schema/personas.ts` per data-model.md
- [ ] T027 [P] Create intern_progress table schema in `src/infrastructure/database/schema/intern-progress.ts` per data-model.md
- [ ] T028 Create barrel export in `src/infrastructure/database/schema/index.ts` exporting all table schemas
- [ ] T029 Create `drizzle.config.ts` at project root for drizzle-kit migration tool pointing to `src/infrastructure/database/schema`
- [ ] T030 Run `npx drizzle-kit generate` to create initial migration files in `src/infrastructure/database/migrations/`
- [ ] T031 Run `npx drizzle-kit push` to apply schema to self-hosted Postgres database

### Repository Implementations (Drizzle)

- [ ] T032 [P] Implement DrizzleUserRepository in `src/infrastructure/database/repositories/drizzle-user-repository.ts` implementing IUserRepository
- [ ] T033 [P] Implement DrizzleSimulationRepository in `src/infrastructure/database/repositories/drizzle-simulation-repository.ts` implementing ISimulationRepository
- [ ] T034 [P] Implement DrizzlePersonaRepository in `src/infrastructure/database/repositories/drizzle-persona-repository.ts` implementing IPersonaRepository
- [ ] T035 [P] Implement DrizzleProgressRepository in `src/infrastructure/database/repositories/drizzle-progress-repository.ts` implementing IProgressRepository

### Auth System (NextAuth.js)

- [ ] T036 Create NextAuth.js configuration in `src/infrastructure/auth/auth.config.ts` with Credentials provider (email/password), Drizzle adapter, session strategy (JWT)
- [ ] T037 Create NextAuth.js handler in `src/infrastructure/auth/auth.ts` exporting handlers, auth, signIn, signOut
- [ ] T038 Create `src/presentation/app/api/auth/[...nextauth]/route.ts` exporting GET and POST from auth handler
- [ ] T039 Rewrite `middleware.ts` to use NextAuth.js `auth()` for route protection (replace Supabase middleware), keep PROTECTED_ROUTES and AUTH_ROUTES logic

### Dependency Injection

- [ ] T040 Create DI container in `src/infrastructure/container.ts` exporting singleton instances of all repositories (db, userRepo, simulationRepo, personaRepo, progressRepo)

### DTOs

- [ ] T041 [P] Create UserDTO, CreateUserDTO, UpdateUserDTO in `src/application/dto/user-dto.ts`
- [ ] T042 [P] Create SimulationDTO, CreateSimulationDTO in `src/application/dto/simulation-dto.ts`
- [ ] T043 [P] Create CreditResult DTO in `src/application/dto/credit-dto.ts`
- [ ] T044 [P] Create UserProject DTO in `src/application/dto/project-dto.ts`

**Checkpoint**: Foundation ready - domain layer, database connected, auth system working, DI container assembled. User story implementation can now begin.

---

## Phase 3: User Story 1 - Developer Onboarding & Productivity (Priority: P1) MVP

**Goal**: Clean Architecture structure is in place with clear separation of concerns. Business logic lives in use cases, DB access lives in repositories, UI lives in presentation layer.

**Independent Test**: A developer can identify domain vs infrastructure layers in under 5 minutes. Changing a DB query in a repository does NOT require changes to any use-case file.

### Use Cases for User Story 1

- [ ] T045 [P] [US1] Create login use case in `src/application/use-cases/auth/login.ts` (validate credentials via repository, return user or error)
- [ ] T046 [P] [US1] Create signup use case in `src/application/use-cases/auth/signup.ts` (validate input with Zod, create user via repository, hash password)
- [ ] T047 [P] [US1] Create signout use case in `src/application/use-cases/auth/signout.ts`
- [ ] T048 [P] [US1] Create complete-onboarding use case in `src/application/use-cases/onboarding/complete-onboarding.ts` (update profile fields)
- [ ] T049 [P] [US1] Create get-credits use case in `src/application/use-cases/credits/get-credits.ts`
- [ ] T050 [P] [US1] Create check-and-deduct use case in `src/application/use-cases/credits/check-and-deduct.ts` (atomic credit deduction)
- [ ] T051 [P] [US1] Create add-credits use case in `src/application/use-cases/credits/add-credits.ts`
- [ ] T052 [P] [US1] Create get-user-projects use case in `src/application/use-cases/projects/get-user-projects.ts` (merge predefined + custom)
- [ ] T053 [P] [US1] Create upsert-progress use case in `src/application/use-cases/progress/upsert-progress.ts`

### Server Actions (Thin Wrappers)

- [ ] T054 [US1] Rewrite `src/presentation/app/(auth)/actions.ts` to call use cases via DI container instead of direct Supabase. Use NextAuth signIn/signOut.
- [ ] T055 [US1] Rewrite `src/presentation/app/(dashboard)/actions.ts` to call onboarding use case via DI container
- [ ] T056 [US1] Rewrite `src/presentation/app/actions/credits.ts` to call credit use cases via DI container
- [ ] T057 [US1] Rewrite `src/presentation/app/actions/projects.ts` to call get-user-projects use case via DI container

### API Routes

- [ ] T058 [US1] Rewrite `src/presentation/app/api/progress/route.ts` to use NextAuth session + progress use case instead of Supabase
- [ ] T059 [P] [US1] Create backend API client in `src/infrastructure/api/backend-client.ts` consolidating fetch calls to Python backend

### Presentation Layer Updates

- [ ] T060 [US1] Update `src/presentation/app/(dashboard)/layout.tsx` to use NextAuth session (`auth()`) + user repository instead of Supabase
- [ ] T061 [US1] Update `src/presentation/components/dashboard/AppSidebar.tsx` to use NextAuth session instead of Supabase client
- [ ] T062 [US1] Remove `ProjectPresence.tsx` Supabase Realtime usage (defer presence to Phase 2, show "coming soon" badge)

### Cleanup

- [ ] T063 [US1] Delete `src/presentation/lib/supabase/` directory entirely (client.ts, server.ts, middleware.ts, utils.ts, database.types.ts)
- [ ] T064 [US1] Move `src/presentation/lib/tasks.ts`, `src/presentation/lib/resources.ts`, `src/presentation/lib/api.ts`, `src/presentation/lib/utils.ts` to `src/presentation/lib/`

**Checkpoint**: Clean Architecture fully operational. All auth/DB calls go through use-cases and repositories. Zero Supabase imports remain. Login, signup, dashboard, projects page work.

---

## Phase 4: User Story 2 - Seamless Database Transition (Priority: P1)

**Goal**: All critical paths (Login, Project Creation, Dashboard, Simulation Generation) work identically using the self-hosted Postgres database. Data is persisted and retrieved correctly.

**Independent Test**: A user can sign up, log in, generate a simulation, view projects, and see credits - all data persists in the self-hosted DB.

### Next.js Pages (Supabase Removal)

- [ ] T065 [P] [US2] Update `src/presentation/app/(auth)/login/page.tsx` removing any Supabase client references (should use server action)
- [ ] T066 [P] [US2] Update `src/presentation/app/(auth)/signup/page.tsx` removing any Supabase client references
- [ ] T067 [P] [US2] Update `src/presentation/app/(auth)/onboarding/page.tsx` to use NextAuth session instead of Supabase
- [ ] T068 [US2] Update `src/presentation/app/(dashboard)/dashboard/page.tsx` to use NextAuth session + user repository for profile data
- [ ] T069 [P] [US2] Update `src/presentation/app/(dashboard)/dashboard/projects/page.tsx` removing Supabase, using projects action
- [ ] T070 [P] [US2] Update `src/presentation/app/(dashboard)/dashboard/profile/page.tsx` removing Supabase, using auth session
- [ ] T071 [P] [US2] Update `src/presentation/app/(dashboard)/dashboard/progress/page.tsx` removing Supabase
- [ ] T072 [P] [US2] Update `src/presentation/app/(dashboard)/dashboard/resources/page.tsx` removing Supabase if present

### API Routes (Supabase Removal)

- [ ] T073 [US2] Update `src/presentation/app/api/chat/route.ts` if it uses Supabase, replace with backend-client
- [ ] T074 [US2] Update `src/presentation/app/api/generate-simulation/route.ts` if it uses Supabase, replace with backend-client
- [ ] T075 [US2] Update `src/presentation/app/api/github/push/route.ts` replacing Supabase with NextAuth session
- [ ] T076 [US2] Update `src/presentation/app/api/notify-review/route.ts` replacing Supabase with NextAuth session
- [ ] T077 [US2] Delete `src/presentation/app/auth/confirm/route.ts` (Supabase email confirmation - no longer needed)
- [ ] T078 [US2] Delete `src/presentation/app/auth/callback/route.ts` (Supabase OAuth callback - replaced by NextAuth)

### Dashboard Pages & Components

- [ ] T079 [US2] Update `src/presentation/app/(dashboard)/project/[id]/page.tsx` removing Supabase
- [ ] T080 [US2] Update `src/presentation/app/(dashboard)/simulations/[id]/page.tsx` removing Supabase, using simulation repository

### Python Backend Migration

- [ ] T081 [US2] Replace Supabase Python client with `psycopg2` or `asyncpg` in `backend/main.py` for simulation/persona inserts
- [ ] T082 [US2] Create database connection module in `backend/infrastructure/database.py` using `DATABASE_URL` env var
- [ ] T083 [US2] Update `backend/main.py` to import from new `infrastructure/database.py` instead of `supabase`
- [ ] T084 [US2] Remove `supabase` from `backend/requirements.txt`, add `psycopg2-binary` or `asyncpg`
- [ ] T085 [US2] Restructure backend into `backend/domain/`, `backend/application/`, `backend/infrastructure/`, `backend/api/` per plan.md

### Full Validation

- [ ] T086 [US2] Run full application smoke test: signup -> login -> dashboard -> generate simulation -> view project -> credits flow
- [ ] T087 [US2] Verify zero imports of `@supabase/*` remain in codebase with `grep -r "supabase" src/ --include="*.ts" --include="*.tsx"`

**Checkpoint**: All pages and API routes work with self-hosted Postgres. Zero Supabase dependencies. Complete functional parity achieved.

---

## Phase 5: User Story 3 - Infrastructure Autonomy (Priority: P2)

**Goal**: Deployment to Coolify is fully automated with no manual database steps. Migrations run on deploy.

**Independent Test**: `git push` to Coolify triggers a successful build + deploy with automated DB migration.

### Deployment Configuration

- [ ] T088 [US3] Update `Dockerfile` to remove `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` build args, add `DATABASE_URL` and `NEXTAUTH_SECRET`
- [ ] T089 [US3] Add migration step to `Dockerfile` build stage: `RUN npx drizzle-kit push` (or a custom migration script)
- [ ] T090 [US3] Update `.dockerignore` to exclude `specs/`, `.specify/`, `.agent/`
- [ ] T091 [US3] Create `scripts/migrate.sh` script that runs `npx drizzle-kit push` with error handling and rollback notification
- [ ] T092 [US3] Update `backend/Dockerfile` to include new dependency structure and `DATABASE_URL` env var
- [ ] T093 [US3] Update `.env.example` with final production-ready variable list

### Connection Resilience

- [ ] T094 [US3] Add connection retry logic to `src/infrastructure/database/drizzle.ts` (exponential backoff, max 3 retries)
- [ ] T095 [US3] Add health check endpoint in `src/presentation/app/api/health/route.ts` that verifies DB connection
- [ ] T096 [US3] Add connection retry logic to `backend/infrastructure/database.py` for Python backend

**Checkpoint**: Deployment is fully automated. Push to git -> Coolify builds -> migrations run -> app starts with self-hosted DB.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and final validation across all stories.

- [ ] T097 [P] Update `WALKTHROUGH.md` with new architecture overview and setup instructions
- [ ] T098 [P] Update `README.md` with new tech stack, setup instructions, and architecture diagram
- [ ] T099 Remove unused files: `Start project.py`, `explore_daytona.py`, `test_frontend_connection.py`, `test_list_models.py`, `test_llm_direct.py`, `test_simple_model.py`, `tsc_errors.txt`, `tsc_errors_2.txt`, `available_models.txt`, `log.json`
- [ ] T100 Remove unused backend test files: `backend/test_*.py`, `backend/measure_import.py`, `backend/verify_*.py`
- [ ] T101 [P] Remove `supabase/` directory at project root (Supabase local dev config)
- [ ] T102 Code review pass: verify all imports use new `@/domain`, `@/application`, `@/infrastructure`, `@/presentation` path aliases
- [ ] T103 Run `npm run build` to verify production build succeeds with zero errors
- [ ] T104 Run quickstart.md validation: follow setup guide from scratch on clean environment
- [ ] T105 Final commit with conventional commit message: `feat: migrate to self-hosted postgres and clean architecture`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (uses the same use cases and repositories)
- **User Story 3 (Phase 5)**: Depends on Phase 4 completion (needs all code migrated before deployment update)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Clean Architecture)**: Can start after Phase 2. Creates the use cases and wrappers.
- **User Story 2 (P1 - Database Transition)**: Depends on US1 being complete (needs the use cases to exist before migrating pages/routes to use them).
- **User Story 3 (P2 - Infra Autonomy)**: Depends on US2 being complete (needs the full codebase migrated before updating deployment).

### Within Each User Story

- Use cases before server actions (actions call use cases)
- Server actions before page updates (pages call actions)
- Core pages before auxiliary pages
- Next.js before Python backend (frontend drives the data contract)

### Parallel Opportunities

**Phase 2 (Foundational)**:
- T011-T019 (all domain entities, repos, errors) can run in parallel
- T021-T027 (all DB schema files) can run in parallel
- T032-T035 (all repository implementations) can run in parallel
- T041-T044 (all DTOs) can run in parallel

**Phase 3 (US1)**:
- T045-T053 (all use cases) can run in parallel once domain layer exists
- T065-T072 (page updates) can run in parallel once server actions exist

**Phase 4 (US2)**:
- T065-T072 (page updates) can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all domain entities in parallel:
Task T011: "Create User entity in src/domain/entities/user.ts"
Task T012: "Create Simulation entity in src/domain/entities/simulation.ts"
Task T013: "Create Persona entity in src/domain/entities/persona.ts"
Task T014: "Create InternProgress entity in src/domain/entities/progress.ts"

# Launch all repository interfaces in parallel:
Task T015: "Create IUserRepository in src/domain/repositories/user-repository.ts"
Task T016: "Create ISimulationRepository in src/domain/repositories/simulation-repository.ts"
Task T017: "Create IPersonaRepository in src/domain/repositories/persona-repository.ts"
Task T018: "Create IProgressRepository in src/domain/repositories/progress-repository.ts"

# Launch all DB schemas in parallel:
Task T021: "Create users schema in src/infrastructure/database/schema/users.ts"
Task T022: "Create accounts schema in src/infrastructure/database/schema/accounts.ts"
...
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3)

1. Complete Phase 1: Setup (directory structure, dependencies)
2. Complete Phase 2: Foundational (domain, DB schema, auth, DI)
3. Complete Phase 3: User Story 1 (use cases, server actions, core page updates)
4. **STOP and VALIDATE**: Build succeeds, login/signup/dashboard work with new architecture
5. Deploy to staging if ready

### Incremental Delivery

1. Setup + Foundational -> Architecture skeleton ready
2. Add US1 (Clean Architecture) -> Code structure validated, core flows work
3. Add US2 (DB Transition) -> All pages migrated, Supabase eliminated
4. Add US3 (Infra Autonomy) -> Deployment automated, production ready
5. Polish -> Documentation, cleanup, final validation

### Solo Developer Strategy (Recommended)

Since this is a single-developer project:

1. Work phases sequentially: Phase 1 -> 2 -> 3 -> 4 -> 5 -> 6
2. Within each phase, batch parallel tasks together
3. Commit after each phase completion
4. Test incrementally: build after each major task group

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total: **105 tasks** across 6 phases
- Commit after each phase or logical group
- Stop at any checkpoint to validate independently
- The Python backend restructure (T081-T085) can be deferred if time-constrained; core migration is Next.js-focused
