"use client"

import { motion } from "motion/react"
import Link from "next/link"
import {
    Sparkles,
    Rocket,
    Zap,
    Trophy,
    Target,
    TrendingUp,
    FolderKanban,
    ArrowRight,
} from "lucide-react"

import { FIELD_CONFIG, TASKS, type TaskField } from "@/lib/tasks"
import { ProjectGallery } from "@/components/dashboard/ProjectGallery"
import { cn } from "@/lib/utils"

const levelLabels: Record<string, string> = {
    student: "Student",
    fresh_grad: "Fresh Graduate",
    junior: "Junior Developer",
}

interface DashboardClientProps {
    userName: string
    fieldKey: string
    experienceLevel: string
}

export function DashboardClient({ userName, fieldKey, experienceLevel }: DashboardClientProps) {
    const fieldConfig = FIELD_CONFIG[(fieldKey as TaskField) ?? "frontend"]
    const FieldIcon = fieldConfig?.icon
    const firstName = userName?.split(" ")[0] ?? "there"

    const stats = [
        {
            label: "Available Projects",
            value: TASKS.length,
            icon: FolderKanban,
            gradient: "from-violet-500 to-purple-600",
            bgGlow: "bg-violet-500/10",
        },
        {
            label: "Difficulty Levels",
            value: "L1 – L7",
            icon: Target,
            gradient: "from-amber-500 to-orange-600",
            bgGlow: "bg-amber-500/10",
        },
        {
            label: "Tracks",
            value: Object.keys(FIELD_CONFIG).length,
            icon: TrendingUp,
            gradient: "from-emerald-500 to-teal-600",
            bgGlow: "bg-emerald-500/10",
        },
        {
            label: "Your Level",
            value: levelLabels[experienceLevel] ?? experienceLevel,
            icon: Trophy,
            gradient: "from-rose-500 to-pink-600",
            bgGlow: "bg-rose-500/10",
        },
    ]

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,40,200,0.15),transparent)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-[60%] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl space-y-10 p-6 sm:p-8 lg:p-10">
                {/* ── Hero Section ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 sm:p-10"
                >
                    {/* Decorative Glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-purple-400" />
                                <span className="text-xs font-medium uppercase tracking-widest text-purple-400/80">
                                    Simulation Hub
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Welcome back,{" "}
                                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                    {firstName}
                                </span>
                            </h1>
                            <p className="max-w-md text-sm leading-relaxed text-white/50">
                                Practice real-world projects with AI-powered client personas.
                                Pick a simulation and level up your skills.
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2">
                                {fieldConfig && FieldIcon && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                                            fieldConfig.bg,
                                            fieldConfig.color,
                                            "border-current/20"
                                        )}
                                    >
                                        <FieldIcon className="h-3 w-3" />
                                        {fieldConfig.label}
                                    </span>
                                )}
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
                                    {levelLabels[experienceLevel] ?? experienceLevel}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link
                                href="/simulations/create"
                                className="group flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 px-6 py-4 transition-all duration-300 hover:border-purple-500/50 hover:from-purple-600/30 hover:to-indigo-600/30 hover:shadow-lg hover:shadow-purple-500/10"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 transition-transform group-hover:scale-110">
                                    <Sparkles className="h-5 w-5 text-purple-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Create Custom Simulation</p>
                                    <p className="text-xs text-white/40">Design your own project scenario</p>
                                </div>
                                <ArrowRight className="ml-2 h-4 w-4 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
                            </Link>
                        </motion.div>
                    </div>
                </motion.section>

                {/* ── Stats Strip ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.06, duration: 0.35 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-0.5"
                            >
                                {/* Subtle gradient glow */}
                                <div className={cn("pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-30 transition-opacity group-hover:opacity-50", stat.bgGlow)} />

                                <div className="relative flex items-start justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-white/40">{stat.label}</p>
                                        <p className="mt-1.5 text-xl font-bold tracking-tight text-white">{stat.value}</p>
                                    </div>
                                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br", stat.gradient, "opacity-80 transition-transform group-hover:scale-110")}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* ── Project Gallery ── */}
                <ProjectGallery />
            </div>
        </div>
    )
}
