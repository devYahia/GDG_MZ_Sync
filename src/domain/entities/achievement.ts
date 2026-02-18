export interface Achievement {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    creditReward: number;
    rarity: string;
    createdAt: Date;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: Date;
}

export interface EnrichedAchievement extends Achievement {
    unlocked: boolean;
    unlockedAt: Date | null;
}
