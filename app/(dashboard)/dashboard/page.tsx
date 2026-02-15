import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { FIELD_CONFIG } from "@/lib/tasks"
import { DashboardClient } from "@/components/dashboard/DashboardClient"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (!profile || !profile.onboarding_completed) redirect("/signup")

    return (
        <DashboardClient
            userName={profile.full_name}
            fieldKey={profile.field}
            experienceLevel={profile.experience_level}
        />
    )
}
