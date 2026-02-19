# Feature Specification: Database Migration and Clean Architecture Refactor

**Feature Branch**: `001-migrate-db-clean-arch`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "تحليل شامل وتجهيز ما قبل الريفاكتور للتمقال من سوبا بيز الي داتا بيز مستقلة وتطبيق Clean Architecture"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Onboarding & Productivity (Priority: P1)

As a contributor, I want to see a clear project structure following Clean Architecture principles so that I can understand where code belongs and add new features without creating technical debt.

**Why this priority**: Scalability and maintainability are primary goals of this refactor. A clear structure is essential for long-term project health.

**Independent Test**: A developer unfamiliar with the project can identify the "Entity" layer vs "Framework" layer in under 5 minutes.

**Acceptance Scenarios**:
1. **Given** a new feature request, **When** searching for where to put business logic, **Then** it is clearly located in a `use-cases` or `domain` folder separate from UI/DB code.
2. **Given** a change in the database schema, **When** updating the repository implementation, **Then** no business logic files require modification.

---

### User Story 2 - Seamless Database Transition (Priority: P1)

As a user, I want the application to remain functional and performant after the migration to the self-hosted database so that my experience is uninterrupted.

**Why this priority**: High risk. Migrating the core data source must not break existing features.

**Independent Test**: All critical paths (Login, Project Creation, Dashboard) work identically using the new Postgres connection.

**Acceptance Scenarios**:
1. **Given** the app is connected to the self-hosted Postgres, **When** a user performs a transaction, **Then** data is correctly persisted and retrieved from the new DB.
2. **Given** a high-load simulation, **When** using the self-hosted container, **Then** performance meets or exceeds the previous Supabase benchmarks.

---

### User Story 3 - Infrastructure Autonomy (Priority: P2)

As a project owner, I want to host my own database on my infrastructure (Coolify/Container) to reduce dependency on SaaS providers and have full control over data.

**Why this priority**: Business requirement for control and "physiological security isolation".

**Independent Test**: The database can be fully managed, backed up, and restored independently of the Supabase dashboard.

**Acceptance Scenarios**:
1. **Given** the new Postgres URL, **When** the app is deployed via Coolify, **Then** it automatically connects and runs migrations.

---

### Edge Cases

- **Connection Interruption**: How does the system handle temporary unavailability of the self-hosted DB container? (Needs robust retry/error handling).
- **Migration Failure**: What happens if a database migration fails during deployment? (Should rollback or alert).
- **Concurrent Access**: Handling race conditions in the new Postgres setup (using Supabase atomic ops equivalent or Postgres transactions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST connect to PostgreSQL via the provided connection string: `postgres://postgres:***@kcwgkswc004owgws848s4oks:5432/postgres`.
- **FR-002**: Project MUST implement Clean Architecture layers:
    - **Domain/Entities**: Plain JS/TS classes/interfaces for core data.
    - **Application/Use Cases**: Business logic orchestration.
    - **Infrastructure/Adapters**: Repository implementations (Prisma/Drizzle), API routes, External services.
- **FR-003**: System MUST replace Supabase-specific client calls with a generic Repository Pattern.
- **FR-004**: System MUST replace Supabase Auth with NextAuth.js (Auth.js v5) for full infrastructure autonomy. Credentials provider (email/password) is the primary method; OAuth providers can be added later.
- **FR-005**: All tables MUST have RLS (Row Level Security) or equivalent application-level security enforced in the new architecture.
- **FR-006**: The database schema MUST be recreated fresh in the new self-hosted Postgres instance. Existing Supabase data (test/demo) is not migrated. Schema maintains functional parity with current tables.

### Key Entities *(include if feature involves data)*

- **User**: Core actor, profile data, auth links.
- **Project**: User-created project metadata, tasks, results.
- **Simulation**: AI-generated simulation data linked to projects.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero dependency on `supabasehq.com` for database operations after refactor.
- **SC-002**: Application load time (TTFB) remains under 200ms with self-hosted DB.
- **SC-003**: 100% pass rate on unit tests covering the "Domain" and "Use Case" layers without DB mocks.
- **SC-004**: Deployment to Coolify is successful with no manual database setup steps (automated migrations).
