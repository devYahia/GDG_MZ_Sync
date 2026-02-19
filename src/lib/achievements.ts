
import { type InferSelectModel } from "drizzle-orm";
// import { users, achievements, userAchievements } from "@/infrastructure/database/schema"; 
// Avoid circular deps or heavy imports here, keep it pure logic if possible.
// Actually, we'll need types. Let's define interfaces.

export interface AchievementDef {
    slug: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    category: "project" | "review" | "interview" | "streak" | "social";
    rarity: "common" | "rare" | "epic" | "legendary";
    xpReward: number;
    creditReward: number;
    condition: (stats: UserStats) => boolean;
}

export interface UserStats {
    simulationsCompleted: number;
    reviewsRequested: number;
    reviewsApproved: number;
    interviewsCompleted: number;
    interviewHighScores: number; // Score > 80
    streakDays: number;
    lastReviewScore?: number;
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
    {
        slug: "first-project",
        title: "First Project",
        description: "Complete your first simulation.",
        icon: "trophy",
        category: "project",
        rarity: "common",
        xpReward: 25,
        creditReward: 0,
        condition: (stats) => stats.simulationsCompleted >= 1,
    },
    {
        slug: "code-warrior",
        title: "Code Warrior",
        description: "Complete 5 simulations.",
        icon: "swords",
        category: "project",
        rarity: "rare",
        xpReward: 50,
        creditReward: 10,
        condition: (stats) => stats.simulationsCompleted >= 5,
    },
    {
        slug: "review-rookie",
        title: "Review Rookie",
        description: "Request your first code review.",
        icon: "git-pull-request",
        category: "review",
        rarity: "common",
        xpReward: 15,
        creditReward: 0,
        condition: (stats) => stats.reviewsRequested >= 1,
    },
    {
        slug: "review-master",
        title: "Review Master",
        description: "Get 5 approved reviews.",
        icon: "check-circle-2",
        category: "review",
        rarity: "epic",
        xpReward: 75,
        creditReward: 20,
        condition: (stats) => stats.reviewsApproved >= 5,
    },
    {
        slug: "interviewer",
        title: "Mock Interviewer",
        description: "Complete your first mock interview.",
        icon: "mic",
        category: "interview",
        rarity: "common",
        xpReward: 20,
        creditReward: 0,
        condition: (stats) => stats.interviewsCompleted >= 1,
    },
    {
        slug: "interview-ace",
        title: "Interview Ace",
        description: "Score 80+ in 3 interviews.",
        icon: "star",
        category: "interview",
        rarity: "rare",
        xpReward: 50,
        creditReward: 10,
        condition: (stats) => stats.interviewHighScores >= 3,
    },
    {
        slug: "streak-3",
        title: "3-Day Streak",
        description: "Login for 3 consecutive days.",
        icon: "flame",
        category: "streak",
        rarity: "common",
        xpReward: 10,
        creditReward: 0,
        condition: (stats) => stats.streakDays >= 3,
    },
    {
        slug: "streak-7",
        title: "Week Warrior",
        description: "Login for 7 consecutive days.",
        icon: "zap",
        category: "streak",
        rarity: "rare",
        xpReward: 30,
        creditReward: 5,
        condition: (stats) => stats.streakDays >= 7,
    },
    {
        slug: "streak-30",
        title: "Monthly Master",
        description: "Login for 30 consecutive days.",
        icon: "crown",
        category: "streak",
        rarity: "legendary",
        xpReward: 100,
        creditReward: 50,
        condition: (stats) => stats.streakDays >= 30,
    },
    {
        slug: "perfectionist",
        title: "Perfectionist",
        description: "Score 95+ on a code review.",
        icon: "target",
        category: "review",
        rarity: "legendary",
        xpReward: 100,
        creditReward: 20,
        condition: (stats) => (stats.lastReviewScore || 0) >= 95,
    },
];

export function getEarnableAchievements(currentStats: UserStats, earnedSlugs: Set<string>): AchievementDef[] {
    return ACHIEVEMENTS_LIST.filter(
        (ach) => !earnedSlugs.has(ach.slug) && ach.condition(currentStats)
    );
}
