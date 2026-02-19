# API Contracts: Premium UX Overhaul

**Feature**: 001-premium-ux-overhaul  
**Date**: 2026-02-18

---

## Existing Endpoints (No Changes)

These endpoints already exist and require no modifications:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/generate-simulation` | Generate AI simulation |
| POST | `/api/chat` | Project chat with AI persona |
| POST | `/api/review` | Start code review (returns job_id + stream_url) |
| POST | `/api/analyze-chat` | Analyze chat for soft/tech skills |
| POST | `/api/interview/chat` | Send message during interview |
| POST | `/api/interview/feedback` | Get interview feedback report |
| POST | `/api/repo/extract` | Clone and read GitHub repo |

---

## New Frontend Server Actions (Next.js App Router)

These are NOT FastAPI endpoints. They are Next.js Server Actions that interact directly with the Postgres database via Drizzle ORM.

### Action: `getDashboardData(userId: string)`

**Location**: `src/app/(dashboard)/actions.ts`

**Returns**:
```typescript
{
  user: {
    name: string
    field: string
    experienceLevel: string
    xp: number
    currentLevel: number
    streakDays: number
    credits: number
    onboardingCompleted: boolean
  }
  recentActivity: {
    id: string
    eventType: string
    contextType: string | null
    contextId: string | null
    metadata: Record<string, unknown>
    createdAt: Date
  }[]
  inProgressProjects: {
    projectId: string
    status: string
    lastActivityAt: Date
    title: string        // joined from simulations or TASKS lookup
    field: string
    progressPercent: number  // calculated from milestones
  }[]
  discoveredFeatures: string[]  // list of eventTypes the user has triggered
  earnedBadges: {
    slug: string
    title: string
    icon: string
    rarity: string
    unlockedAt: Date
  }[]
  skillScores: {
    communication: number
    codeQuality: number
    requirementsGathering: number
    technicalDepth: number
    problemSolving: number
    professionalism: number
  } | null  // averaged from all skill_scores entries
}
```

---

### Action: `getProgressData(userId: string)`

**Location**: `src/app/(dashboard)/actions.ts`

**Returns**:
```typescript
{
  currentLevel: number
  xp: number
  xpToNextLevel: number
  streakDays: number
  totalProjectsCompleted: number
  totalReviewsDone: number
  totalInterviewsDone: number
  skillRadar: {
    communication: number
    codeQuality: number
    requirementsGathering: number
    technicalDepth: number
    problemSolving: number
    professionalism: number
  }
  skillHistory: {
    date: string  // ISO date
    communication: number
    codeQuality: number
    // ... all dimensions
  }[]
  badges: {
    slug: string
    title: string
    description: string
    icon: string
    category: string
    rarity: string
    xpReward: number
    unlockedAt: Date | null  // null = not yet earned
  }[]
}
```

---

### Action: `logActivity(data: ActivityLogInput)`

**Location**: `src/app/(dashboard)/actions.ts`

**Input**:
```typescript
{
  userId: string
  eventType: "simulation_started" | "simulation_completed" | "chat_message_sent" |
             "code_review_requested" | "code_review_completed" | "interview_started" |
             "interview_completed" | "quiz_completed" | "report_generated" |
             "achievement_unlocked"
  contextType?: "simulation" | "review" | "interview" | null
  contextId?: string
  metadata?: Record<string, unknown>
}
```

**Returns**: `{ success: boolean }`

**Side Effects**:
- Inserts a row into `activity_log`
- Increments user XP by the activity's XP value
- Checks if a level-up occurred, updates `currentLevel` if so
- Checks if any achievement criteria are met, awards badges if so

---

### Action: `saveSkillScores(data: SkillScoreInput)`

**Location**: `src/app/(dashboard)/actions.ts`

**Input**:
```typescript
{
  userId: string
  sourceType: "chat_analysis" | "code_review" | "interview_feedback"
  sourceId: string
  communication: number
  codeQuality: number
  requirementsGathering: number
  technicalDepth: number
  problemSolving: number
  professionalism: number
  overallScore: number
}
```

**Returns**: `{ success: boolean }`

---

### Action: `saveInterviewSession(data: InterviewSessionInput)`

**Location**: `src/app/(dashboard)/actions.ts`

**Input**:
```typescript
{
  userId: string
  role: string
  difficulty: string
  focusAreas: string[]
  transcript: { role: string; content: string; timestamp: string }[]
  feedbackScores: Record<string, number>
  overallRating: number
  durationMinutes: number
}
```

**Returns**: `{ id: string; success: boolean }`

---

## New Shadcn Components to Install

The following components need to be added to the project to support the UX overhaul:

| Component | Usage |
|-----------|-------|
| `tabs` | Project workspace panel switching, sidebar tabs |
| `tooltip` | Feature descriptions, button hints |
| `progress` | XP progress bar, review progress |
| `skeleton` | Glass shimmer loading states |
| `dropdown-menu` | Profile menu, quick actions |
| `sheet` | Mobile slide-out panels |
| `popover` | Inline tooltips, notification previews |
| `chart` | Skills radar chart (wraps Recharts) |
| `slider` | Interview difficulty selector |
| `switch` | Settings toggles |
| `command` | Quick action command palette |
| `sonner` | Already used (toast notifications) |

---

## Component Architecture Overview

```
src/components/
  ui/                           # Shadcn base (existing + new)
    skeleton.tsx                 # NEW
    tabs.tsx                     # NEW
    tooltip.tsx                  # NEW
    progress.tsx                 # NEW
    chart.tsx                    # NEW
    dropdown-menu.tsx            # NEW
    sheet.tsx                    # NEW
    popover.tsx                  # NEW
    slider.tsx                   # NEW
    switch.tsx                   # NEW
    command.tsx                  # NEW
    ...existing...

  dashboard/
    DashboardClient.tsx          # REWRITE - full command center
    HomeWelcome.tsx              # UPDATE - personalized + progress snapshot
    HomeStats.tsx                # UPDATE - dynamic from DB
    ContinueSection.tsx          # NEW - in-progress projects
    DiscoverSection.tsx          # NEW - feature discovery cards
    ActivityTimeline.tsx         # NEW - recent activity feed
    SkillsRadar.tsx              # NEW - radar chart component
    ProgressHero.tsx             # NEW - level + XP hero display
    BadgeGrid.tsx                # NEW - achievement badges grid
    GlassSkeleton.tsx            # NEW - branded skeleton loader
    EmptyState.tsx               # NEW - reusable empty state
    ...existing...

  project/
    ProjectPageClient.tsx        # UPDATE - add skeleton loading
    ProjectChat.tsx              # UPDATE - add activity logging
    ProjectIDE.tsx               # UPDATE - add auto-save
    ProjectReport.tsx            # UPDATE - integrate skill scores
    ...existing...

  dashboard/interviewer/
    SetupStep.tsx                # UPDATE - add tooltips, slider
    ActiveSession.tsx            # UPDATE - add timer, persist session
    InterviewFeedback.tsx        # UPDATE - styled report card
    ...existing...
```
