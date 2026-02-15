# Interna. Virtual

> **Built for GDG Delta Hackathon 2026** 🚀

AI-Driven Virtual Internship Simulator

---

## Tech Stack

- **Frontend**: Next.js 14.2 (App Router), Tailwind CSS v3, Shadcn UI, Lucide React
- **Backend**: FastAPI (Gemini AI chat + code review), Supabase (Postgres, Auth, Realtime)
- **State**: Nuqs (URL state), Zustand (Global state)
- **Language**: TypeScript (Strict mode)
- **Deployment**: Coolify (auto-deploy on `git push`)

## Getting Started

```bash
# 1. Clone the repo
git clone <repo-url> && cd gdg

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  page.tsx                    # Landing page
  layout.tsx                  # Root layout (fonts, toaster, metadata)
  globals.css                 # Design system (CSS variables, glass components)
  (auth)/
    actions.ts                # Server actions: login, signup, OTP verify, onboarding
    login/page.tsx            # Login page
    signup/page.tsx           # Multi-step signup + onboarding
  (dashboard)/
    dashboard/page.tsx        # Home: project grid with multi-select filters (tracks, difficulty, levels)
    project/[id]/page.tsx    # Project page: split view — AI customer chat (left) + IDE sandbox (right)
  auth/
    confirm/route.ts          # Email OTP confirmation callback

components/
  ui/                         # Shadcn UI components (button, card, dialog, etc.)
  dashboard/                  # Dashboard-specific components
    DashboardNavbar.tsx
    TaskCard.tsx
    TaskFilters.tsx
    TaskGrid.tsx
  project/                    # Project page (split chat + IDE)
    ProjectView.tsx
    ProjectChat.tsx           # AI customer chat (Arabic + English via Gemini)
    ProjectIDE.tsx            # Monaco editor + "Request AI review"
  landing/                    # Landing page components
    Features.tsx
    HeroMonitor.tsx

lib/
  supabase/
    client.ts                 # Browser Supabase client
    server.ts                 # Server Supabase client
    middleware.ts             # Auth middleware (route protection)
    database.types.ts         # Generated DB types (auto-generated, do not edit)
    utils.ts                  # getCurrentUser(), isAuthenticated()
  tasks.ts                    # Task definitions, levels, tracks, getTaskById()
  api.ts                      # Frontend API client (chat, code review → FastAPI)
  utils.ts                    # cn() utility for Tailwind class merging

hooks/
  use-toast.ts                # Toast hook

middleware.ts                 # Next.js middleware entry point
backend/                      # FastAPI + Gemini: /api/chat (customer sim), /api/review (code review)
```

## Key Conventions

- **Server Actions for mutations** -- No direct DB access from client
- **RLS enabled** on all tables -- Security enforced at DB level
- **Zod validation** on all form inputs
- **Fonts**: Use `next/font/google` only (no CSS @import)
- **Dark mode only** -- `html` has `class="dark"` set in layout

## Database

Supabase project: `GDGHackathon` (eu-central-1)

### Tables

| Table | RLS | Description |
|-------|-----|-------------|
| `profiles` | Yes | User profiles linked to `auth.users` |

### Migrations Applied

1. `create_profiles_table`
2. `add_region_to_profiles`

Types are auto-generated in `lib/supabase/database.types.ts`.

## Auth Flow

1. **Signup**: Email + password + name + region -> OTP email verification -> Field selection -> Experience level -> Interests -> Dashboard
2. **Login**: Email + password -> Dashboard
3. **Middleware**: Protects `/dashboard`, `/sandbox`, `/profile`. Redirects authenticated users away from `/login`, `/signup`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `NEXT_PUBLIC_API_URL` | No | FastAPI backend URL (default: `http://127.0.0.1:8000`) |

Backend (`backend/.env`): copy from `backend/.env.example`. Set `GEMINI_API_KEY` for AI chat and code review.

## Project & AI Flow

1. **Dashboard (home)** — Projects in tracks (frontend, backend, fullstack, mobile, data, design) with **multi-select filters** for tracks, project difficulty, and **levels** (Level 1–7: customer difficulty + project difficulty).
2. **Click a project** → **Project page** (split layout):
   - **Left**: AI customer chat (Gemini). Ask about the challenge or requirements. **Arabic or English** via toggle.
   - **Right**: VS Code–style sandbox (Monaco). Write code and click **Request AI review**; Gemini reviews and returns feedback + approved/not approved.
3. Backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`. Set `GEMINI_API_KEY` for full AI behavior.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Git Rules

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`
- **Never commit**: `node_modules/`, `.env` files, `.agent/`, `.cursor/`
- Commit every 30-45 min, small atomic changes
