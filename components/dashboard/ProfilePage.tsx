"use client"

import { motion } from "motion/react"
import {
    Crown,
    Flame,
    Zap,
    Trophy,
    Target,
    Award,
    Star,
    Shield,
    Compass,
    Timer,
    Sparkles,
    Rocket,
    CreditCard,
    TrendingUp,
    Calendar,
    MapPin,
    Mail,
    Edit3,
    CheckCircle2,
    Lock,
    Code,
    Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FIELD_CONFIG, type TaskField } from "@/lib/tasks"
import { GlowingEffect } from "@/components/ui/glowing-effect"

// --- Types ---

interface ProfileData {
    id: string
    email: string
    full_name: string
    field: string
    experience_level: string
    interests: string[]
    bio: string
    avatar_url: string
    region: string
    credits: number
    xp: number
    current_level: number
    is_premium: boolean
    streak_days: number
    completed_simulations_count: number
    created_at: string
}

interface Achievement {
    id: string
    slug: string
    title: string
    description: string
    icon: string
    category: string
    xp_reward: number
    credit_reward: number
    rarity: string
    unlocked: boolean
    unlocked_at: string | null
}

interface ProfilePageProps {
    profile: ProfileData
    achievements: Achievement[]
}

// --- Constants ---

const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
    common: { label: "Common", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border", glow: "" },
    uncommon: { label: "Uncommon", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", glow: "shadow-[0_0_20px_-8px_rgba(34,197,94,0.3)]" },
    rare: { label: "Rare", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-[0_0_20px_-8px_rgba(59,130,246,0.3)]" },
    epic: { label: "Epic", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-[0_0_20px_-8px_rgba(168,85,247,0.3)]" },
    legendary: { label: "Legendary", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]" },
}

const ICON_MAP: Record<string, React.ElementType> = {
    rocket: Rocket, target: Target, award: Award, flame: Flame,
    star: Star, crown: Crown, zap: Zap, shield: Shield,
    compass: Compass, timer: Timer, sparkles: Sparkles, trophy: Trophy,
}

const EXP_LABELS: Record<string, string> = {
    student: "Student",
    fresh_grad: "Fresh Graduate",
    junior: "Junior Developer",
}

// Intern career ranks (4 meaningful tiers for a virtual internship platform)
const INTERN_RANKS = [
    { min: 1, max: 2, title: "Intern", icon: Briefcase, color: "text-muted-foreground", desc: "Just getting started" },
    { min: 3, max: 4, title: "Junior Intern", icon: Code, color: "text-blue-600 dark:text-blue-400", desc: "Building foundational skills" },
    { min: 5, max: 6, title: "Senior Intern", icon: Star, color: "text-purple-600 dark:text-purple-400", desc: "Consistently delivering quality" },
    { min: 7, max: 8, title: "Lead Intern", icon: Crown, color: "text-amber-600 dark:text-amber-400", desc: "Top performer, ready for the industry" },
]

function getCurrentRank(level: number) {
    return INTERN_RANKS.find(r => level >= r.min && level <= r.max) ?? INTERN_RANKS[0]
}

function getXpForLevel(level: number): number {
    return level * 100 + (level - 1) * 50
}

function getXpProgress(xp: number, level: number): number {
    const currentLevelXp = getXpForLevel(level)
    const prevLevelXp = level > 1 ? getXpForLevel(level - 1) : 0
    const range = currentLevelXp - prevLevelXp
    if (range <= 0) return 0
    const progress = ((xp - prevLevelXp) / range) * 100
    return Math.min(Math.max(progress, 0), 100)
}

// --- Glass Card Wrapper ---

function GlassCard({
    children,
    className,
    glow = false,
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    glow?: boolean
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            className="relative list-none"
        >
            <div
                className={cn(
                    "relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3",
                    className
                )}
            >
                {glow && (
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={3}
                    />
                )}
                <div
                    className="relative flex h-full flex-col overflow-hidden rounded-xl border-[0.75px] border-border/50 p-6 md:p-8 backdrop-blur-3xl bg-card shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
                >
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/[0.03] via-transparent to-purple-500/[0.02] rounded-xl dark:from-white/[0.06] dark:to-white/[0.02]" />
                    <motion.div
                        className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 blur-3xl"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative z-10">{children}</div>
                </div>
            </div>
        </motion.div>
    )
}

// =================================================================
//  SECTION 1: IDENTITY CARD
// =================================================================

function ProfileHero({ profile }: { profile: ProfileData }) {
    const fieldConfig = FIELD_CONFIG[profile.field as TaskField] ?? FIELD_CONFIG.frontend
    const FieldIcon = fieldConfig.icon
    const initials = profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    })

    const rank = getCurrentRank(profile.current_level)
    const RankIcon = rank.icon

    return (
        <GlassCard glow delay={0}>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="relative flex-shrink-0"
                >
                    <div
                        className={cn(
                            "relative h-24 w-24 md:h-28 md:w-28 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white overflow-hidden",
                            profile.is_premium ? "ring-2 ring-amber-400/50" : ""
                        )}
                        style={{
                            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)",
                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                        }}
                    >
                        {initials}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
                        />
                    </div>
                    {profile.is_premium && (
                        <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                            <Crown className="h-3.5 w-3.5 text-black" />
                        </div>
                    )}
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                            {profile.full_name}
                        </h1>
                        {profile.is_premium && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                <Crown className="h-3 w-3" /> Premium
                            </span>
                        )}
                    </div>

                    {/* Rank title */}
                    <div className="flex items-center gap-2 mb-3">
                        <RankIcon className={cn("h-4 w-4", rank.color)} />
                        <span className={cn("text-sm font-semibold", rank.color)}>{rank.title}</span>
                        <span className="text-xs text-muted-foreground/60">- {rank.desc}</span>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" /> {profile.email}
                        </span>
                        {profile.region && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> {profile.region}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> Joined {memberSince}
                        </span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                                fieldConfig.bg, fieldConfig.color, "border-current/20"
                            )}
                        >
                            <FieldIcon className="h-3.5 w-3.5" />
                            {fieldConfig.label} Track
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                            {EXP_LABELS[profile.experience_level] ?? profile.experience_level}
                        </span>
                        {profile.streak_days > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                                <Flame className="h-3 w-3" /> {profile.streak_days}d streak
                            </span>
                        )}
                    </div>

                    {profile.bio && (
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-lg">
                            {profile.bio}
                        </p>
                    )}

                    {profile.interests.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {profile.interests.map((interest) => (
                                <span
                                    key={interest}
                                    className="rounded-md border border-purple-500/15 bg-purple-500/5 px-2.5 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-300/60"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                    <Edit3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                </motion.button>
            </div>
        </GlassCard>
    )
}

// =================================================================
//  SECTION 2: INTERNSHIP STATS
// =================================================================

function StatsGrid({ profile }: { profile: ProfileData }) {
    const xpProgress = getXpProgress(profile.xp, profile.current_level)
    const nextLevelXp = getXpForLevel(profile.current_level)
    const rank = getCurrentRank(profile.current_level)

    const stats = [
        {
            label: "Intern Rank",
            value: rank.title,
            icon: TrendingUp,
            color: "text-purple-600 dark:text-purple-400",
            bg: "from-purple-500/20 to-purple-500/5",
            detail: `Level ${profile.current_level} / 8`,
        },
        {
            label: "Experience",
            value: `${profile.xp}`,
            suffix: "XP",
            icon: Zap,
            color: "text-blue-600 dark:text-blue-400",
            bg: "from-blue-500/20 to-blue-500/5",
            detail: `${Math.round(xpProgress)}% to Lv.${profile.current_level + 1 > 8 ? "MAX" : profile.current_level + 1}`,
            progress: xpProgress,
        },
        {
            label: "Active Streak",
            value: `${profile.streak_days}`,
            suffix: "days",
            icon: Flame,
            color: "text-orange-600 dark:text-orange-400",
            bg: "from-orange-500/20 to-orange-500/5",
            detail: profile.streak_days > 0 ? "Keep the momentum going" : "Start a simulation today",
        },
        {
            label: "Simulations Done",
            value: `${profile.completed_simulations_count}`,
            icon: Rocket,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "from-emerald-500/20 to-emerald-500/5",
            detail: "Virtual internship projects completed",
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-[1.25rem] border-[0.75px] border-border p-1.5"
                    >
                        <div
                            className="relative overflow-hidden rounded-xl border-[0.75px] border-border/50 p-4 md:p-5 backdrop-blur-xl bg-card shadow-sm dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.6)]"
                        >
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent rounded-xl dark:from-white/[0.04]" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", stat.bg)}>
                                        <Icon className={cn("h-4 w-4", stat.color)} />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
                                    {stat.suffix && <span className="text-xs font-medium text-muted-foreground/50">{stat.suffix}</span>}
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground/60 leading-relaxed">{stat.detail}</p>
                                {stat.progress !== undefined && (
                                    <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.progress}%` }}
                                            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// =================================================================
//  SECTION 3: CAREER PATH (compact 4 ranks, not 8 items)
// =================================================================

function CareerPath({ profile }: { profile: ProfileData }) {
    const currentRank = getCurrentRank(profile.current_level)

    return (
        <GlassCard delay={0.2}>
            <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[0.75px] border-purple-500/20 bg-purple-500/10">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Career Path</h2>
                    <p className="text-xs text-muted-foreground">Your progression as a virtual intern</p>
                </div>
            </div>

            <div className="space-y-2.5">
                {INTERN_RANKS.map((rank, i) => {
                    const isCompleted = profile.current_level > rank.max
                    const isCurrent = profile.current_level >= rank.min && profile.current_level <= rank.max
                    const RankIcon = rank.icon

                    return (
                        <motion.div
                            key={rank.title}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.06 }}
                            className={cn(
                                "flex items-center gap-3 rounded-xl border-[0.75px] px-4 py-3.5 transition-all",
                                isCurrent
                                    ? "border-purple-500/30 bg-purple-500/[0.08] shadow-[0_0_20px_-8px_rgba(168,85,247,0.2)]"
                                    : isCompleted
                                        ? "border-border bg-muted/30"
                                        : "border-border/50 bg-muted/10 opacity-40"
                            )}
                        >
                            <div className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0",
                                isCurrent
                                    ? "bg-purple-500/20 ring-1 ring-purple-500/30"
                                    : isCompleted
                                        ? "bg-emerald-500/10"
                                        : "bg-muted"
                            )}>
                                {isCompleted ? (
                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <RankIcon className={cn("h-4.5 w-4.5", isCurrent ? rank.color : "text-muted-foreground/40")} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-semibold",
                                    isCurrent ? "text-foreground" : isCompleted ? "text-foreground/60" : "text-muted-foreground/50"
                                )}>
                                    {rank.title}
                                </p>
                                <p className={cn(
                                    "text-[11px]",
                                    isCurrent ? "text-muted-foreground" : "text-muted-foreground/50"
                                )}>
                                    {rank.desc} {!isCurrent && !isCompleted ? `(Lv.${rank.min}+)` : ""}
                                </p>
                            </div>
                            {isCurrent && (
                                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                                    You are here
                                </span>
                            )}
                            {isCompleted && (
                                <CheckCircle2 className="flex-shrink-0 h-4 w-4 text-emerald-500/50" />
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </GlassCard>
    )
}

// =================================================================
//  SECTION 4: ACHIEVEMENTS (with context)
// =================================================================

function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
    const unlocked = achievements.filter((a) => a.unlocked)
    const locked = achievements.filter((a) => !a.unlocked)

    if (achievements.length === 0) {
        return (
            <GlassCard delay={0.25}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[0.75px] border-amber-500/20 bg-amber-500/10">
                        <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
                        <p className="text-xs text-muted-foreground">Complete simulations to unlock badges</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground text-center py-8">
                    Start your first virtual internship simulation to begin unlocking achievements.
                </p>
            </GlassCard>
        )
    }

    return (
        <GlassCard delay={0.25}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[0.75px] border-amber-500/20 bg-amber-500/10">
                        <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
                        <p className="text-xs text-muted-foreground">
                            {unlocked.length} of {achievements.length} earned through simulations
                        </p>
                    </div>
                </div>
                {/* Progress ring */}
                <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" className="stroke-muted" strokeWidth="3" />
                        <motion.circle
                            cx="24" cy="24" r="20" fill="none"
                            stroke="url(#achieveGrad)" strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 20}
                            initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                            animate={{
                                strokeDashoffset: 2 * Math.PI * 20 * (1 - unlocked.length / Math.max(achievements.length, 1))
                            }}
                            transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <defs>
                            <linearGradient id="achieveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground/70">
                        {Math.round((unlocked.length / Math.max(achievements.length, 1)) * 100)}%
                    </span>
                </div>
            </div>

            {/* All achievements in one grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {achievements.map((achievement, i) => (
                    <AchievementCard key={achievement.id} achievement={achievement} index={i} />
                ))}
            </div>
        </GlassCard>
    )
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
    const rarity = RARITY_CONFIG[achievement.rarity] ?? RARITY_CONFIG.common
    const Icon = ICON_MAP[achievement.icon] ?? Trophy

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.03 }}
            className={cn(
                "flex items-center gap-3 rounded-xl border-[0.75px] px-3.5 py-3 transition-all",
                achievement.unlocked
                    ? cn(rarity.border, rarity.glow, "bg-muted/30")
                    : "border-border/50 bg-muted/10 opacity-40"
            )}
        >
            <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0",
                achievement.unlocked ? cn(rarity.bg, rarity.border, "border-[0.75px]") : "bg-muted border-[0.75px] border-border/50"
            )}>
                {achievement.unlocked ? (
                    <Icon className={cn("h-4 w-4", rarity.color)} />
                ) : (
                    <Lock className="h-4 w-4 text-muted-foreground/30" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        achievement.unlocked ? "text-foreground" : "text-muted-foreground/40"
                    )}>
                        {achievement.title}
                    </p>
                    <span className={cn("flex-shrink-0 text-[8px] font-bold uppercase tracking-widest", achievement.unlocked ? rarity.color : "text-muted-foreground/30")}>
                        {rarity.label}
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground/60 truncate">{achievement.description}</p>
                {achievement.unlocked && (
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-blue-500/60 dark:text-blue-400/50 flex items-center gap-0.5">
                            <Zap className="h-2.5 w-2.5" /> +{achievement.xp_reward} XP
                        </span>
                        <span className="text-[10px] text-amber-500/60 dark:text-amber-400/50 flex items-center gap-0.5">
                            <CreditCard className="h-2.5 w-2.5" /> +{achievement.credit_reward}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

// =================================================================
//  SECTION 5: PREMIUM STATUS
// =================================================================

function PremiumCard({ isPremium }: { isPremium: boolean }) {
    if (isPremium) {
        return (
            <GlassCard delay={0.3}>
                <div className="relative overflow-hidden">
                    <motion.div
                        className="absolute -inset-12 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 blur-2xl"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative z-10 text-center py-4">
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] mb-4"
                        >
                            <Crown className="h-7 w-7 text-black" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 dark:from-amber-300 dark:via-amber-400 dark:to-amber-500">
                            Premium Active
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Unlimited simulations, advanced AI personas, and exportable certificates
                        </p>
                    </div>
                </div>
            </GlassCard>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[1.25rem] border-[0.75px] border-purple-500/20 p-2 md:p-3"
        >
            <div
                className="relative overflow-hidden rounded-xl border-[0.75px] border-purple-500/10 p-6 md:p-8 backdrop-blur-3xl bg-card dark:bg-transparent"
                style={{
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, transparent 50%, rgba(124, 58, 237, 0.04) 100%)",
                }}
            >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/[0.03] via-transparent to-purple-500/[0.02] rounded-xl dark:from-white/[0.06] dark:to-purple-500/[0.03]" />
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/[0.04] to-transparent dark:via-white/[0.04]"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 py-2">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] flex-shrink-0"
                    >
                        <Crown className="h-7 w-7 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                            Upgrade to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-500 dark:from-purple-300 dark:to-violet-400">
                                Premium
                            </span>
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Unlock unlimited simulations, advanced AI client personas, and exportable certificates to showcase your skills.
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl h-11 px-6 text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] transition-all"
                    >
                        <Sparkles className="h-4 w-4" />
                        Go Premium
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

// =================================================================
//  MAIN EXPORT
// =================================================================

export function ProfilePage({ profile, achievements }: ProfilePageProps) {
    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,7,100,0.06),transparent_40%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-4 md:space-y-6">
                {/* 1. Who you are */}
                <ProfileHero profile={profile} />

                {/* 2. Your numbers at a glance */}
                <StatsGrid profile={profile} />

                {/* 3. Career path + Achievements side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                    <div className="lg:col-span-2">
                        <CareerPath profile={profile} />
                    </div>
                    <div className="lg:col-span-3">
                        <AchievementsSection achievements={achievements} />
                    </div>
                </div>

                {/* 4. Premium upsell / status */}
                <PremiumCard isPremium={profile.is_premium} />
            </div>
        </div>
    )
}
