# Quickstart: Premium UX Overhaul

**Feature**: 001-premium-ux-overhaul  
**Date**: 2026-02-18

---

## Prerequisites

1. Node.js 18+ and npm
2. PostgreSQL database accessible (Coolify-hosted)
3. Environment variables configured (`.env.local` or `.env`)
4. The project runs on `npm run dev` (Next.js) and `uvicorn` (FastAPI backend)

---

## Step 1: Install New Shadcn Components

```bash
npx shadcn@latest add tabs tooltip progress skeleton dropdown-menu sheet popover slider switch command
```

This installs the missing UI primitives needed for the overhaul.

---

## Step 2: Install Recharts (for Skills Radar Chart)

```bash
npm install recharts
```

Recharts is used by Shadcn's chart component for the radar visualization.

---

## Step 3: Run Database Migrations

Create the 3 new tables via Drizzle schema files:

1. Create `src/infrastructure/database/schema/activity-log.ts`
2. Create `src/infrastructure/database/schema/skill-scores.ts`
3. Create `src/infrastructure/database/schema/interview-sessions.ts`
4. Export them from `src/infrastructure/database/schema/index.ts`
5. Run `npx drizzle-kit push` to apply schema changes

---

## Step 4: Seed Achievement Badges

Insert the initial set of 10 achievement badges into the `achievements` table.
This can be done via a seed script or a Drizzle migration.

---

## Step 5: Add Glass Shimmer CSS

Add the `.glass-shimmer` animation class to `globals.css`:

```css
.glass-shimmer {
  position: relative;
  overflow: hidden;
}
.glass-shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.08) 40%,
    rgba(139, 92, 246, 0.15) 50%,
    rgba(139, 92, 246, 0.08) 60%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## Step 6: Build Components (Priority Order)

### Phase A: Foundation (P3 -> Design System)
1. `GlassSkeleton.tsx` -- reusable skeleton with glass shimmer
2. `EmptyState.tsx` -- reusable empty state with CTA
3. Update `globals.css` with glass-shimmer animation

### Phase B: Dashboard (P1 -> Stories 1 & 2)
1. Server actions: `getDashboardData`, `logActivity`
2. `ContinueSection.tsx`
3. `DiscoverSection.tsx`
4. `ActivityTimeline.tsx`
5. Rewrite `DashboardClient.tsx`
6. Update `HomeWelcome.tsx` and `HomeStats.tsx`

### Phase C: Progress & Gamification (P2 -> Story 6)
1. Server actions: `getProgressData`, `saveSkillScores`
2. `SkillsRadar.tsx` (Recharts RadarChart)
3. `ProgressHero.tsx` (Level + XP bar)
4. `BadgeGrid.tsx` (Achievement display)
5. Rewrite `ProgressClient.tsx`

### Phase D: Project Workspace Polish (P1 -> Story 3)
1. Add skeleton loading to `ProjectPageClient.tsx`
2. Add auto-save to `ProjectIDE.tsx`
3. Add activity logging to `ProjectChat.tsx`
4. Integrate skill scores in `ProjectReport.tsx`

### Phase E: Interview & Code Review Polish (P2 -> Stories 4 & 5)
1. Server actions: `saveInterviewSession`
2. Update `SetupStep.tsx` with tooltips
3. Update `ActiveSession.tsx` with timer
4. Update `InterviewFeedback.tsx` with report card
5. Polish `code-review/page.tsx` streaming UI

### Phase F: Mobile Responsiveness (P3)
1. Add responsive breakpoints to all new components
2. Add Sheet (mobile slide-out) to project workspace
3. Test all flows at 375px viewport

---

## Verification

After all phases complete:

1. `npm run build` -- verify no TypeScript errors
2. Test new user flow: Signup -> Onboarding -> Dashboard
3. Test returning user: Dashboard -> Continue project
4. Test progress page: Skills radar, badges, XP bar
5. Test interview flow end-to-end
6. Test mobile viewport (375px)
