# Data Model: Premium UX Overhaul

**Feature**: 001-premium-ux-overhaul  
**Date**: 2026-02-18  
**Status**: Complete

---

## Existing Entities (No Changes Required)

### User (`user` table) -- EXISTING
Already has all needed gamification columns.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | text | Display name |
| email | text (unique) | Login email |
| field | text | "frontend", "backend", "fullstack", "mobile", "data", "design" |
| experienceLevel | text | "student", "fresh_grad", "junior" |
| interests | text[] | e.g. ["React", "Python", "AI/ML"] |
| onboardingCompleted | boolean | Has the user finished the 3-step onboarding? |
| xp | integer | Total accumulated experience points (default: 0) |
| currentLevel | integer | 1-10 (default: 1) |
| streakDays | integer | Consecutive active days (default: 0) |
| credits | integer | Available credits for AI features (default: 10) |
| isPremium | boolean | Premium subscription flag |
| createdAt | timestamp | Registration timestamp |
| updatedAt | timestamp | Last profile update |

### Achievements (`achievements` table) -- EXISTING
Defines the catalog of all possible badges.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| slug | text (unique) | e.g. "first-project", "review-master", "streak-7" |
| title | text | Display name: "First Project" |
| description | text | What the user did to earn it |
| icon | text | Lucide icon name: "trophy", "star", "zap" |
| category | text | "project", "review", "interview", "streak", "social" |
| xpReward | integer | XP awarded when unlocked |
| creditReward | integer | Credits awarded when unlocked |
| rarity | text | "common", "rare", "epic", "legendary" |

### User Achievements (`user_achievements` table) -- EXISTING
Junction table tracking which users earned which badges.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| userId | UUID (FK -> user) | The user who earned it |
| achievementId | UUID (FK -> achievements) | The badge earned |
| unlockedAt | timestamp | When the badge was unlocked |

### Simulations (`simulations` table) -- EXISTING
No changes needed.

### Intern Progress (`intern_progress` table) -- EXISTING
Tracks per-project status for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| userId | UUID (FK -> user) | The user |
| projectId | text | Predefined task ID or simulation UUID |
| status | text | "in_progress", "completed", "paused" |
| lastActivityAt | timestamp | Last time user worked on this |
| lastReviewAt | timestamp | Last code review timestamp |
| lastReviewApproved | boolean | Was the last review passing? |

---

## New Entities (Schema Extensions)

### Activity Log (`activity_log` table) -- NEW

Tracks ALL user actions across the platform for dashboard "Continue" and "Discover" features.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| userId | UUID (FK -> user, ON DELETE CASCADE) | The user |
| eventType | text (NOT NULL) | Enum-like: "simulation_started", "simulation_completed", "chat_message_sent", "code_review_requested", "code_review_completed", "interview_started", "interview_completed", "quiz_completed", "report_generated", "achievement_unlocked" |
| contextType | text | What entity this relates to: "simulation", "review", "interview", null |
| contextId | text | The UUID/ID of the related entity |
| metadata | JSONB | Extra data (e.g., {"score": 85}, {"duration_minutes": 30}) |
| createdAt | timestamp (NOT NULL) | When the event happened |

**Indexes**:
- `idx_activity_log_user_id` on `userId`
- `idx_activity_log_user_event` on `(userId, eventType)`
- `idx_activity_log_created` on `createdAt` DESC

**Relationships**:
- Many-to-One with `user` (userId -> user.id)
- Soft reference to simulations, reviews, interviews via contextType + contextId

---

### Skill Scores (`skill_scores` table) -- NEW

Stores per-activity dimensional skill scores for the radar chart visualization.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| userId | UUID (FK -> user, ON DELETE CASCADE) | The user |
| sourceType | text (NOT NULL) | "chat_analysis", "code_review", "interview_feedback" |
| sourceId | text | The ID of the activity that produced the scores |
| communication | integer | 0-100 score for communication skills |
| codeQuality | integer | 0-100 score for code quality |
| requirementsGathering | integer | 0-100 score for requirements gathering |
| technicalDepth | integer | 0-100 score for technical knowledge |
| problemSolving | integer | 0-100 score for problem solving ability |
| professionalism | integer | 0-100 score for professionalism/soft skills |
| overallScore | integer | 0-100 weighted average |
| createdAt | timestamp (NOT NULL) | When the scores were recorded |

**Indexes**:
- `idx_skill_scores_user_id` on `userId`
- `idx_skill_scores_source` on `(userId, sourceType)`

**Relationships**:
- Many-to-One with `user` (userId -> user.id)
- Soft reference to activities via sourceType + sourceId

**State Transitions**: None (append-only, no updates)

---

### Interview Sessions (`interview_sessions` table) -- NEW

Persists interview practice sessions for history and progress tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| userId | UUID (FK -> user, ON DELETE CASCADE) | The user |
| role | text (NOT NULL) | Job title being interviewed for |
| difficulty | text (NOT NULL) | "junior", "mid", "senior" |
| focusAreas | text[] | Areas of focus: ["algorithms", "system-design", "react"] |
| status | text (NOT NULL) | "active", "completed", "abandoned" |
| transcript | JSONB | Full conversation: [{role, content, timestamp}] |
| feedbackScores | JSONB | Category scores: {communication: 80, ...} |
| overallRating | integer | 0-100 overall score |
| durationMinutes | integer | Session length in minutes |
| createdAt | timestamp (NOT NULL) | Session start time |
| completedAt | timestamp | Session end time |

**Indexes**:
- `idx_interview_sessions_user_id` on `userId`
- `idx_interview_sessions_status` on `(userId, status)`

**State Transitions**:
- `active` -> `completed` (user ends session and feedback is generated)
- `active` -> `abandoned` (user leaves without ending)

---

## Entity Relationship Summary

```
user (1) ----< (N) activity_log
user (1) ----< (N) skill_scores
user (1) ----< (N) interview_sessions
user (1) ----< (N) intern_progress
user (1) ----< (N) user_achievements
user (1) ----< (N) simulations

achievements (1) ----< (N) user_achievements

simulations (1) ----< (N) personas
```

---

## XP Level Thresholds

| Level | XP Required | Cumulative XP | Title |
|-------|------------|---------------|-------|
| 1 | 0 | 0 | Intern Arrival |
| 2 | 100 | 100 | First Steps |
| 3 | 250 | 350 | Getting Traction |
| 4 | 500 | 850 | Balanced |
| 5 | 750 | 1600 | Pressure Check |
| 6 | 1000 | 2600 | Deep Dive |
| 7 | 1500 | 4100 | Full Challenge |
| 8 | 2000 | 6100 | Expert Pressure |
| 9 | 3000 | 9100 | Architectural Lead |
| 10 | 5000 | 14100 | Visionary |

## XP Awards per Activity

| Activity | XP Awarded |
|----------|-----------|
| Complete onboarding | 25 |
| Start a simulation | 10 |
| Complete a simulation | 50-150 (based on difficulty) |
| Send a chat message | 2 |
| Request code review | 15 |
| Pass code review (approved) | 30 |
| Complete interview session | 40 |
| Score 80+ on interview | 20 bonus |
| Complete quiz | 25 |
| Generate performance report | 20 |
| Daily login (streak) | 5 |

## Seed Achievements

| Slug | Title | Category | Rarity | XP | Criteria |
|------|-------|----------|--------|-----|---------|
| first-project | First Project | project | common | 25 | Complete 1 simulation |
| code-warrior | Code Warrior | project | rare | 50 | Complete 5 simulations |
| review-rookie | Review Rookie | review | common | 15 | Request 1 code review |
| review-master | Review Master | review | epic | 75 | Get 5 approved reviews |
| interviewer | Mock Interviewer | interview | common | 20 | Complete 1 interview |
| interview-ace | Interview Ace | interview | rare | 50 | Score 80+ in 3 interviews |
| streak-3 | 3-Day Streak | streak | common | 10 | 3 consecutive daily logins |
| streak-7 | Week Warrior | streak | rare | 30 | 7 consecutive daily logins |
| streak-30 | Monthly Master | streak | legendary | 100 | 30 consecutive daily logins |
| perfectionist | Perfectionist | review | legendary | 100 | Score 95+ on a code review |
