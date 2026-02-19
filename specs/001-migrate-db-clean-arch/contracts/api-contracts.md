# API Contracts: Database Migration & Clean Architecture Refactor

**Branch**: `001-migrate-db-clean-arch`
**Date**: 2026-02-17

---

## Next.js Server Actions (Internal API)

These replace the current Supabase-dependent server actions.

### Auth Actions (`src/infrastructure/auth/actions.ts`)

#### `login(formData: FormData) -> AuthResult`
- **Input**: `{ email: string, password: string }`
- **Output**: `{ error?: string, success?: string }`
- **Side Effect**: Creates session, redirects to `/dashboard`

#### `signup(data: SignupData) -> AuthResult`
- **Input**: `{ email, password, confirmPassword, fullName, region, field }`
- **Output**: `{ error?: string, success?: string }`
- **Side Effect**: Creates user + profile, auto-login, redirects to `/dashboard`

#### `signout() -> void`
- **Side Effect**: Destroys session, redirects to `/`

#### `completeOnboarding(data: OnboardingData) -> AuthResult`
- **Input**: `{ field, experienceLevel, interests[] }`
- **Output**: `{ error?: string }`
- **Side Effect**: Updates user profile, redirects to `/dashboard`

---

### Credit Actions (`src/application/use-cases/credits.ts`)

#### `checkAndDeductCredits() -> CreditResult`
- **Output**: `{ error?: string, success?: boolean, credits?: number }`
- **Behavior**: Atomic deduction of 3 credits per simulation

#### `getUserCredits() -> CreditResult`
- **Output**: `{ credits: number }`

#### `addCredits(amount: number) -> CreditResult`
- **Input**: `amount` (1-10000)
- **Output**: `{ credits: number }`

---

### Project Actions (`src/application/use-cases/projects.ts`)

#### `getUserProjects() -> { projects: UserProject[], error?: string }`
- **Behavior**: Merges predefined tasks (from `intern_progress`) with custom simulations
- **Output**: Unified `UserProject[]` sorted by last activity

---

### Progress API Route (`src/presentation/app/api/progress/route.ts`)

#### `POST /api/progress`
- **Input**: `{ project_id: string, status?: string, last_review_approved?: boolean }`
- **Auth**: Required (session)
- **Behavior**: Upserts intern_progress record

---

## Python FastAPI Endpoints (External API)

These remain largely unchanged but use direct Postgres instead of Supabase client.

### `POST /generate-simulation`
- **Input**: `GenerateSimulationRequest`
- **Output**: `GenerateSimulationResponse`
- **DB Change**: Uses `psycopg2` or `asyncpg` instead of `supabase.table()`

### `POST /api/chat`
- **Input**: `ProjectChatRequest`
- **Output**: `{ reply: string }`
- **No DB dependency** (stateless LLM call)

### `POST /api/review`
- **Input**: `CodeReviewRequest`
- **Output**: `{ feedback: string, approved: boolean }`
- **No DB dependency** (stateless LLM call)

### `POST /api/analyze-chat`
- **Input**: `ChatAnalysisRequest`
- **Output**: `ChatAnalysisResponse`
- **No DB dependency** (stateless LLM call)

### `POST /api/interview/chat`
- **Input**: `InterviewChatRequest`
- **Output**: `{ reply: string }`
- **No DB dependency**

### `POST /api/interview/feedback`
- **Input**: `InterviewFeedbackRequest`
- **Output**: `{ feedback object }`
- **No DB dependency**

### `POST /api/repo/extract`
- **Input**: `RepoRequest`
- **Output**: `{ files[], session_id }`
- **No DB dependency** (uses temp filesystem)

### `POST /review` (SSE)
- **Input**: `{ repo_url: string }`
- **Output**: SSE stream of review steps
- **No DB dependency**

---

## Repository Interfaces (Domain Layer Contracts)

```typescript
// src/domain/repositories/user-repository.ts
interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserDTO): Promise<User>
  update(id: string, data: UpdateUserDTO): Promise<User>
  updateCredits(id: string, delta: number): Promise<number>
}

// src/domain/repositories/simulation-repository.ts
interface ISimulationRepository {
  findById(id: string): Promise<Simulation | null>
  findByUserId(userId: string): Promise<Simulation[]>
  create(data: CreateSimulationDTO): Promise<Simulation>
  delete(id: string): Promise<void>
}

// src/domain/repositories/persona-repository.ts
interface IPersonaRepository {
  findBySimulationId(simulationId: string): Promise<Persona[]>
  createMany(simulationId: string, personas: CreatePersonaDTO[]): Promise<Persona[]>
}

// src/domain/repositories/progress-repository.ts
interface IProgressRepository {
  findByUserId(userId: string): Promise<InternProgress[]>
  upsert(data: UpsertProgressDTO): Promise<InternProgress>
}
```
