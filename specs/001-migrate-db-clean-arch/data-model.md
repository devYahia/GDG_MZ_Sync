# Data Model: Database Migration & Clean Architecture Refactor

**Branch**: `001-migrate-db-clean-arch`
**Date**: 2026-02-17
**ORM**: Drizzle ORM
**Database**: PostgreSQL 14+ (Self-hosted container)

---

## Entity Relationship Overview

```
users 1──* sessions
users 1──* accounts
users 1──1 profiles (merged into users)
users 1──* intern_progress
users 1──* simulations 1──* personas
```

---

## Table Definitions

### 1. `users` (NextAuth.js managed + extended)

Replaces both Supabase `auth.users` and the `profiles` table.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `name` | `text` | | Full name (was `full_name`) |
| `email` | `text` | UNIQUE, NOT NULL | |
| `email_verified` | `timestamptz` | | NextAuth.js standard |
| `image` | `text` | | Avatar URL (was `avatar_url`) |
| `hashed_password` | `text` | | For credentials provider |
| `bio` | `text` | | From profiles |
| `field` | `text` | NOT NULL, DEFAULT 'frontend' | frontend/backend/fullstack/mobile/data/design |
| `experience_level` | `text` | NOT NULL, DEFAULT 'student' | student/fresh_grad/junior |
| `interests` | `text[]` | DEFAULT '{}' | Array of interest tags |
| `region` | `text` | | Geographic region |
| `credits` | `integer` | NOT NULL, DEFAULT 10 | Simulation credits |
| `onboarding_completed` | `boolean` | NOT NULL, DEFAULT false | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Indexes**:
- `users_email_idx` UNIQUE on `email`

---

### 2. `accounts` (NextAuth.js managed)

For OAuth providers (future-proofing).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK -> users(id) ON DELETE CASCADE |
| `type` | `text` | NOT NULL |
| `provider` | `text` | NOT NULL |
| `provider_account_id` | `text` | NOT NULL |
| `refresh_token` | `text` | |
| `access_token` | `text` | |
| `expires_at` | `integer` | |
| `token_type` | `text` | |
| `scope` | `text` | |
| `id_token` | `text` | |

**Indexes**:
- `accounts_provider_provider_account_id_idx` UNIQUE on `(provider, provider_account_id)`

---

### 3. `sessions` (NextAuth.js managed)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `session_token` | `text` | UNIQUE, NOT NULL |
| `user_id` | `uuid` | FK -> users(id) ON DELETE CASCADE |
| `expires` | `timestamptz` | NOT NULL |

---

### 4. `verification_tokens` (NextAuth.js managed)

| Column | Type | Constraints |
|--------|------|-------------|
| `identifier` | `text` | NOT NULL |
| `token` | `text` | NOT NULL |
| `expires` | `timestamptz` | NOT NULL |

**Indexes**:
- UNIQUE on `(identifier, token)`

---

### 5. `simulations`

AI-generated project simulations.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `uuid` | FK -> users(id) ON DELETE CASCADE, NOT NULL | |
| `title` | `text` | NOT NULL | |
| `context` | `text` | | Original user prompt |
| `domain` | `text` | | e.g., "e-commerce", "social media" |
| `difficulty` | `text` | | easy/medium/hard |
| `level` | `integer` | DEFAULT 1 | 1-8 |
| `estimated_duration` | `text` | | |
| `tech_stack` | `text[]` | DEFAULT '{}' | |
| `overview` | `text` | | |
| `learning_objectives` | `text[]` | DEFAULT '{}' | |
| `functional_requirements` | `text[]` | DEFAULT '{}' | |
| `non_functional_requirements` | `text[]` | DEFAULT '{}' | |
| `milestones` | `jsonb` | DEFAULT '[]' | Array of milestone objects |
| `resources` | `jsonb` | DEFAULT '[]' | |
| `quiz` | `jsonb` | DEFAULT '[]' | |
| `field` | `text` | | Task field classification |
| `duration` | `text` | | Display duration |
| `tools` | `text[]` | DEFAULT '{}' | |
| `client_persona` | `text` | | |
| `client_mood` | `text` | | |
| `description` | `text` | | Short description |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | |

**Indexes**:
- `simulations_user_id_idx` on `user_id`
- `simulations_created_at_idx` on `created_at` DESC

---

### 6. `personas`

Simulation personas for role-play chat.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() |
| `simulation_id` | `uuid` | FK -> simulations(id) ON DELETE CASCADE, NOT NULL |
| `name` | `text` | NOT NULL |
| `role` | `text` | NOT NULL |
| `personality` | `text` | |
| `system_prompt` | `text` | |
| `initial_message` | `text` | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() |

**Indexes**:
- `personas_simulation_id_idx` on `simulation_id`

---

### 7. `intern_progress`

Tracks user progress on predefined tasks.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() |
| `user_id` | `uuid` | FK -> users(id) ON DELETE CASCADE, NOT NULL |
| `project_id` | `text` | NOT NULL (references predefined task ID) |
| `status` | `text` | NOT NULL, DEFAULT 'in_progress' |
| `last_activity_at` | `timestamptz` | DEFAULT now() |
| `last_review_at` | `timestamptz` | |
| `last_review_approved` | `boolean` | |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() |

**Indexes**:
- `intern_progress_user_project_idx` UNIQUE on `(user_id, project_id)`
- `intern_progress_user_id_idx` on `user_id`

---

## State Transitions

### User Onboarding
```
created -> onboarding_pending -> onboarding_completed
```
- `onboarding_completed = false` -> Show onboarding bubble
- `onboarding_completed = true` -> Show dashboard normally

### Intern Progress Status
```
in_progress -> completed
```

---

## Validation Rules

1. **email**: Must be valid email format (Zod `z.string().email()`)
2. **field**: Must be one of: `frontend`, `backend`, `fullstack`, `mobile`, `data`, `design`
3. **experience_level**: Must be one of: `student`, `fresh_grad`, `junior`
4. **credits**: Must be >= 0 (enforced by CHECK constraint)
5. **password**: Min 6 chars, at least 1 lowercase, 1 uppercase, 1 number, 1 special char
