import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HomeWelcome } from "@/components/dashboard/HomeWelcome"
import { HomeStats } from "@/components/dashboard/HomeStats"
import { QuickAccess } from "@/components/dashboard/QuickAccess"
import { TaskGrid } from "@/components/dashboard/TaskGrid"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    return (
        <div className="space-y-8">
            <HomeWelcome
                userName={profile?.full_name ?? user.email ?? "Developer"}
                fieldKey={profile?.field ?? "frontend"}
                experienceLevel={profile?.experience_level ?? "junior"}
            />
            <HomeStats />
            <QuickAccess />
            <section className="space-y-6">
                <TaskGrid />
            </section>
        </div>
    )
}
