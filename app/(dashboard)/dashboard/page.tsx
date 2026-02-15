import { redirect } from "next/navigation"
import { Rocket, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { HomeWelcome } from "@/components/dashboard/HomeWelcome"
import { HomeStats } from "@/components/dashboard/HomeStats"
import { QuickAccess } from "@/components/dashboard/QuickAccess"
import { TaskGrid } from "@/components/dashboard/TaskGrid"
import { FIELD_CONFIG } from "@/lib/tasks"
import { Button } from "@/components/ui/button"

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

    const fieldKey = (profile.field as keyof typeof FIELD_CONFIG) ?? "frontend"

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <div className="relative z-10 space-y-8 p-4 sm:p-8">
                <HomeWelcome
                    userName={profile.full_name}
                    fieldKey={profile.field}
                    experienceLevel={profile.experience_level}
                />
                <HomeStats />
                <QuickAccess />

                <section className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-purple-500" />
                            <h2 className="text-xl font-bold text-white">Available Simulations</h2>
                        </div>
                        <Button
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2"
                            asChild
                        >
                            <a href="/simulations/create">
                                <Sparkles className="h-4 w-4 text-purple-400" />
                                Create Custom Simulation
                            </a>
                        </Button>
                    </div>
                    <TaskGrid />
                </section>
            </div>
        </div>
    )
}
