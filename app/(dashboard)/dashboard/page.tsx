import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { DashboardWithOnboarding } from "@/components/dashboard/DashboardWithOnboarding"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (!profile) redirect("/signup")

    // Show bubble for users who haven't completed onboarding
    const needsOnboarding = !profile.onboarding_completed

    if (needsOnboarding) {
        return (
            <DashboardWithOnboarding
                userName={profile.full_name}
                fieldKey={profile.field || "frontend"}
                experienceLevel={profile.experience_level || "student"}
            />
        )
    }

    return (
        <DashboardClient
            userName={profile.full_name}
            fieldKey={profile.field}
            experienceLevel={profile.experience_level}
        />
    )
}
