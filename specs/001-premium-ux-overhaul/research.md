# Research: Premium UX Overhaul

**Feature**: 001-premium-ux-overhaul  
**Date**: 2026-02-18  
**Status**: Complete

---

## R1: Design System Architecture for Liquid Glass + Shadcn UI

**Decision**: Extend the existing Shadcn UI components with custom CSS utility classes (`glass-card`, `liquid-glass`) already defined in `globals.css`. Add new Shadcn components as needed (tabs, tooltip, progress, skeleton, dropdown-menu, sheet, popover, chart). Do NOT create a parallel component library.

**Rationale**: The project already defines `.glass-card` and `.liquid-glass` CSS classes with frosted glass gradients, backdrop-blur, and border treatments. Shadcn components accept `className` props, so applying glass effects to existing components (Card, Dialog, etc.) requires zero component rewrites. Adding missing components via `npx shadcn@latest add` is faster than custom-building them.

**Alternatives considered**:
- Full custom design system from scratch -- rejected because Shadcn already provides accessibility, keyboard navigation, and TypeScript types for free.
- Radix UI directly without Shadcn wrappers -- rejected because the project already uses Shadcn conventions and changing patterns mid-project adds confusion.

---

## R2: State Management for Dashboard Data (Activity, Progress, Discovery)

**Decision**: Use server components for initial data fetch (Next.js App Router `page.tsx` with `async` server component), pass data as props to client components. Use Zustand only for cross-component ephemeral state (e.g., sidebar collapse). No new global state stores for dashboard data.

**Rationale**: The existing pattern in the codebase (e.g., `DashboardWithOnboarding`, `ProfilePage`) already follows this: the `page.tsx` server component fetches data from the database via Drizzle ORM and passes it down. This keeps the data flow predictable and avoids client-side cache staleness.

**Alternatives considered**:
- React Query / SWR for client-side data fetching -- rejected because the App Router server component pattern is already established and sufficient. Adding a client-side cache layer adds complexity without clear benefit for this use case.
- Zustand for all dashboard state -- rejected because it would require hydrating client stores from server data, adding boilerplate.

---

## R3: Gamification Data Model (XP, Badges, Activity Log)

**Decision**: Extend the existing database schema with two new tables: `activity_log` (tracks all user actions) and `skill_scores` (stores dimensional skill scores from chat analysis and reviews). Leverage the existing `achievements` and `user_achievements` tables (already in schema) for badges. XP and streak are already columns on the `user` table.

**Rationale**: The existing schema already has `xp`, `currentLevel`, `streakDays` on the `user` table, and `achievements` + `user_achievements` tables. The only missing pieces are: (1) an activity log to power the "Continue Where You Left Off" dashboard section, and (2) a skill scores table to power the radar chart. This is a minimal schema extension.

**Alternatives considered**:
- Storing activity events in a separate analytics service (e.g., Mixpanel, PostHog) -- rejected because dashboard rendering depends on this data, and round-tripping to an external service adds latency and complexity.
- Embedding skill scores in the `user` table as JSONB -- rejected because dimensional scores change per activity and need historical tracking for radar chart aggregation.

---

## R4: Skills Radar Chart Rendering

**Decision**: Use Recharts (via the `@shadcn/chart` component wrapper) for the skills radar chart. Shadcn provides a pre-built Chart component that wraps Recharts with consistent styling.

**Rationale**: Recharts is the charting library that Shadcn UI officially supports. The `@shadcn/chart` component provides theming integration (respects CSS variables), responsive container behavior, and tooltip styling that matches the design system. It also supports RadarChart out of the box.

**Alternatives considered**:
- Chart.js -- rejected because it uses canvas rendering (not SVG), which makes it harder to style with CSS variables and harder to animate with Framer Motion.
- D3.js directly -- rejected because it requires significantly more code for a radar chart and the project does not need that level of customization.
- Nivo -- rejected because it adds another dependency when Recharts is already the Shadcn-blessed solution.

---

## R5: Skeleton Loading with Glass Shimmer

**Decision**: Use the Shadcn `Skeleton` component with a custom CSS animation class (`glass-shimmer`) that applies a moving gradient shimmer over the existing `liquid-glass` background. This creates a branded loading state that matches the design language.

**Rationale**: The Skeleton component from Shadcn is a simple `div` with a pulsing animation. By replacing the default pulse with a custom shimmer that uses the brand's purple gradient, we achieve a premium loading feel without a custom component.

**Alternatives considered**:
- Custom skeleton component from scratch -- rejected because Shadcn's Skeleton handles sizing, spacing, and composition (e.g., `SkeletonCircle`, `SkeletonText`) out of the box.
- Lottie animations for loading -- rejected because they add significant bundle size and are overkill for skeleton placeholders.

---

## R6: Mobile Responsiveness Strategy for Project Workspace

**Decision**: The project workspace (3-panel: Chat, IDE, Sidebar) will use a mobile-first approach where panels stack vertically below `lg` breakpoint (1024px). On mobile, a bottom tab bar allows switching between Chat, Code, and Context tabs. The sidebar panels (Milestones, Kanban, Quiz) become swipeable cards within the Context tab.

**Rationale**: The 3-panel layout is only practical on screens wider than 1024px. On smaller screens, showing all 3 simultaneously would make each panel too narrow to be usable. A tab-based approach is the standard pattern for complex mobile workspaces (VS Code Mobile, Figma Mobile, Notion).

**Alternatives considered**:
- Collapsible panels with drag handles -- rejected because on small screens, even collapsed panels take up space, and the interaction of dragging panels on mobile is frustrating.
- Separate pages per panel -- rejected because it breaks the "single workspace" mental model and forces full page reloads.

---

## R7: Auto-Save Strategy for IDE Code

**Decision**: Use a debounced save mechanism: on each keystroke, reset a 2-second debounce timer. When the timer fires, persist the current file content to `localStorage` keyed by `project-{id}-file-{path}`. Additionally, a 30-second interval save writes to the backend via the existing `/api/repo/extract` flow (or a new lightweight save endpoint). On page load, check `localStorage` first, then fall back to backend.

**Rationale**: Debounced saves reduce write frequency while ensuring no data is lost. localStorage provides instant recovery on browser crash. The 30-second backend save provides recovery across devices.

**Alternatives considered**:
- Save on every keystroke to backend -- rejected because it would flood the backend with requests, especially for fast typists.
- Save only on explicit "Save" button click -- rejected because users expect auto-save in modern editors, and forgetting to save causes frustration and data loss.

---

## R8: Feature Discovery Logic

**Decision**: Track which features a user has tried via the `activity_log` table. On dashboard load, query for distinct `event_type` values for the user. Compare against the full feature set. Any feature not yet tried gets a "Discover" card on the dashboard. Once a user tries a feature, the card disappears on next dashboard visit.

**Rationale**: This is a simple, data-driven approach that does not require a separate "feature flags" system. The activity log is already needed for "Continue Where You Left Off," so feature discovery piggybacks on the same data.

**Alternatives considered**:
- Hardcoded feature checklist in user profile -- rejected because it requires manual updates when new features are added.
- Tour.js or similar guided tour library -- rejected because tours are intrusive and most users dismiss them. Discovery cards are passive and non-blocking.
