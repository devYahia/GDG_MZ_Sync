import { Achievement, UserAchievement, EnrichedAchievement } from "../entities/achievement";

export interface IAchievementRepository {
    findAll(): Promise<Achievement[]>;
    findByUserId(userId: string): Promise<UserAchievement[]>;
    getEnrichedAchievements(userId: string): Promise<EnrichedAchievement[]>;
    unlock(userId: string, achievementId: string): Promise<void>;
}
