export interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;

    // App specific fields
    bio: string | null;
    field: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'data' | 'design';
    experienceLevel: 'student' | 'fresh_grad' | 'junior';
    interests: string[];
    region: string | null;
    credits: number;
    onboardingCompleted: boolean;

    // Gamification
    xp: number;
    currentLevel: number;
    isPremium: boolean;
    streakDays: number;

    createdAt: Date;
    updatedAt: Date;
}
