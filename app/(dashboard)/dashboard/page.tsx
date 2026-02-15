import { redirect } from "next/navigation"
import { Rocket } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar"
import { TaskGrid } from "@/components/dashboard/TaskGrid"
import { FIELD_CONFIG } from "@/lib/tasks"

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // If no profile or onboarding not completed, redirect to signup
    if (!profile || !profile.onboarding_completed) {
        redirect("/signup")
    }

    const fieldConfig =
        FIELD_CONFIG[profile.field as keyof typeof FIELD_CONFIG] ??
        FIELD_CONFIG.frontend
    const FieldIcon = fieldConfig.icon

    const levelLabels: Record<string, string> = {
        student: "Student",
        fresh_grad: "Fresh Graduate",
        junior: "Junior Developer",
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />
            </div>

            <div className="relative z-10">
                <DashboardNavbar
                    userEmail={user.email ?? ""}
                    userName={profile.full_name}
                />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                    {/* Welcome Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Welcome back,{" "}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    {profile.full_name.split(" ")[0]}
                                </span>
                            </h1>
                            <div className="mt-2 flex items-center gap-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${fieldConfig.color === "text-emerald-500" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                                        fieldConfig.color === "text-blue-500" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                                            fieldConfig.color === "text-purple-500" ? "border-purple-500/20 bg-purple-500/10 text-purple-400" :
                                                "border-white/10 bg-white/5 text-white/70"
                                        }`}
                                >
                                    <FieldIcon className="h-3 w-3" />
                                    {fieldConfig.label}
                                </span>
                                <span className="text-xs text-white/50">
                                    {levelLabels[profile.experience_level] ??
                                        profile.experience_level}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className="mb-6 flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-purple-500" />
                        <h2 className="text-lg font-semibold text-white">
                            Available Simulations
                        </h2>
                        <span className="ml-1 text-sm text-white/50">
                            Pick a scenario and start your session
                        </span>
                    </div>

                    {/* Task Grid with Filters */}
                    <TaskGrid />
                </main>
            </div>
        </div>
    )
}
