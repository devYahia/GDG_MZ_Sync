import { IAchievementRepository } from "@/domain/repositories/achievement-repository";
import { Achievement, UserAchievement, EnrichedAchievement } from "@/domain/entities/achievement";
import { db } from "../drizzle";
import { achievements, userAchievements } from "../schema/achievements";
import { eq, and } from "drizzle-orm";

export class DrizzleAchievementRepository implements IAchievementRepository {
    async findAll(): Promise<Achievement[]> {
        const result = await db.select().from(achievements).orderBy(achievements.rarity);
        return result as unknown as Achievement[];
    }

    async findByUserId(userId: string): Promise<UserAchievement[]> {
        const result = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
        return result as unknown as UserAchievement[];
    }

    async getEnrichedAchievements(userId: string): Promise<EnrichedAchievement[]> {
        const allAchievements = await this.findAll();
        const userUnlocked = await this.findByUserId(userId);

        const unlockedIds = new Set(userUnlocked.map(ua => ua.achievementId));

        return allAchievements.map(a => ({
            ...a,
            unlocked: unlockedIds.has(a.id),
            unlockedAt: userUnlocked.find(ua => ua.achievementId === a.id)?.unlockedAt ?? null,
        }));
    }

    async unlock(userId: string, achievementId: string): Promise<void> {
        // Check if already unlocked
        const existing = await db.select()
            .from(userAchievements)
            .where(
                and(
                    eq(userAchievements.userId, userId),
                    eq(userAchievements.achievementId, achievementId)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            await db.insert(userAchievements).values({
                userId,
                achievementId,
            });
        }
    }
}
