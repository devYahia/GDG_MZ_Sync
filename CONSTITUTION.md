# GDG Constitution

## Core Principles

### I. Demo-Driven MVP (36-Hour Hackathon)
Deliver a working MVP that demos flawlessly over perfect architecture. Every decision optimizes for demo impact. If a feature isn't in the demo, defer it.

### II. Tech Stack Alignment
Non-negotiable stack: Next.js 14.2.x (App Router), Tailwind CSS v4, Shadcn UI, Lucide React, and Supabase (Postgres, Auth, Realtime). Use Nuqs for URL state and Zustand for global state.

### III. Security First (Non-Negotiable)
Row Level Security (RLS) must be enabled on all database tables. All inputs and environment variables must be validated using Zod schemas.

### IV. Mobile-First & Responsive
Every component MUST work on mobile, tablet, and desktop. Design for mobile first and scale up.

### V. Atomic Operations
Use Supabase atomic operations for counters and inventory management to prevent race conditions.

## Architecture Constraints

### Server-Side Mutations
Use Server Actions for all mutations. Client-side direct database access is forbidden.

### Data Isolation
Maintain separate tables for Admin and Customer data for physiological security isolation.

### Assets & Performance
- Fonts: Use `next/font/google` only.
- Local Assets: Store core UI assets in `/public`.
- Code Splitting: Use `dynamic()` for heavy components (modals, drawers).

## Workflow & Standards

### Git Standards
- Versioning: Follow MAJOR.MINOR.PATCH format (SemVer).
- Commits: Use Conventional Commits (`feat: `, `fix: `, `chore: `, `docs: `).
- Forbidden: Never commit `node_modules/`, `.agent` configs, or `.env` files.

### Documentation & Communication
- Language: All code, comments, commits, and documentation must be in English.
- Formatting: No emojis allowed in code, commits, or documentation.
- Updates: Keep `WALKTHROUGH.md` updated after every significant step.

## Governance
This constitution supersedes all other practices. Any deviations require explicit justification and manual approval. PRs must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
