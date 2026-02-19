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
export async function logActivity(input: {
    userId: string;
    eventType: string;
    contextType?: string;
    contextId?: string;
    metadata?: Record<string, unknown>;
}) {
    const { userId, eventType, contextType, contextId, metadata } = input;

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
    userId: string;
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
    try {
        await db.insert(skillScores).values(input);
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
        await logActivity({
            userId: session.user.id,
            eventType: "onboarding_completed",
            metadata: data,
        });

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
