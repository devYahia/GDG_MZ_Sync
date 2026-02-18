import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { ProfilePage } from "@/components/dashboard/ProfilePage"

export default async function Profile() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const [user, achievements, simulations] = await Promise.all([
        container.userRepository.findById(session.user.id),
        container.achievementRepository.getEnrichedAchievements(session.user.id),
        container.simulationRepository.findByUserId(session.user.id),
    ])

    if (!user) redirect("/login")

    return (
        <ProfilePage
            profile={{
                id: user.id,
                email: user.email,
                full_name: user.name ?? "",
                field: user.field,
                experience_level: user.experienceLevel,
                interests: user.interests,
                bio: user.bio ?? "",
                avatar_url: user.image ?? "",
                region: user.region ?? "",
                credits: user.credits,
                xp: user.xp,
                current_level: user.currentLevel,
                is_premium: user.isPremium,
                streak_days: user.streakDays,
                completed_simulations_count: simulations.length,
                created_at: user.createdAt.toISOString(),
            }}
            achievements={achievements.map((a) => ({
                id: a.id,
                slug: a.slug,
                title: a.title,
                description: a.description,
                icon: a.icon,
                category: a.category,
                xp_reward: a.xpReward,
                credit_reward: a.creditReward,
                rarity: a.rarity,
                unlocked: a.unlocked,
                unlocked_at: a.unlockedAt?.toISOString() ?? null,
            }))}
        />
    )
}
