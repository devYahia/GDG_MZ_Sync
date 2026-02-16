"use client"

import { motion } from "motion/react"
import { Check, Lock, Star, Zap, Target, Trophy, TrendingUp, BarChart3, Users, ShieldAlert, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const LEVELS = [
    {
        level: 1,
        title: "Intern Arrival",
        description: "Fresh landing. Friendly clients with straightforward requirements and extreme patience.",
        difficulty: "Easy",
        persona: "Patient Mentor",
        icon: Users,
        color: "from-emerald-500 to-teal-500"
    },
    {
        level: 2,
        title: "Feature Request",
        description: "Small tasks. Clients start having specific UI/UX opinions and single-page requirements.",
        difficulty: "Easy+",
        persona: "Product Owner",
        icon: Zap,
        color: "from-blue-500 to-indigo-500"
    },
    {
        level: 3,
        title: "Edge Case Hunter",
        description: "Technical curiosity. Clients start asking 'what happens if...' and expect error handling.",
        difficulty: "Medium",
        persona: "Meticulous PM",
        icon: Target,
        color: "from-indigo-500 to-purple-500"
    },
    {
        level: 4,
        title: "The Mid-Project Pivot",
        description: "Requirement churn. Persona might change their mind mid-way, testing your adaptability.",
        difficulty: "Medium",
        persona: "Impatience Startup CEO",
        icon: TrendingUp,
        color: "from-purple-500 to-pink-500"
    },
    {
        level: 5,
        title: "The Pressure Check",
        description: "Tight deadlines. Persona expects quick delivery and frequent status updates.",
        difficulty: "Hard",
        persona: "Stressed CTO",
        icon: ShieldAlert,
        color: "from-pink-500 to-rose-500"
    },
    {
        level: 6,
        title: "Legacy Crisis",
        description: "Migration focus. You're tasked with moving complex, broken logic to a modern stack.",
        difficulty: "Hard",
        persona: "Overwhelmed Tech Lead",
        icon: Database, // Will import below if missing or use fallback
        color: "from-orange-500 to-red-500"
    },
    {
        level: 7,
        title: "Security Audit",
        description: "Skeptical review. Client is obsessed with vulnerabilities and data leaks.",
        difficulty: "Expert",
        persona: "Security Consultant",
        icon: ShieldAlert,
        color: "from-amber-500 to-orange-500"
    },
    {
        level: 8,
        title: "External Integration",
        description: "High stakes. Working with 3rd party APIs and rigid corporate standards.",
        difficulty: "Expert",
        persona: "Corporate IT Director",
        icon: BarChart3,
        color: "from-cyan-500 to-blue-500"
    },
    {
        level: 9,
        title: "Architectural Lead",
        description: "Strategy focus. Making high-level trade-offs between performance and scalability.",
        difficulty: "Legendary",
        persona: "Lead Architect",
        icon: Cpu,
        color: "from-violet-500 to-purple-600"
    },
    {
        level: 10,
        title: "The Founder's Vision",
        description: "Vague, high-intensity requirements. You must read between the lines and deliver perfection.",
        difficulty: "Founder",
        persona: "Visionary Stealth Founder",
        icon: Trophy,
        color: "from-yellow-400 via-orange-500 to-red-600"
    }
]

import { Database } from "lucide-react"

export function ProgressClient() {
    // We'll simulate current level as 1 for now or fetch from DB
    const currentLevel = 1

    return (
        <div className="mx-auto max-w-5xl space-y-12 pb-20 pt-6">
            {/* Header / Hero Section - Simplified to remove duplication if needed, but keeping title as standard page title */}
            {/* User requested removing "duplicated second header". Usually AppNavbar is the top one. 
                We will keep a simple clean title, but remove the large centered "Hero" style if that's the duplicate. 
                Let's make it a standard left-aligned header. */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Progress</h1>
                <p className="text-lg text-muted-foreground">
                    From your first day as an intern to becoming a tech partner.
                </p>
            </div>

            {/* Skill Tree / Path */}
            <div className="relative mt-12">
                {/* Connecting Line (Desktop) */}
                <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-primary/20 via-primary/40 to-muted/20 md:block" />

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
