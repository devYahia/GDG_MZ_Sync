# Quickstart: Database Migration & Clean Architecture Refactor

**Branch**: `001-migrate-db-clean-arch`
**Date**: 2026-02-17

---

## Prerequisites

- Node.js >= 20
- Python >= 3.10
- Access to self-hosted Postgres container
- Git

## 1. Clone & Switch Branch

```bash
git clone <repo-url>
cd gdg
git checkout 001-migrate-db-clean-arch
```

## 2. Install Dependencies

```bash
# Frontend (Next.js)
npm install

# Backend (Python)
cd backend
pip install -r requirements.txt
cd ..
```

## 3. Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Database (Self-hosted Postgres)
DATABASE_URL=postgres://postgres:<password>@<host>:5432/postgres

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Backend API
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001

# Backend .env
GEMINI_API_KEY=<your-gemini-key>
DATABASE_URL=postgres://postgres:<password>@<host>:5432/postgres
```

## 4. Run Database Migrations

```bash
npx drizzle-kit push
```

## 5. Start Development

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Python Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## 6. Verify Setup

1. Open `http://localhost:3000` -> Landing page loads
2. Click "Sign Up" -> Create account (stored in self-hosted DB)
3. Login -> Dashboard loads with user profile
4. Generate a simulation -> Data persists in self-hosted DB

## Project Structure (Post-Refactor)

```
gdg/
  src/
    domain/
      entities/           # User, Simulation, Persona, Progress
      repositories/       # IUserRepository, ISimulationRepository, etc.
      errors/             # AppError, NotFoundError, etc.
    application/
      use-cases/          # Business logic (credits, projects, onboarding)
      dto/                # Data Transfer Objects
    infrastructure/
      database/
        schema/           # Drizzle table definitions
        repositories/     # Drizzle implementations of domain interfaces
        migrations/       # Drizzle-kit generated migrations
      auth/               # NextAuth.js configuration
      api/                # External API clients
    presentation/
      app/                # Next.js App Router (pages, layouts, routes)
      components/         # React components
      hooks/              # Custom hooks
      providers/          # Context providers

  backend/                # Python FastAPI (separate service)
    domain/               # Pydantic models
    application/          # LLM service, review service
    infrastructure/       # DB access, external APIs
    api/                  # FastAPI routes

  specs/                  # Feature specifications
  public/                 # Static assets
```

## Key Changes from Previous Architecture

| Before (Supabase) | After (Self-hosted) |
|-------------------|---------------------|
| `lib/supabase/client.ts` | Removed |
| `lib/supabase/server.ts` | `src/infrastructure/database/` |
| `@supabase/ssr` auth | `next-auth` sessions |
| `supabase.from("table")` | `db.select().from(table)` (Drizzle) |
| Supabase RLS | Application-level auth guards |
| Supabase Realtime | Deferred (Phase 2) |
