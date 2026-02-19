
export interface LevelInfo {
    level: number;
    xpRequired: number;
    cumulativeXp: number;
    title: string;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
    { level: 1, xpRequired: 0, cumulativeXp: 0, title: "Intern Arrival" },
    { level: 2, xpRequired: 100, cumulativeXp: 100, title: "First Steps" },
    { level: 3, xpRequired: 150, cumulativeXp: 250, title: "Getting Traction" }, // Delta 150, total 250
    { level: 4, xpRequired: 250, cumulativeXp: 500, title: "Balanced" },
    { level: 5, xpRequired: 250, cumulativeXp: 750, title: "Pressure Check" },
    { level: 6, xpRequired: 250, cumulativeXp: 1000, title: "Deep Dive" },
    { level: 7, xpRequired: 500, cumulativeXp: 1500, title: "Full Challenge" },
    { level: 8, xpRequired: 500, cumulativeXp: 2000, title: "Expert Pressure" },
    { level: 9, xpRequired: 1000, cumulativeXp: 3000, title: "Architectural Lead" },
    { level: 10, xpRequired: 2000, cumulativeXp: 5000, title: "Visionary" },
];

export const XP_AWARDS = {
    onboarding_completed: 25,
    simulation_started: 10,
    simulation_completed: 100, // Base value, can vary
    chat_message_sent: 2,
    code_review_requested: 15,
    code_review_completed: 30, // Assuming approval/pass
    interview_completed: 40,
    quiz_completed: 25,
    report_generated: 20,
    achievement_unlocked: 0, // Achievements carry their own XP
};

export function getLevelFromXp(xp: number): LevelInfo {
    // Loop backwards to find the highest level bracket reached
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i].cumulativeXp) {
            return LEVEL_THRESHOLDS[i];
        }
    }
    return LEVEL_THRESHOLDS[0];
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
    if (currentLevel >= 10) return null;
    return LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1) || null;
}

export function getXpProgress(currentXp: number): {
    currentLevel: number;
    nextLevel: number | null;
    progressPercent: number;
    xpToNext: number;
    currentLevelTitle: string;
} {
    const levelInfo = getLevelFromXp(currentXp);
    const nextLevel = getNextLevel(levelInfo.level);

    if (!nextLevel) {
        return {
            currentLevel: levelInfo.level,
            nextLevel: null,
            progressPercent: 100,
            xpToNext: 0,
            currentLevelTitle: levelInfo.title,
        };
    }

    const xpInLevel = currentXp - levelInfo.cumulativeXp;
    // Use the delta to next level (which is nextLevel.cumulativeXp - levelInfo.cumulativeXp)
    // Wait, my array has 'xpRequired' which I treated as delta in the comments but 'cumulativeXp' is the absolute threshold.
    // Let's rely on cumulativeXp.
    const xpNeededForNext = nextLevel.cumulativeXp - levelInfo.cumulativeXp;
    const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpNeededForNext) * 100));

    return {
        currentLevel: levelInfo.level,
        nextLevel: nextLevel.level,
        progressPercent,
        xpToNext: nextLevel.cumulativeXp - currentXp,
        currentLevelTitle: levelInfo.title,
    };
}
