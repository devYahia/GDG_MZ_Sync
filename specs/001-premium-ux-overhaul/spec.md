# Feature Specification: Premium UX Overhaul

**Feature Branch**: `001-premium-ux-overhaul`  
**Created**: 2026-02-18  
**Status**: Draft  
**Input**: User description: "Complete UX analysis and premium experience redesign for Interna Virtual platform -- from post-registration onboarding through all features, with liquid glass aesthetic, Shadcn UI components, and brand-aligned color palette."

---

## Platform Audit Summary

Before defining user stories, the following is a comprehensive audit of the existing Interna Virtual platform, its services, and the current gaps.

### Existing Services (Backend)

| Service | Endpoint | Status | Description |
|---------|----------|--------|-------------|
| Simulation Generation | `/generate-simulation` | Working | AI generates full project simulations with personas, milestones, quizzes |
| Project Chat | `/api/chat` | Working | Real-time chat with AI client personas during simulation |
| Code Review | `/api/review` | Working | AI reviews user code for quality and correctness |
| Chat Analysis | `/api/analyze-chat` | Working | AI evaluates soft skills + technical skills from chat transcripts |
| Interview Chat | `/api/interview/chat` | Working | AI interview practice with configurable roles and difficulty |
| Interview Feedback | `/api/interview/feedback` | Working | AI generates performance report after mock interview |
| Repo Extraction | `/api/repo/extract` | Working | Clones and reads GitHub repos for code review |

### Existing Pages (Frontend)

| Page | Route | Current State |
|------|-------|---------------|
| Landing Page | `/` | Has Unicorn Studio hero, features, pricing, FAQ, contact sections |
| Login | `/login` | Basic credential-based auth |
| Signup | `/signup` | Basic registration form |
| Onboarding | `/onboarding` | Exists but underused; LiquidGlassBubble triggers on dashboard |
| Dashboard Home | `/dashboard` | Welcome card, stats grid, project gallery |
| My Projects | `/dashboard/projects` | Lists predefined tasks + custom simulations with filters |
| My Progress | `/dashboard/progress` | Level-based progression (10 levels) with lock/unlock visual |
| Resources | `/dashboard/resources` | Static resource listing |
| Interview Practice | `/dashboard/interview` | Setup -> Active Session -> Feedback flow |
| Profile | `/dashboard/profile` | Basic profile display |
| IDE | `/ide` | Monaco editor with file tree, code review sidebar, SSE streaming |
| Sandbox | `/sandbox` | Loads review job results (currently broken routing) |
| Code Review | `/code-review` | GitHub repo input, SSE review streaming, report display |
| Project Workspace | `/project/[id]` | Full project view: Chat, IDE, Milestones, Kanban, Quiz, Report, Resources |
| Simulation View | `/simulations/[id]` | View generated simulation details |
| Create Simulation | `/simulations/create` | Form to generate new simulation |

### Current UX Gaps Identified

1. **No guided onboarding journey**: User lands on dashboard with no clear "what to do first" path
2. **Disconnected features**: Chat, IDE, Review, Interview exist as isolated tools without a cohesive narrative
3. **No achievement or reward system**: Progress page shows levels but no badges, streaks, or gamification
4. **No dashboard activity feed**: User has no sense of "what happened recently" or "what to do next"
5. **Static resources page**: No curated learning paths tied to the user's field or level
6. **No loading states with personality**: Plain spinners instead of branded, engaging loading experiences
7. **No feature discovery**: User can miss 80% of the platform's capabilities (Interview, Code Review, IDE)
8. **No performance metrics visualization**: Chat analysis returns scores but no historical tracking or charts
9. **Missing empty states**: When user has no projects/simulations, pages show nothing meaningful
10. **Inconsistent visual language**: Some pages use glassmorphism, others use flat cards; no unified design tokens

---

## User Scenarios & Testing

### User Story 1 - Guided Post-Registration Onboarding (Priority: P1)

A new user registers and is immediately immersed in a premium 3-step onboarding experience that captures their field, experience level, and interests. Instead of a generic dashboard, the user is greeted by a visually stunning liquid-glass onboarding flow that feels like a personalized welcome -- not a survey.

After completing onboarding, the user sees a personalized dashboard with curated "Getting Started" actions based on their profile. The dashboard should feel like a command center, not an empty page.

**Why this priority**: First impressions define retention. A user who does not understand what Interna Virtual offers within the first 60 seconds will leave.

**Independent Test**: A newly registered user can complete the full onboarding flow and land on a personalized dashboard with at least 3 actionable "next steps" relevant to their profile.

**Acceptance Scenarios**:

1. **Given** a new user has just completed registration, **When** they first load the dashboard, **Then** a full-screen onboarding experience appears with liquid-glass aesthetic, collecting field, experience level, and interests in 3 animated steps.
2. **Given** a user completes onboarding, **When** the dashboard loads, **Then** it displays a personalized welcome with their name, a curated "Quick Start" section with exactly 3 recommended actions (e.g., "Start your first simulation," "Try a mock interview," "Review open-source code"), and an activity timeline placeholder.
3. **Given** a returning user (onboarding already completed), **When** they visit the dashboard, **Then** the onboarding flow does not appear, and the dashboard shows their recent activity, progress snapshot, and recommended next project.

---

### User Story 2 - Unified Dashboard Command Center (Priority: P1)

The dashboard home is the nerve center of the platform. It must communicate value immediately through: (a) a progress snapshot showing the user's current level, completed projects, and skills radar, (b) a "Continue Where You Left Off" section showing in-progress projects and active interviews, (c) a "Discover" section highlighting features the user has not yet explored, and (d) a quick-action toolbar for the most common tasks.

**Why this priority**: The dashboard is visited most frequently. If it is boring or uninformative, users will not return.

**Independent Test**: A user with 2+ completed projects sees their progress snapshot, an in-progress project card, and at least one "feature discovery" prompt on the dashboard.

**Acceptance Scenarios**:

1. **Given** a user with existing project history, **When** they visit the dashboard, **Then** they see a progress ring/bar showing their current level and XP, a mini skills radar chart, and a "streak" indicator.
2. **Given** a user has an in-progress simulation, **When** the dashboard loads, **Then** a "Continue" card appears with the project title, progress percentage, and a single-click resume button.
3. **Given** a user has never used the Interview Practice feature, **When** the dashboard loads, **Then** a "Discover" card appears promoting Interview Practice with a compelling description and a "Try Now" action.

---

### User Story 3 - Premium Project Workspace Experience (Priority: P1)

When a user enters a project (simulation), they experience a fully integrated workspace that combines: AI client chat (left panel), an in-browser IDE with file management (center), and project context (milestones, resources, kanban) in a tabbed sidebar (right). The workspace must feel like a professional IDE, not a student exercise.

The key interactions are: (a) chatting with the AI client persona to gather requirements, (b) writing code in the Monaco editor, (c) requesting AI code review, (d) generating a performance report that evaluates both communication and code quality, (e) tracking milestones and checking off deliverables.

**Why this priority**: This is the core product. The simulation workspace is where users spend 80% of their time.

**Independent Test**: A user can start a simulation, have a 5-message conversation with the AI client, write code in the IDE, get an AI review, and generate a performance report -- all without leaving the workspace.

**Acceptance Scenarios**:

1. **Given** a user opens a project, **When** the workspace loads, **Then** all panels (chat, IDE, sidebar) load simultaneously with skeleton loading states, and the AI client persona's initial message appears within 3 seconds.
2. **Given** a user writes code and clicks "Request AI Review," **When** the review completes, **Then** feedback appears in a styled panel below the editor with approve/reject visual indicators and actionable suggestions.
3. **Given** a user has exchanged 5+ messages and written code, **When** they click "Generate Performance Report," **Then** a comprehensive report appears showing soft skills scores, technical skill scores, an overall grade, and specific improvement recommendations.

---

### User Story 4 - AI Interview Practice Flow (Priority: P2)

Users can practice technical interviews with an AI interviewer. The flow is: (a) Setup -- select role, difficulty, and focus areas, (b) Active Session -- real-time voice/text conversation with the AI interviewer, (c) Feedback -- detailed performance breakdown with scores for each evaluated area.

The entire experience should feel like a real interview, with professional UI cues (timer, recording indicator, conversation history) and immediate, actionable feedback.

**Why this priority**: Interview preparation is a key differentiator for the platform and a major selling point.

**Independent Test**: A user can set up an interview (role + difficulty), exchange 10+ messages with the AI interviewer, end the session, and receive a structured feedback report with at least 5 scored categories.

**Acceptance Scenarios**:

1. **Given** a user navigates to Interview Practice, **When** the page loads, **Then** a setup form appears with role selection, difficulty slider, and focus area chips -- all with descriptive tooltips.
2. **Given** a user starts an interview session, **When** the session is active, **Then** a timer is visible, the AI responds within 5 seconds, and the conversation history scrolls smoothly.
3. **Given** a user ends an interview, **When** feedback is generated, **Then** a detailed report card appears with category scores (Communication, Problem Solving, Technical Depth, etc.), an overall rating, and "Next Steps" recommendations.

---

### User Story 5 - Standalone Code Review Tool (Priority: P2)

Users can paste a GitHub repository URL and receive an AI-powered comprehensive code review. The review process streams progress updates in real-time (SSE), showing which files are being analyzed. Upon completion, a full report is available with file-by-file feedback, overall score, and a downloadable summary.

**Why this priority**: Code review is a standalone tool that provides immediate value even without using simulations.

**Independent Test**: A user pastes a valid GitHub repo URL, initiates a review, sees streaming progress updates, and receives a complete report with per-file analysis within 2 minutes for repos under 50 files.

**Acceptance Scenarios**:

1. **Given** a user navigates to Code Review, **When** they paste a GitHub URL, **Then** a "Start Review" button becomes active with a preview showing the repo name.
2. **Given** a review is in progress, **When** SSE events stream, **Then** a live progress timeline on the left updates with each step (cloning, analyzing, reviewing) and a progress percentage.
3. **Given** a review completes, **When** the report is ready, **Then** a comprehensive report appears with an overall grade, per-file scores, critical issues highlighted, and a "Push to GitHub" option for annotated results.

---

### User Story 6 - Progress & Gamification System (Priority: P2)

Users see their growth through a multi-dimensional progress system: (a) Level progression (1-10) with descriptive tier names, (b) Skills radar chart showing strengths across dimensions (Communication, Code Quality, Problem Solving, etc.), (c) Achievement badges for milestones (first project, first review, 5-day streak, etc.), (d) XP accumulation from all activities (chat, code review, interview, quiz completion).

**Why this priority**: Gamification drives engagement and retention. Without visible progress, users plateau and leave.

**Independent Test**: A user who has completed 3 projects and 2 interviews can view their progress page and see: their current level, a skills radar with 6+ dimensions populated, and at least 2 earned badges.

**Acceptance Scenarios**:

1. **Given** a user visits My Progress, **When** the page loads, **Then** their current level is displayed as a large, animated hero element with a progress bar showing XP toward the next level.
2. **Given** a user has completed activities, **When** the skills radar renders, **Then** each dimension (Communication, Code Quality, Requirements Gathering, Technical Depth, Problem Solving, Professionalism) reflects actual scores from their chat analyses and reviews.
3. **Given** a user completes their first project, **When** they return to the progress page, **Then** a "First Project" badge appears with a celebratory animation.

---

### User Story 7 - Liquid Glass Design System & Visual Consistency (Priority: P3)

The entire platform adopts a consistent "liquid glass" design language: frosted glass surfaces, subtle gradient borders, depth through layered translucency, and smooth micro-animations. Every component -- cards, modals, buttons, navigation -- uses the same visual vocabulary. The Shadcn UI component library is the foundation, customized with the brand color palette (purples, violets, deep blues, with accent corals).

**Why this priority**: Visual consistency is what transforms a tool into a premium product. It must feel cohesive.

**Independent Test**: Screenshots of all 5 primary pages (Dashboard, Project, IDE, Interview, Progress) share the same visual language: glass-effect cards, consistent border radiuses, identical color tokens, and matching animation curves.

**Acceptance Scenarios**:

1. **Given** a user navigates between Dashboard and Project workspace, **When** looking at both pages, **Then** card styles, font sizes, spacing, and color usage are visually identical.
2. **Given** a modal opens on any page, **When** the modal appears, **Then** it uses a frosted glass backdrop, smooth scale-in animation, and the brand purple gradient on primary action buttons.
3. **Given** a user interacts with any button, **When** they hover, **Then** the button exhibits a subtle glow effect and scale animation consistent across all pages.

---

### Edge Cases

- What happens when the AI service is temporarily unavailable? Display a branded error state with retry option and estimated wait time.
- What happens when a user's session expires mid-project? Auto-save progress every 30 seconds and restore state on re-login.
- What happens when a new user has zero completed projects on the Progress page? Display an inspiring "Your Journey Begins" empty state with a single CTA to start their first project.
- What happens on slower connections? All data-heavy sections must show skeleton loading with glass shimmer, not blank screens.
- What happens when the user resizes the browser to mobile? All layouts must gracefully adapt; the project workspace should stack panels vertically with swipeable navigation.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a 3-step onboarding flow for new users that captures field, experience level, and interests before showing the dashboard.
- **FR-002**: Dashboard MUST display a personalized welcome section, progress snapshot, "Continue Where You Left Off" cards, and feature discovery prompts.
- **FR-003**: Project workspace MUST offer simultaneous access to AI chat, code editor, and project context (milestones, kanban, quiz, resources) in a single view.
- **FR-004**: System MUST stream real-time progress updates during code reviews via Server-Sent Events.
- **FR-005**: System MUST generate a comprehensive performance report combining chat analysis scores and code review scores.
- **FR-006**: Interview Practice MUST support setup (role, difficulty, focus areas), active session (real-time AI chat), and feedback (scored report).
- **FR-007**: Progress page MUST show user level, XP progress bar, skills radar chart, and earned achievement badges.
- **FR-008**: All pages MUST use consistent Shadcn UI components with liquid glass styling and the brand color palette.
- **FR-009**: All loading states MUST use branded skeleton loaders with glass shimmer effect.
- **FR-010**: Empty states on all pages MUST include descriptive messaging and a single primary CTA.
- **FR-011**: All pages MUST be fully responsive for mobile, tablet, and desktop viewports.
- **FR-012**: System MUST auto-save user code in the IDE every 30 seconds.
- **FR-013**: The sidebar navigation MUST indicate the current active page and support collapsed/expanded states with smooth animation.
- **FR-014**: System MUST track user activity (projects completed, reviews done, interviews taken) to populate the progress and dashboard sections.
- **FR-015**: System MUST provide micro-animations on all interactive elements (buttons, cards, modals, inputs) for a polished feel.

### Key Entities

- **User Profile**: Stores field, experience level, interests, current level, XP, streak count
- **Project/Simulation**: Title, description, domain, milestones, resources, quiz, status, timestamps
- **Chat Transcript**: Messages, roles, timestamps, linked to a project and persona
- **Performance Report**: Soft skills scores, technical skills scores, overall grade, summary, linked to a project
- **Review Job**: GitHub repo URL, status, streaming progress, per-file results, overall score
- **Interview Session**: Role, difficulty, focus areas, transcript, feedback scores
- **Achievement Badge**: Name, description, criteria, earned timestamp, linked to user
- **Activity Log**: Event type, timestamp, context (project ID, interview ID, etc.), linked to user

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: New users complete the onboarding flow within 60 seconds with a 90%+ completion rate.
- **SC-002**: Users visit the dashboard at least 3 times per week (measured by session analytics).
- **SC-003**: 70% of users who start a simulation complete at least one full chat -> code -> review -> report cycle.
- **SC-004**: Interview Practice receives a Net Promoter Score of 8+ out of 10 from users.
- **SC-005**: Code Review processes a 50-file repository and delivers results within 2 minutes.
- **SC-006**: All pages load their primary content within 2 seconds on a standard broadband connection.
- **SC-007**: Visual consistency audit: 95% of UI components across all pages use the design system tokens (verified via screenshot comparison).
- **SC-008**: Mobile usability: All 5 primary flows (onboarding, dashboard, project, interview, progress) are completable on a 375px viewport.
- **SC-009**: Users who engage with 3+ features (simulation + interview + code review) show 2x higher weekly retention than single-feature users.
- **SC-010**: Zero "dead-end" screens: every page must have at least one clear CTA directing the user to a meaningful next action.

---

## Assumptions

1. The existing backend services (simulation generation, chat, review, interview, analysis) are stable and production-ready.
2. User authentication and session management via NextAuth are working correctly.
3. The Shadcn UI component library will be extended with custom glass-effect variants, not replaced.
4. The existing Postgres database schema can be extended with new tables for achievements and activity logs.
5. The existing level system (1-10) will be retained but enhanced with XP and badge mechanics.
6. Mobile responsiveness will follow a "mobile-first" design approach using Tailwind CSS breakpoints.
7. All AI interactions use the Gemini 2.5 Flash model via the existing backend.
8. The existing color palette (purples/violets/deep blues) remains the brand foundation.
