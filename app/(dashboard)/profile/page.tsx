import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfilePage } from "@/components/dashboard/ProfilePage"

export default async function Profile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .order("rarity", { ascending: true })

    const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user.id)

    const { count: simulationCount } = await supabase
        .from("simulations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

    const unlockedIds = new Set(
        (userAchievements ?? []).map((ua) => ua.achievement_id)
    )

    const enrichedAchievements = (achievements ?? []).map((a) => ({
        ...a,
        unlocked: unlockedIds.has(a.id),
        unlocked_at: (userAchievements ?? []).find(
            (ua) => ua.achievement_id === a.id
        )?.unlocked_at ?? null,
    }))

    return (
        <ProfilePage
            profile={{
                id: user.id,
                email: user.email ?? "",
                full_name: profile?.full_name ?? "",
                field: profile?.field ?? "frontend",
                experience_level: profile?.experience_level ?? "student",
                interests: profile?.interests ?? [],
                bio: profile?.bio ?? "",
                avatar_url: profile?.avatar_url ?? "",
                region: profile?.region ?? "",
                credits: profile?.credits ?? 0,
                xp: profile?.xp ?? 0,
                current_level: profile?.current_level ?? 1,
                is_premium: profile?.is_premium ?? false,
                streak_days: profile?.streak_days ?? 0,
                completed_simulations_count: profile?.completed_simulations_count ?? simulationCount ?? 0,
                created_at: profile?.created_at ?? new Date().toISOString(),
            }}
            achievements={enrichedAchievements}
        />
    )
}
