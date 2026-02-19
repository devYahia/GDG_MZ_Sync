"use server";

import { db } from "@/infrastructure/database/drizzle";
import { auth } from "@/infrastructure/auth/auth";
import {
    activityLog,
    skillScores,
    users,
    achievements,
    userAchievements,
    interviewSessions,
    internProgress
} from "@/infrastructure/database/schema";
import { XP_AWARDS, getLevelFromXp } from "@/lib/xp";
import { ACHIEVEMENTS_LIST } from "@/lib/achievements";
import { eq, sql, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Activity Logging (T013)
// ---------------------------------------------------------------------------
export async function logActivity(
    eventType: string,
    contextType?: string,
    contextId?: string,
    metadata?: Record<string, unknown>,
) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    try {
        // 1. Insert activity log
        await db.insert(activityLog).values({
            userId,
            eventType,
            contextType,
            contextId,
            metadata,
        });

        // 2. Calculate XP award
        const xpAmount = XP_AWARDS[eventType as keyof typeof XP_AWARDS] || 0;

        if (xpAmount > 0) {
            // 3. Update user XP and Level
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            });

            if (user) {
                const newXp = (user.xp || 0) + xpAmount;
                const newLevelInfo = getLevelFromXp(newXp);

                await db.update(users)
                    .set({
                        xp: newXp,
                        currentLevel: newLevelInfo.level,
                    })
                    .where(eq(users.id, userId));
            }
        }

        // 4. Check achievements
        await checkAndAwardAchievements(userId);

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/progress");
        return { success: true };
    } catch (error) {
        console.error("Failed to log activity:", error);
        return { success: false, error: String(error) };
    }
}

// ---------------------------------------------------------------------------
// Skill Scores (T014)
// ---------------------------------------------------------------------------
export async function saveSkillScores(input: {
    sourceType: string;
    sourceId?: string;
    communication: number;
    codeQuality: number;
    requirementsGathering: number;
    technicalDepth: number;
    problemSolving: number;
    professionalism: number;
    overallScore: number;
}) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    try {
        await db.insert(skillScores).values({ ...input, userId });
        revalidatePath("/dashboard/progress");
        return { success: true };
    } catch (error) {
        console.error("Failed to save skill scores:", error);
        return { success: false, error: String(error) };
    }
}

// ---------------------------------------------------------------------------
// Seed Achievements (T015)
// ---------------------------------------------------------------------------
export async function seedAchievements() {
    try {
        for (const ach of ACHIEVEMENTS_LIST) {
            const existing = await db.query.achievements.findFirst({
                where: eq(achievements.slug, ach.slug),
            });

            if (!existing) {
                await db.insert(achievements).values({
                    slug: ach.slug,
                    title: ach.title,
                    description: ach.description,
                    icon: ach.icon,
                    category: ach.category,
                    rarity: ach.rarity,
                    xpReward: ach.xpReward,
                    creditReward: ach.creditReward,
                });
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to seed achievements:", error);
        return { success: false, error: String(error) };
    }
}

// ---------------------------------------------------------------------------
// Onboarding Profile Update (restored -- used by LiquidGlassBubble)
// ---------------------------------------------------------------------------
export async function updateOnboardingProfile(data: {
    field: string;
    experience_level: string;
    interests: string[];
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        await db.update(users).set({
            field: data.field,
            experienceLevel: data.experience_level,
            interests: data.interests,
            onboardingCompleted: true,
        }).where(eq(users.id, session.user.id));

        // Log the activity
        await logActivity("onboarding_completed", undefined, undefined, data);

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: unknown) {
        console.error("Failed to update onboarding profile:", error);
        return { error: error instanceof Error ? error.message : String(error) };
    }
}

// ---------------------------------------------------------------------------
// Internal: Achievement Checker
// ---------------------------------------------------------------------------
async function checkAndAwardAchievements(userId: string) {
    // Fetch user stats in parallel
    const [
        simsCompleted,
        reviewsRequested,
        interviewsCompleted,
        interviewHighScores,
        userRec,
    ] = await Promise.all([
        db.select({ count: count() })
            .from(internProgress)
            .where(and(eq(internProgress.userId, userId), eq(internProgress.status, "completed"))),
        db.select({ count: count() })
            .from(activityLog)
            .where(and(eq(activityLog.userId, userId), eq(activityLog.eventType, "code_review_requested"))),
        db.select({ count: count() })
            .from(interviewSessions)
            .where(and(eq(interviewSessions.userId, userId), eq(interviewSessions.status, "completed"))),
        db.select({ count: count() })
            .from(interviewSessions)
            .where(and(eq(interviewSessions.userId, userId), sql`overall_rating >= 80`)),
        db.query.users.findFirst({ where: eq(users.id, userId) }),
    ]);

    const stats = {
        simulationsCompleted: Number(simsCompleted[0].count),
        reviewsRequested: Number(reviewsRequested[0].count),
        reviewsApproved: 0, // TODO: Track review approval result
        interviewsCompleted: Number(interviewsCompleted[0].count),
        interviewHighScores: Number(interviewHighScores[0].count),
        streakDays: userRec?.streakDays || 0,
    };

    // Fetch all achievements and user's earned set
    const [allAchievements, userAchs] = await Promise.all([
        db.query.achievements.findMany(),
        db.query.userAchievements.findMany({
            where: eq(userAchievements.userId, userId),
        }),
    ]);

    const achievementMap = new Map(allAchievements.map(a => [a.id, a]));
    const earnedAchievementIds = new Set(userAchs.map(ua => ua.achievementId));

    const earnedSlugSet = new Set<string>();
    for (const id of earnedAchievementIds) {
        const ach = achievementMap.get(id);
        if (ach) earnedSlugSet.add(ach.slug);
    }

    // Iterate and award new achievements
    for (const achDef of ACHIEVEMENTS_LIST) {
        if (earnedSlugSet.has(achDef.slug)) continue;

        if (achDef.condition(stats)) {
            const dbAch = allAchievements.find(a => a.slug === achDef.slug);
            if (dbAch) {
                await db.insert(userAchievements).values({
                    userId,
                    achievementId: dbAch.id,
                });

                await db.insert(activityLog).values({
                    userId,
                    eventType: "achievement_unlocked",
                    contextType: "achievement",
                    contextId: dbAch.id,
                    metadata: { slug: achDef.slug, title: achDef.title },
                });

                if (achDef.xpReward > 0) {
                    await db.execute(
                        sql`UPDATE "user" SET xp = xp + ${achDef.xpReward} WHERE id = ${userId}`
                    );
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Dashboard Data Fetcher (T020)
// ---------------------------------------------------------------------------
import { avg, desc } from "drizzle-orm";
import { TASKS } from "@/lib/tasks";
import { getXpProgress } from "@/lib/xp";

export interface InProgressProject {
    projectId: string;
    title: string;
    field: string;
    difficulty: string;
    progressPercent: number;
    lastActivityAt: Date | null;
}

export interface DashboardData {
    user: {
        name: string | null;
        field: string;
        experienceLevel: string;
        xp: number;
        currentLevel: number;
        streakDays: number;
        credits: number;
        onboardingCompleted: boolean;
    };
    xpProgress: { currentLevel: number; nextLevel: number | null; progressPercent: number; xpToNext: number; currentLevelTitle: string };
    inProgressProjects: InProgressProject[];
    recentActivity: Array<{
        id: string;
        eventType: string;
        contextType: string | null;
        contextId: string | null;
        metadata: unknown;
        createdAt: Date;
    }>;
    earnedBadges: Array<{
        slug: string;
        title: string;
        icon: string;
        rarity: string;
        unlockedAt: Date;
    }>;
    skillAverages: {
        communication: number;
        codeQuality: number;
        requirementsGathering: number;
        technicalDepth: number;
        problemSolving: number;
        professionalism: number;
        overallScore: number;
    } | null;
    discoveredEventTypes: Set<string>;
}

export async function getDashboardData(): Promise<DashboardData | null> {
    const session = await auth();
    if (!session?.user?.id) return null;
    const userId = session.user.id;

    const [
        userRec,
        progressRows,
        recentActivityRows,
        earnedBadgeRows,
        skillAvgRows,
        discoveredRows,
    ] = await Promise.all([
        // User profile
        db.query.users.findFirst({ where: eq(users.id, userId) }),

        // In-progress projects
        db.select()
            .from(internProgress)
            .where(and(eq(internProgress.userId, userId), eq(internProgress.status, "in_progress")))
            .orderBy(desc(internProgress.lastActivityAt))
            .limit(5),

        // Recent activity (last 10)
        db.select()
            .from(activityLog)
            .where(eq(activityLog.userId, userId))
            .orderBy(desc(activityLog.createdAt))
            .limit(10),

        // Earned badges (join user_achievements -> achievements)
        db.select({
            slug: achievements.slug,
            title: achievements.title,
            icon: achievements.icon,
            rarity: achievements.rarity,
            unlockedAt: userAchievements.unlockedAt,
        })
            .from(userAchievements)
            .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
            .where(eq(userAchievements.userId, userId))
            .orderBy(desc(userAchievements.unlockedAt)),

        // Skill averages
        db.select({
            communication: avg(skillScores.communication),
            codeQuality: avg(skillScores.codeQuality),
            requirementsGathering: avg(skillScores.requirementsGathering),
            technicalDepth: avg(skillScores.technicalDepth),
            problemSolving: avg(skillScores.problemSolving),
            professionalism: avg(skillScores.professionalism),
            overallScore: avg(skillScores.overallScore),
        })
            .from(skillScores)
            .where(eq(skillScores.userId, userId)),

        // Distinct event types user has tried
        db.selectDistinct({ eventType: activityLog.eventType })
            .from(activityLog)
            .where(eq(activityLog.userId, userId)),
    ]);

    if (!userRec) return null;

    // Map in-progress projects against TASKS catalogue
    const inProgressProjects: InProgressProject[] = progressRows.map((row) => {
        const task = TASKS.find((t) => t.id === row.projectId);
        return {
            projectId: row.projectId,
            title: task?.title ?? row.projectId,
            field: task?.field ?? "frontend",
            difficulty: task?.difficulty ?? "medium",
            progressPercent: 30, // TODO: compute real progress from messages/reviews
            lastActivityAt: row.lastActivityAt,
        };
    });

    const avgRow = skillAvgRows[0];
    const skillAverages = avgRow && avgRow.overallScore !== null
        ? {
            communication: Number(avgRow.communication) || 0,
            codeQuality: Number(avgRow.codeQuality) || 0,
            requirementsGathering: Number(avgRow.requirementsGathering) || 0,
            technicalDepth: Number(avgRow.technicalDepth) || 0,
            problemSolving: Number(avgRow.problemSolving) || 0,
            professionalism: Number(avgRow.professionalism) || 0,
            overallScore: Number(avgRow.overallScore) || 0,
        }
        : null;

    const discoveredEventTypes = new Set(discoveredRows.map((r) => r.eventType));

    const xpProgress = getXpProgress(userRec.xp ?? 0);

    return {
        user: {
            name: userRec.name,
            field: userRec.field ?? "frontend",
            experienceLevel: userRec.experienceLevel ?? "student",
            xp: userRec.xp ?? 0,
            currentLevel: userRec.currentLevel ?? 1,
            streakDays: userRec.streakDays ?? 0,
            credits: userRec.credits ?? 0,
            onboardingCompleted: userRec.onboardingCompleted ?? false,
        },
        xpProgress,
        inProgressProjects,
        recentActivity: recentActivityRows,
        earnedBadges: earnedBadgeRows,
        skillAverages,
        discoveredEventTypes,
    };
}

// ---------------------------------------------------------------------------
// Save Interview Session (T033)
// ---------------------------------------------------------------------------
export async function saveInterviewSession(input: {
    role: string;
    difficulty: string;
    focusAreas: string[];
    transcript: unknown[];
    feedbackScores: Record<string, number>;
    overallRating: number;
    durationMinutes: number;
}) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    try {
        await db.insert(interviewSessions).values({
            userId,
            role: input.role,
            difficulty: input.difficulty,
            focusAreas: input.focusAreas,
            status: "completed",
            transcript: input.transcript,
            feedbackScores: input.feedbackScores,
            overallRating: input.overallRating,
            durationMinutes: input.durationMinutes,
            completedAt: new Date(),
        });

        await logActivity("interview_completed", "interview", undefined, {
            role: input.role,
            overallRating: input.overallRating,
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/progress");
        return { success: true };
    } catch (error) {
        console.error("Failed to save interview session:", error);
        return { success: false, error: String(error) };
    }
}

// ---------------------------------------------------------------------------
// Progress Page Data (T041)
// ---------------------------------------------------------------------------
export interface ProgressPageData {
    currentLevel: number;
    xp: number;
    xpProgress: { currentLevel: number; nextLevel: number | null; progressPercent: number; xpToNext: number; currentLevelTitle: string };
    streakDays: number;
    totalProjects: number;
    totalReviews: number;
    totalInterviews: number;
    skillRadar: {
        communication: number;
        codeQuality: number;
        requirementsGathering: number;
        technicalDepth: number;
        problemSolving: number;
        professionalism: number;
    } | null;
    badges: Array<{
        slug: string;
        title: string;
        description: string;
        icon: string;
        rarity: string;
        earned: boolean;
        unlockedAt: Date | null;
    }>;
}

export async function getProgressData(): Promise<ProgressPageData | null> {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    const userRec = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    if (!userRec) return null;

    // Count activities by type
    const [projectCount] = await db
        .select({ count: count() })
        .from(activityLog)
        .where(and(eq(activityLog.userId, userId), eq(activityLog.eventType, "simulation_completed")));

    const [reviewCount] = await db
        .select({ count: count() })
        .from(activityLog)
        .where(and(eq(activityLog.userId, userId), eq(activityLog.eventType, "code_review_completed")));

    const [interviewCount] = await db
        .select({ count: count() })
        .from(activityLog)
        .where(and(eq(activityLog.userId, userId), eq(activityLog.eventType, "interview_completed")));

    // AVG skill scores
    const skillAvgRows = await db
        .select({
            communication: avg(skillScores.communication),
            codeQuality: avg(skillScores.codeQuality),
            requirementsGathering: avg(skillScores.requirementsGathering),
            technicalDepth: avg(skillScores.technicalDepth),
            problemSolving: avg(skillScores.problemSolving),
            professionalism: avg(skillScores.professionalism),
        })
        .from(skillScores)
        .where(eq(skillScores.userId, userId));

    const avgRow = skillAvgRows[0];
    const skillRadar = avgRow && Number(avgRow.communication) > 0
        ? {
            communication: Number(avgRow.communication) || 0,
            codeQuality: Number(avgRow.codeQuality) || 0,
            requirementsGathering: Number(avgRow.requirementsGathering) || 0,
            technicalDepth: Number(avgRow.technicalDepth) || 0,
            problemSolving: Number(avgRow.problemSolving) || 0,
            professionalism: Number(avgRow.professionalism) || 0,
        }
        : null;

    // All badges with earned status
    const allBadges = await db.select().from(achievements);
    const earnedMap = new Map<string, Date>();
    const earnedRows = await db
        .select({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));
    for (const row of earnedRows) {
        earnedMap.set(row.achievementId, row.unlockedAt);
    }

    const badges = allBadges.map((b) => ({
        slug: b.slug,
        title: b.title,
        description: b.description,
        icon: b.icon,
        rarity: b.rarity,
        earned: earnedMap.has(b.id),
        unlockedAt: earnedMap.get(b.id) ?? null,
    }));

    const xpProgress = getXpProgress(userRec.xp ?? 0);

    return {
        currentLevel: userRec.currentLevel ?? 1,
        xp: userRec.xp ?? 0,
        xpProgress,
        streakDays: userRec.streakDays ?? 0,
        totalProjects: projectCount?.count ?? 0,
        totalReviews: reviewCount?.count ?? 0,
        totalInterviews: interviewCount?.count ?? 0,
        skillRadar,
        badges,
    };
}
