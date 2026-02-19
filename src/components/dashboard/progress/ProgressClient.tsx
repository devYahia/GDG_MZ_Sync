"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { motion } from "motion/react"
import {
    Lock, Star, Zap, Target, Trophy, TrendingUp, BarChart3,
    Users, ShieldAlert, Cpu, Database, Flame, GraduationCap,
    Briefcase, Code, MessageSquare, Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ProgressPageData } from "@/app/(dashboard)/actions"

const RadarChart = dynamic(() => import("recharts").then((m) => m.RadarChart), { ssr: false })
const Radar = dynamic(() => import("recharts").then((m) => m.Radar), { ssr: false })
const PolarGrid = dynamic(() => import("recharts").then((m) => m.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import("recharts").then((m) => m.PolarAngleAxis), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false })

const LEVELS = [
    { level: 1, title: "Intern Arrival", description: "Fresh landing. Friendly clients with straightforward requirements.", difficulty: "Easy", persona: "Patient Mentor", icon: Users, color: "from-emerald-500 to-teal-500" },
    { level: 2, title: "Feature Request", description: "Small tasks. Clients start having specific UI/UX opinions.", difficulty: "Easy+", persona: "Product Owner", icon: Zap, color: "from-blue-500 to-indigo-500" },
    { level: 3, title: "Edge Case Hunter", description: "Technical curiosity. Clients expect error handling.", difficulty: "Medium", persona: "Meticulous PM", icon: Target, color: "from-indigo-500 to-purple-500" },
    { level: 4, title: "The Mid-Project Pivot", description: "Requirement churn. Persona may change their mind mid-way.", difficulty: "Medium", persona: "Startup CEO", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
    { level: 5, title: "The Pressure Check", description: "Tight deadlines and frequent status updates.", difficulty: "Hard", persona: "Stressed CTO", icon: ShieldAlert, color: "from-pink-500 to-rose-500" },
    { level: 6, title: "Legacy Crisis", description: "Migration focus. Moving broken logic to a modern stack.", difficulty: "Hard", persona: "Tech Lead", icon: Database, color: "from-orange-500 to-red-500" },
    { level: 7, title: "Security Audit", description: "Client obsessed with vulnerabilities and data leaks.", difficulty: "Expert", persona: "Security Consultant", icon: ShieldAlert, color: "from-amber-500 to-orange-500" },
    { level: 8, title: "External Integration", description: "3rd party APIs and rigid corporate standards.", difficulty: "Expert", persona: "IT Director", icon: BarChart3, color: "from-cyan-500 to-blue-500" },
    { level: 9, title: "Architectural Lead", description: "High-level trade-offs between performance and scalability.", difficulty: "Legendary", persona: "Lead Architect", icon: Cpu, color: "from-violet-500 to-purple-600" },
    { level: 10, title: "The Founder's Vision", description: "Vague, high-intensity requirements. Deliver perfection.", difficulty: "Founder", persona: "Visionary Founder", icon: Trophy, color: "from-yellow-400 via-orange-500 to-red-600" },
]

const RARITY_COLORS: Record<string, string> = {
    common: "border-zinc-500/30 bg-zinc-500/5",
    uncommon: "border-emerald-500/30 bg-emerald-500/5",
    rare: "border-blue-500/30 bg-blue-500/5",
    epic: "border-purple-500/30 bg-purple-500/5",
    legendary: "border-amber-500/30 bg-amber-500/5",
}

export function ProgressClient({ data }: { data: ProgressPageData }) {
    const {
        currentLevel,
        xp,
        xpProgress,
        streakDays,
        totalProjects,
        totalReviews,
        totalInterviews,
        skillRadar,
        badges,
    } = data

    const radarData = useMemo(() => {
        if (!skillRadar) return []
        return [
            { name: "Comm.", value: skillRadar.communication },
            { name: "Code", value: skillRadar.codeQuality },
            { name: "Reqs", value: skillRadar.requirementsGathering },
            { name: "Tech", value: skillRadar.technicalDepth },
            { name: "Problem", value: skillRadar.problemSolving },
            { name: "Prof.", value: skillRadar.professionalism },
        ]
    }, [skillRadar])

    return (
        <div className="mx-auto max-w-5xl space-y-12 pb-20 pt-6 px-4">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Progress</h1>
                <p className="text-lg text-muted-foreground">
                    From your first day as an intern to becoming a tech partner.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: "Level", value: currentLevel, icon: GraduationCap, gradient: "from-purple-500 to-pink-500" },
                    { label: "XP", value: xp.toLocaleString(), icon: Zap, gradient: "from-amber-500 to-orange-500" },
                    { label: "Streak", value: `${streakDays}d`, icon: Flame, gradient: "from-red-500 to-orange-500" },
                    { label: "Activities", value: Number(totalProjects) + Number(totalReviews) + Number(totalInterviews), icon: Briefcase, gradient: "from-cyan-500 to-blue-500" },
                ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-center"
                        >
                            <div className={cn("mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white", stat.gradient)}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    )
                })}
            </div>

            {/* XP Progress Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-6"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/70">Level {xpProgress.currentLevel}</span>
                    <span className="text-sm font-medium text-white/70">
                        {xpProgress.nextLevel ? `Level ${xpProgress.nextLevel}` : "Max Level"}
                    </span>
                </div>
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress.progressPercent}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-center">
                    {xpProgress.xpToNext > 0 ? `${xpProgress.xpToNext} XP to next level` : "Maximum level reached!"}{" "}
                    {xpProgress.currentLevelTitle && `- ${xpProgress.currentLevelTitle}`}
                </p>
            </motion.div>

            {/* Skill Radar + Badges */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Skill Radar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] p-6"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        Skill Radar
                    </h2>
                    {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                                <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                            Complete projects to populate your skill radar.
                        </div>
                    )}
                </motion.div>

                {/* Badges */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] p-6"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        Badges ({badges.filter((b) => b.earned).length}/{badges.length})
                    </h2>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {badges.map((badge) => (
                            <div
                                key={badge.slug}
                                className={cn(
                                    "flex flex-col items-center rounded-xl border p-3 text-center transition-all",
                                    badge.earned
                                        ? RARITY_COLORS[badge.rarity] ?? "border-white/10 bg-white/5"
                                        : "border-white/5 bg-white/[0.01] opacity-40 grayscale"
                                )}
                            >
                                <span className="text-2xl mb-1">{badge.icon}</span>
                                <span className="text-[10px] font-medium leading-tight line-clamp-2">{badge.title}</span>
                            </div>
                        ))}
                        {badges.length === 0 && (
                            <p className="col-span-full text-sm text-muted-foreground text-center py-8">
                                No badges available yet.
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Level Tree */}
            <div className="relative mt-8">
                <h2 className="text-xl font-semibold mb-8">Level Journey</h2>
                {/* Connecting Line (Desktop) */}
                <div className="absolute left-1/2 top-16 hidden h-[calc(100%-4rem)] w-1 -translate-x-1/2 bg-gradient-to-b from-primary/20 via-primary/40 to-muted/20 md:block" />

                <div className="space-y-24">
                    {LEVELS.map((lvl, index) => {
                        const isUnlocked = lvl.level <= currentLevel
                        const isCurrent = lvl.level === currentLevel
                        const Icon = lvl.icon

                        return (
                            <motion.div
                                key={lvl.level}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={cn(
                                    "relative flex flex-col md:flex-row items-center gap-8 md:gap-0",
                                    index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                                )}
                            >
                                {/* Level Content Card */}
                                <div className="w-full md:w-[42%]">
                                    <div className={cn(
                                        "group relative overflow-hidden rounded-3xl border p-6 transition-all duration-500",
                                        isUnlocked
                                            ? "border-primary/20 bg-card/80 backdrop-blur-xl hover:border-primary/40 shadow-lg"
                                            : "border-border/50 bg-card/40 opacity-60 grayscale"
                                    )}>
                                        <div className={cn(
                                            "absolute -right-4 -top-4 h-24 w-24 bg-gradient-to-br blur-3xl transition-opacity group-hover:opacity-60",
                                            lvl.color,
                                            isUnlocked ? "opacity-20" : "opacity-0"
                                        )} />

                                        <div className="relative space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                    isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                                )}>
                                                    Level {lvl.level}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground">{lvl.difficulty}</span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{lvl.title}</h3>
                                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lvl.description}</p>
                                            </div>

                                            <div className="flex items-center gap-4 border-t border-border pt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground uppercase">Key Persona</span>
                                                    <span className="text-sm font-medium text-foreground">{lvl.persona}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Central Node */}
                                <div className="z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-background md:mx-auto shadow-sm">
                                    <motion.div
                                        animate={isCurrent ? {
                                            boxShadow: ["0 0 0 0px rgba(168, 85, 247, 0.4)", "0 0 0 15px rgba(168, 85, 247, 0)"],
                                            scale: [1, 1.05, 1]
                                        } : {}}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className={cn(
                                            "flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300",
                                            isUnlocked
                                                ? cn("bg-gradient-to-br border-primary/40 text-primary-foreground shadow-xl shadow-primary/20", lvl.color)
                                                : "bg-muted border-border text-muted-foreground"
                                        )}
                                    >
                                        {isUnlocked ? <Icon className="h-8 w-8" /> : <Lock className="h-6 w-6" />}
                                    </motion.div>
                                </div>

                                {/* Placeholder for balance */}
                                <div className="hidden md:block md:w-[42%]" />
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center pt-10">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-2xl hover:scale-105 transition-transform" onClick={() => window.location.href = "/dashboard"}>
                    Continue Project
                </Button>
            </div>
        </div>
    )
}
