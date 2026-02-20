"use client"

import { motion } from "motion/react"
import Link from "next/link"
import {
    Sparkles,
    ArrowRight,
} from "lucide-react"

import { FIELD_CONFIG, type TaskField } from "@/lib/tasks"
import { QuickStartActions } from "@/components/dashboard/QuickStartActions"
import { ContinueSection } from "@/components/dashboard/ContinueSection"
import { ProgressSnapshot } from "@/components/dashboard/ProgressSnapshot"
import { SimulationTemplates } from "@/components/dashboard/SimulationTemplates"
import { cn } from "@/lib/utils"
import type { DashboardData } from "@/app/(dashboard)/actions"

const levelLabels: Record<string, string> = {
    student: "Student",
    fresh_grad: "Fresh Graduate",
    junior: "Junior Developer",
}

interface DashboardClientProps {
    data: DashboardData
    showQuickStart?: boolean
}

export function DashboardClient({ data, showQuickStart }: DashboardClientProps) {
    const { user, xpProgress, inProgressProjects, earnedBadges, skillAverages } = data
    const fieldConfig = FIELD_CONFIG[(user.field as TaskField) ?? "frontend"]
    const FieldIcon = fieldConfig?.icon
    const firstName = user.name?.split(" ")[0] ?? "there"
    const isReturning = inProgressProjects.length > 0

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,40,200,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,40,200,0.15),transparent)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-[60%] bg-gradient-to-r from-transparent via-purple-500/20 dark:via-purple-500/40 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 lg:p-10">
                {/* -- Hero Section -- */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card/80 to-card/40 p-8 sm:p-10"
                >
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium uppercase tracking-widest text-primary/80">
                                    Command Center
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                                Welcome back,{" "}
                                <span className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                                    {firstName}
                                </span>
                            </h1>
                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                                Practice real-world projects with AI-powered client personas.
                                Pick a simulation and level up your skills.
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                {fieldConfig && FieldIcon && (
                                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", fieldConfig.bg, fieldConfig.color, "border-current/20")}>
                                        <FieldIcon className="h-3 w-3" />
                                        {fieldConfig.label}
                                    </span>
                                )}
                                <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                                    {levelLabels[user.experienceLevel] ?? user.experienceLevel}
                                </span>
                            </div>
                        </div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                            <Link
                                href="/simulations/create"
                                className="group flex items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/20 to-indigo-600/20 px-6 py-4 transition-all duration-300 hover:border-primary/50 hover:from-primary/30 hover:to-indigo-600/30 hover:shadow-lg hover:shadow-primary/10"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 transition-transform group-hover:scale-110">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Create Custom Simulation</p>
                                    <p className="text-xs text-muted-foreground">Design your own project scenario</p>
                                </div>
                                <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>

                {/* -- Progress Snapshot -- */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <ProgressSnapshot
                        currentLevel={user.currentLevel}
                        nextLevel={xpProgress.nextLevel ?? user.currentLevel + 1}
                        xp={user.xp}
                        xpPercent={xpProgress.progressPercent}
                        streakDays={user.streakDays}
                        credits={user.credits}
                        earnedBadges={earnedBadges}
                        skillAverages={skillAverages}
                    />
                </motion.div>

                {/* -- Quick Start (new users) or Continue (returning users) -- */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {isReturning && <ContinueSection projects={inProgressProjects} />}
                </motion.div>

                {/* -- Simulation Templates -- */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <SimulationTemplates userField={user.field} />
                </motion.div>
            </div>
        </div>
    )
}
