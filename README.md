# Interna. Virtual

> **Built for GDG Delta Hackathon 2026** 🚀
> 
> **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation)
> **Auth**: NextAuth.js v5 (Infrastructure Autonomy)
> **Database**: Self-hosted PostgreSQL via Drizzle ORM

---

## 🏗 Tech Stack

- **Frontend**: Next.js 14.2 (App Router), Tailwind CSS v4, Shadcn UI, Lucide React
- **Backend API**: FastAPI (Gemini AI chat + code review)
- **Database**: PostgreSQL (self-hosted)
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js (Auth.js v5)
- **State**: Nuqs (URL state), Zustand (Global state)
- **Language**: TypeScript (Strict mode)
- **Deployment**: Coolify (auto-deploy on `git push`)

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone <repo-url> && cd gdg

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Apply Database Migrations
npx drizzle-kit push

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏛 Project Structure (Clean Architecture)

```
src/
  domain/                 # Enterprise Business Rules (Entities, Repository Interfaces)
  application/            # Application Business Rules (Use Cases, DTOs)
  infrastructure/         # Frameworks & Drivers (Drizzle repositories, NextAuth, API clients)
  app/                    # Presentation: Next.js Pages & Routes (App Router)
  components/             # Presentation: UI Components
  hooks/                  # Presentation: React Hooks
  lib/                    # Utilities & Constants

backend/                  # Python Microservice (FastAPI + Gemini)
  domain/                 # Pydantic models
  application/            # LLM & Logic services
  infrastructure/         # DB & External API configs
  api/                    # FastAPI routes (main.py)
```

## 🎮 Gamification System

Interna includes a rich gamification layer to keep developers motivated:
- **XP & Levels**: Earn XP by completing simulations and passing code reviews.
- **Achievements**: Unlock badges like "First Step", "Bug Hunter", and "Clean Architect".
- **Streak Track**: Daily engagement tracking to foster consistency.

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for session encryption |
| `NEXTAUTH_URL` | Yes | Application base URL |
| `NEXT_PUBLIC_API_URL`| No | FastAPI backend URL (default: `http://127.0.0.1:8001`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API Key (for Backend) |

## 🛠 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npx drizzle-kit generate # Generate migrations
npx drizzle-kit push      # Push schema to DB
```

---

## 🤝 Git Standards

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`
- **Never commit**: `node_modules/`, `.env` files
- Commit every 30-45 min, small atomic changes
