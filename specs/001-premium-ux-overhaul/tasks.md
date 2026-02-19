# Tasks: Premium UX Overhaul

**Feature Branch**: `001-premium-ux-overhaul`  
**Date**: 2026-02-18  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Total Tasks**: 52 | **User Stories**: 7 | **Phases**: 9

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure the project for the overhaul.

- [x] T001 Install new Shadcn UI components: `npx shadcn@latest add tabs tooltip progress skeleton dropdown-menu sheet popover slider switch command`
- [x] T002 Install Recharts dependency: `npm install recharts`
- [x] T003 [P] Add glass-shimmer CSS animation class to `src/app/globals.css`
- [x] T004 [P] Create XP calculation and level-up utility in `src/lib/xp.ts` with level thresholds from data-model.md
- [x] T005 [P] Create achievement checking utility in `src/lib/achievements.ts` with criteria matching logic

**Checkpoint**: All dependencies installed, utility functions ready. No UI changes yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema extensions and shared components that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create `activity_log` Drizzle schema in `src/infrastructure/database/schema/activity-log.ts` with columns: id, userId, eventType, contextType, contextId, metadata (JSONB), createdAt
- [x] T007 [P] Create `skill_scores` Drizzle schema in `src/infrastructure/database/schema/skill-scores.ts` with columns: id, userId, sourceType, sourceId, communication, codeQuality, requirementsGathering, technicalDepth, problemSolving, professionalism, overallScore, createdAt
- [x] T008 [P] Create `interview_sessions` Drizzle schema in `src/infrastructure/database/schema/interview-sessions.ts` with columns: id, userId, role, difficulty, focusAreas, status, transcript (JSONB), feedbackScores (JSONB), overallRating, durationMinutes, createdAt, completedAt
- [x] T009 Export new schemas from `src/infrastructure/database/schema/index.ts`
- [x] T010 Run `npx drizzle-kit push` to apply schema changes to the database
- [x] T011 [P] Create reusable `GlassSkeleton` component in `src/components/dashboard/GlassSkeleton.tsx` using Shadcn Skeleton + glass-shimmer class
- [x] T012 [P] Create reusable `EmptyState` component in `src/components/dashboard/EmptyState.tsx` with icon, title, description, and CTA button props
- [x] T013 Create `logActivity` Server Action in `src/app/(dashboard)/actions.ts` that inserts into activity_log, increments XP, checks level-up, and checks achievement criteria
- [x] T014 Create `saveSkillScores` Server Action in `src/app/(dashboard)/actions.ts` that inserts a row into skill_scores table
- [x] T015 Seed the 10 achievement badges from data-model.md into the `achievements` table via a seed script or Server Action in `src/app/(dashboard)/actions.ts`

**Checkpoint**: Foundation ready -- 3 new DB tables live, shared components built, Server Actions for activity tracking ready. User story implementation can begin.

---

## Phase 3: User Story 1 -- Guided Post-Registration Onboarding (Priority: P1) MVP

**Goal**: New users are greeted with a stunning 3-step liquid glass onboarding that captures their profile, then land on a personalized dashboard with curated "Getting Started" actions.

**Independent Test**: Register a new account, complete the 3-step onboarding, and verify the dashboard shows 3 personalized "Quick Start" action cards based on the selected field.

### Implementation

- [x] T016 [US1] Redesign `LiquidGlassBubble` component in `src/components/dashboard/LiquidGlassBubble.tsx` to be a full-screen overlay with 3 animated steps (field selection, experience level, interests) using liquid-glass CSS class, Framer Motion page transitions, and progress indicator
- [x] T017 [US1] Create `QuickStartActions` component in `src/components/dashboard/QuickStartActions.tsx` that renders 3 personalized CTA cards based on user field and experience level (e.g., "Start your first simulation," "Try a mock interview," "Review open-source code") with glass-card styling and hover animations
- [x] T018 [US1] Update `DashboardWithOnboarding` in `src/components/dashboard/DashboardWithOnboarding.tsx` to pass `onboardingCompleted` flag and conditionally render full-screen onboarding vs. personalized dashboard
- [x] T019 [US1] Call `logActivity` with eventType "onboarding_completed" when user finishes onboarding in `src/components/dashboard/LiquidGlassBubble.tsx`

**Checkpoint**: New user onboarding flow complete and independently testable.

---

## Phase 4: User Story 2 -- Unified Dashboard Command Center (Priority: P1)

**Goal**: The dashboard becomes a personalized command center with progress snapshot, "Continue Where You Left Off," feature discovery, and activity timeline.

**Independent Test**: Log in as a user with 2+ projects, verify the dashboard shows: progress ring with level/XP, at least one "Continue" card for an in-progress project, and a "Discover" card for an unused feature.

### Implementation

- [ ] T020 [US2] Create `getDashboardData` Server Action in `src/app/(dashboard)/actions.ts` that fetches user profile, recent activity (from activity_log), in-progress projects (from intern_progress joined with simulations/TASKS), discovered features (distinct eventTypes from activity_log), earned badges (from user_achievements joined with achievements), and aggregated skill scores (AVG from skill_scores)
- [ ] T021 [P] [US2] Create `ContinueSection` component in `src/components/dashboard/ContinueSection.tsx` that renders in-progress project cards with title, field badge, progress percentage, last activity time, and a "Resume" button linking to `/project/[id]`
- [ ] T022 [P] [US2] Create `DiscoverSection` component in `src/components/dashboard/DiscoverSection.tsx` that renders promotional cards for features the user has not tried yet (compare discovered eventTypes against full feature set), each with icon, title, description, gradient border, and "Try Now" CTA
- [ ] T023 [P] [US2] Create `ActivityTimeline` component in `src/components/dashboard/ActivityTimeline.tsx` that renders a vertical timeline of the user's recent 10 activities with event icons, descriptions, timestamps, and context links
- [ ] T024 [P] [US2] Create `ProgressSnapshot` component in `src/components/dashboard/ProgressSnapshot.tsx` that renders a compact progress ring showing current level, XP bar toward next level, streak flame icon with count, and mini skills radar (small Recharts RadarChart)
- [ ] T025 [US2] Rewrite `DashboardClient` in `src/components/dashboard/DashboardClient.tsx` to compose: HomeWelcome (personalized greeting), ProgressSnapshot, QuickStartActions (for new users) or ContinueSection (for returning users), DiscoverSection, ActivityTimeline -- all with GlassSkeleton loading states
- [ ] T026 [US2] Update `src/app/(dashboard)/dashboard/page.tsx` to call `getDashboardData` in the server component and pass all data props to the rewritten DashboardClient
- [ ] T027 [US2] Update `HomeStats` in `src/components/dashboard/HomeStats.tsx` to use dynamic data from getDashboardData instead of hardcoded TASKS.length values
- [x] T027b [US2] Create `SimulationTemplates` component in `src/components/dashboard/SimulationTemplates.tsx` that renders filters TASKS by user field (with "Explore All" toggle), using premium cards with difficulty badges and glass styling. Add this component to `DashboardClient` between ProgressSnapshot and QuickStartActions.

**Checkpoint**: Dashboard command center complete. New and returning users see personalized content.

---

## Phase 5: User Story 3 -- Premium Project Workspace Experience (Priority: P1)

**Goal**: The project workspace feels like a professional IDE with skeleton loading, AI review integration, activity logging, and auto-save.

**Independent Test**: Open a simulation, see skeleton loading, chat with the AI client, write code, trigger AI review, generate a performance report -- all without leaving the workspace.

### Implementation

- [ ] T028 [US3] Harmonize theme (replace hardcoded colors with global tokens) and add skeleton loading states to `ProjectPageClient` in `src/components/project/ProjectPageClient.tsx` using GlassSkeleton for all panels (chat, IDE, sidebar tabs) during initial data load. Ensure IDE uses correct `bg-background` and `border-border` tokens.
- [ ] T029 [P] [US3] Add auto-save to `ProjectIDE` in `src/components/project/ProjectIDE.tsx`: debounced 2-second save to localStorage keyed by `project-{id}-file-{path}`, plus 30-second interval sync indicator showing "Saved" toast
- [ ] T030 [P] [US3] Add activity logging to `ProjectChat` in `src/components/project/ProjectChat.tsx`: call `logActivity` with "chat_message_sent" on each user message and "code_review_requested" when review is triggered
- [ ] T031 [US3] Integrate skill score saving in `ProjectReport` in `src/components/project/ProjectReport.tsx`: after a performance report is generated, parse the scores and call `saveSkillScores` Server Action with sourceType "chat_analysis"
- [ ] T032 [US3] Add activity logging for report generation in `ProjectReport`: call `logActivity` with "report_generated" when the report renders successfully

**Checkpoint**: Project workspace polished with skeleton loading, auto-save, and full activity tracking.

---

## Phase 6: User Story 4 -- AI Interview Practice Flow (Priority: P2)

**Goal**: Interview practice with professional UI, persistent sessions, and structured feedback reports.

**Independent Test**: Navigate to Interview Practice, set up a session (role + difficulty), exchange 10 messages, end session, and receive a scored feedback report card.

### Implementation

- [ ] T033 [US4] Create `saveInterviewSession` Server Action in `src/app/(dashboard)/actions.ts` that inserts a row into interview_sessions table and calls logActivity with "interview_completed"
- [ ] T034 [US4] Update `SetupStep` in `src/components/dashboard/interviewer/SetupStep.tsx` to use Shadcn Slider for difficulty selection, Tooltip for role descriptions, and chip-style focus area selection with glass-card styling
- [x] T035 [US4] Update `ActiveSession` in `src/components/dashboard/interviewer/ActiveSession.tsx` to use Split-Pane layout (Left: Avatar/Video/Controls, Right: Transcript/Input). Add robust Audio Controller with Play/Pause/Mute, visual waveform using Web Audio API, and countdown timer. Ensure audio quality output (rate 0.95).
- [ ] T036 [US4] Update `InterviewFeedback` in `src/components/dashboard/interviewer/InterviewFeedback.tsx` to render a structured report card with category scores (Communication, Problem Solving, Technical Depth, etc.), overall rating as a large animated number, color-coded score bars, and "Next Steps" recommendations section
- [ ] T037 [US4] Call `saveInterviewSession` and `saveSkillScores` (sourceType "interview_feedback") when feedback is generated in `InterviewClient` at `src/components/dashboard/interviewer/InterviewClient.tsx`

**Checkpoint**: Interview flow complete end-to-end with session persistence and skill score tracking.

---

## Phase 7: User Story 5 -- Standalone Code Review Tool (Priority: P2)

**Goal**: Code Review page with polished SSE streaming UI, progress timeline, and comprehensive report display.

**Independent Test**: Paste a GitHub URL, start review, see live progress timeline with step indicators, and receive a final report with per-file analysis.

### Implementation

- [x] T038 [US5] Fix API endpoint (update `/review` to `/api/review`) and harmonize theme (use global tokens), then redesign the streaming progress section in `src/app/(dashboard)/code-review/page.tsx` with a vertical timeline and step icons.
- [ ] T039 [US5] Redesign the report display section in `src/app/(dashboard)/code-review/page.tsx` to use Shadcn Accordion for per-file analysis, color-coded severity badges (critical/warning/info), and an overall grade hero card with glass-card styling
- [ ] T040 [US5] Add activity logging to code review: call `logActivity` with "code_review_requested" on review start and "code_review_completed" on report render, passing the job_id as contextId

**Checkpoint**: Code review tool polished with premium streaming UI and activity tracking.

---

## Phase 8: User Story 6 -- Progress & Gamification System (Priority: P2)

**Goal**: The Progress page shows level progression, skills radar chart, achievement badges, and historical skill trends.

**Independent Test**: Visit My Progress as a user with 3+ completed projects, verify: animated level hero with XP bar, populated skills radar chart, at least 2 earned badges displayed.

### Implementation

- [ ] T041 [US6] Create `getProgressData` Server Action in `src/app/(dashboard)/actions.ts` that fetches: currentLevel, xp, xpToNextLevel (from xp.ts), streakDays, total counts (projects, reviews, interviews from activity_log), skill radar (AVG from skill_scores), skill history (time-series from skill_scores), and badges (all achievements with earned/unearned status from user_achievements)
- [ ] T042 [P] [US6] Create `ProgressHero` component in `src/components/dashboard/ProgressHero.tsx` with animated level number (Framer Motion count-up), XP progress bar using Shadcn Progress component, streak fire icon with count, and total stats row
- [ ] T043 [P] [US6] Create `SkillsRadar` component in `src/components/dashboard/SkillsRadar.tsx` using Recharts RadarChart with 6 dimensions (Communication, Code Quality, Requirements Gathering, Technical Depth, Problem Solving, Professionalism), themed with brand purple/violet colors, and glass-card wrapper
- [ ] T044 [P] [US6] Create `BadgeGrid` component in `src/components/dashboard/BadgeGrid.tsx` that renders all badges in a responsive grid, earned badges show full color with rarity glow (common=gray, rare=blue, epic=purple, legendary=gold), unearned badges show locked/grayed state with progress hint
- [ ] T045 [US6] Rewrite `ProgressClient` in `src/components/dashboard/progress/ProgressClient.tsx` to compose: ProgressHero, SkillsRadar, BadgeGrid, and use GlassSkeleton during loading. Show EmptyState with "Your Journey Begins" message if user has zero activity
- [ ] T046 [US6] Update `src/app/(dashboard)/dashboard/progress/page.tsx` to call `getProgressData` in the server component and pass data to ProgressClient

**Checkpoint**: Progress page complete with dynamic data, radar chart, and badge system.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Visual consistency, mobile responsiveness, and final validation.

- [ ] T047 [P] Apply liquid-glass and glass-card CSS classes consistently to all modal/dialog components across the app by updating the Shadcn Dialog component in `src/components/ui/dialog.tsx` with frosted glass backdrop and scale-in animation
- [ ] T048 [P] Add micro-animations (hover scale, glow effect) to all Button and Card components by extending their className defaults in `src/components/ui/button.tsx` and `src/components/ui/card.tsx`
- [ ] T049 Add responsive breakpoints to the project workspace in `src/components/project/ProjectPageClient.tsx`: stack panels vertically below `lg` breakpoint, add bottom tab bar using Shadcn Tabs for mobile panel switching
- [ ] T050 Add responsive breakpoints to the dashboard in `src/components/dashboard/DashboardClient.tsx`: single-column layout below `md`, 2-column below `lg`
- [ ] T051 Run `npm run build` to verify zero TypeScript errors and validate the full build
- [ ] T052 Validate all 5 primary flows at 375px viewport: Onboarding, Dashboard, Project Workspace, Interview Practice, Progress page

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────> Phase 2 (Foundation) ──┬──> Phase 3 (US1: Onboarding) [P1]
                                                                ├──> Phase 4 (US2: Dashboard) [P1]
                                                                ├──> Phase 5 (US3: Workspace) [P1]
                                                                ├──> Phase 6 (US4: Interview) [P2]
                                                                ├──> Phase 7 (US5: Code Review) [P2]
                                                                └──> Phase 8 (US6: Progress) [P2]
                                                                          │
                                                                          v
                                                                Phase 9 (Polish)
```

### User Story Dependencies

- **US1 (Onboarding)**: Depends on Foundation only. No cross-story dependencies.
- **US2 (Dashboard)**: Depends on Foundation. Benefits from US1 (QuickStartActions component reuse) but can function independently with a stub.
- **US3 (Workspace)**: Depends on Foundation. Fully independent from other stories.
- **US4 (Interview)**: Depends on Foundation. Fully independent from other stories.
- **US5 (Code Review)**: Depends on Foundation. Fully independent from other stories.
- **US6 (Progress)**: Depends on Foundation. Reads data generated by US3/US4/US5 activities, but functions with empty data (shows EmptyState).

### Within Each User Story

- Server Actions before components (data layer before UI layer)
- Shared components (Skeleton, EmptyState) are in Foundation phase
- Components marked [P] within a story can be built in parallel
- Composition component (e.g., DashboardClient rewrite) comes last in each story

### Parallel Opportunities

**Phase 2** (Foundation): T006, T007, T008 can run in parallel (independent DB tables). T011, T012 can run in parallel (independent components).

**Phase 4** (Dashboard): T021, T022, T023, T024 can ALL run in parallel (independent components, different files).

**Phase 8** (Progress): T042, T043, T044 can ALL run in parallel (independent components, different files).

---

## Parallel Example: User Story 2 (Dashboard)

```
# After T020 (getDashboardData Server Action) is complete:

# Launch all 4 components in parallel:
Task T021: "ContinueSection in src/components/dashboard/ContinueSection.tsx"
Task T022: "DiscoverSection in src/components/dashboard/DiscoverSection.tsx"
Task T023: "ActivityTimeline in src/components/dashboard/ActivityTimeline.tsx"
Task T024: "ProgressSnapshot in src/components/dashboard/ProgressSnapshot.tsx"

# Then compose them:
Task T025: "Rewrite DashboardClient in src/components/dashboard/DashboardClient.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundation (~2 hours)
3. Complete Phase 3: US1 - Onboarding (~1.5 hours)
4. Complete Phase 4: US2 - Dashboard (~2.5 hours)
5. **STOP and VALIDATE**: New user can onboard + see personalized dashboard
6. Deploy/demo if ready -- **this is demo-worthy**

### Incremental Delivery

1. Setup + Foundation -> ready
2. US1 (Onboarding) -> test independently -> deploy (new user wow factor)
3. US2 (Dashboard) -> test independently -> deploy (returning user engagement)
4. US3 (Workspace) -> test independently -> deploy (core product polish)
5. US6 (Progress) -> test independently -> deploy (gamification loop)
6. US4 + US5 (Interview + Review) -> test -> deploy (feature polish)
7. Phase 9 (Polish) -> final pass -> deploy

### Time Budget (Hackathon Pace)

| Phase | Estimated | Cumulative |
|-------|-----------|-----------|
| Setup | 30 min | 0:30 |
| Foundation | 2 hours | 2:30 |
| US1 Onboarding | 1.5 hours | 4:00 |
| US2 Dashboard | 2.5 hours | 6:30 |
| US3 Workspace | 2 hours | 8:30 |
| US6 Progress | 2.5 hours | 11:00 |
| US4 Interview | 2 hours | 13:00 |
| US5 Code Review | 1.5 hours | 14:30 |
| Polish | 2 hours | 16:30 |

**Total: ~16.5 hours at hackathon pace**

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [US#] label maps task to specific user story for traceability
- Tests are NOT included (hackathon mode -- test critical paths only)
- Commit after each task or logical group (~30-45 min intervals)
- Stop at any checkpoint to validate story independently
- US7 (Liquid Glass Design System from spec) is integrated as a cross-cutting concern in Phase 9 (Polish) rather than a separate story phase, since it applies to all components
