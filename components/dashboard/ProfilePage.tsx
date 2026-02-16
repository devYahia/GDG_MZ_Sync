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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FIELD_CONFIG, type TaskField, LEVEL_CONFIG } from "@/lib/tasks"
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
    common: { label: "Common", color: "text-white/60", bg: "bg-white/5", border: "border-white/10", glow: "" },
    uncommon: { label: "Uncommon", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", glow: "shadow-[0_0_20px_-8px_rgba(34,197,94,0.3)]" },
    rare: { label: "Rare", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-[0_0_20px_-8px_rgba(59,130,246,0.3)]" },
    epic: { label: "Epic", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-[0_0_20px_-8px_rgba(168,85,247,0.3)]" },
    legendary: { label: "Legendary", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]" },
}

const ICON_MAP: Record<string, React.ElementType> = {
    rocket: Rocket,
    target: Target,
    award: Award,
    flame: Flame,
    star: Star,
    crown: Crown,
    zap: Zap,
    shield: Shield,
    compass: Compass,
    timer: Timer,
    sparkles: Sparkles,
    trophy: Trophy,
}

const LEVEL_LABELS: Record<string, string> = {
    student: "Student",
    fresh_grad: "Fresh Graduate",
    junior: "Junior Developer",
}

// --- XP Calculation ---

function getXpForLevel(level: number): number {
    return level * 100 + (level - 1) * 50
}

function getXpProgress(xp: number, level: number): number {
    const currentLevelXp = getXpForLevel(level)
    const prevLevelXp = level > 1 ? getXpForLevel(level - 1) : 0
    const progress = ((xp - prevLevelXp) / (currentLevelXp - prevLevelXp)) * 100
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
                    "relative rounded-[1.25rem] border-[0.75px] border-white/10 p-2 md:rounded-[1.5rem] md:p-3",
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
                    className="relative flex h-full flex-col overflow-hidden rounded-xl border-[0.75px] border-white/5 p-6 md:p-8 backdrop-blur-3xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
                    }}
                >
                    {/* Glass shine */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02] rounded-xl" />

                    {/* Animated orb */}
                    <motion.div
                        className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative z-10">{children}</div>
                </div>
            </div>
        </motion.div>
    )
}

// --- Hero / Identity Card ---

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
                        {/* Shimmer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
                        />
                    </div>
                    {/* Premium badge */}
                    {profile.is_premium && (
                        <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                            <Crown className="h-3.5 w-3.5 text-black" />
                        </div>
                    )}
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            {profile.full_name}
                        </h1>
                        {profile.is_premium && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                <Crown className="h-3 w-3" /> Premium
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/40 mb-4">
                        <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" /> {profile.email}
                        </span>
                        {profile.region && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> {profile.region}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> Member since {memberSince}
                        </span>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                                fieldConfig.bg, fieldConfig.color, "border-current/20"
                            )}
                        >
                            <FieldIcon className="h-3.5 w-3.5" />
                            {fieldConfig.label}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                            {LEVEL_LABELS[profile.experience_level] ?? profile.experience_level}
                        </span>
                        {profile.streak_days > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                                <Flame className="h-3 w-3" /> {profile.streak_days} day streak
                            </span>
                        )}
                    </div>

                    {/* Interests */}
                    {profile.interests.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {profile.interests.map((interest) => (
                                <span
                                    key={interest}
                                    className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/30"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                    <Edit3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                </motion.button>
            </div>
        </GlassCard>
    )
}

// --- Stats Cards ---

function StatsGrid({ profile }: { profile: ProfileData }) {
    const xpProgress = getXpProgress(profile.xp, profile.current_level)
    const nextLevelXp = getXpForLevel(profile.current_level)

    const stats = [
        {
            label: "Level",
            value: profile.current_level,
            suffix: `/ ${LEVEL_CONFIG.length}`,
            icon: TrendingUp,
            color: "text-purple-400",
            bg: "from-purple-500/20 to-purple-900/10",
            detail: LEVEL_CONFIG[profile.current_level - 1]?.label ?? "",
        },
        {
            label: "XP",
            value: profile.xp,
            suffix: `/ ${nextLevelXp}`,
            icon: Zap,
            color: "text-blue-400",
            bg: "from-blue-500/20 to-blue-900/10",
            detail: `${Math.round(xpProgress)}% to next level`,
            progress: xpProgress,
        },
        {
            label: "Credits",
            value: profile.credits,
            suffix: "",
            icon: CreditCard,
            color: "text-amber-400",
            bg: "from-amber-500/20 to-amber-900/10",
            detail: profile.is_premium ? "Premium member" : "Free tier",
        },
        {
            label: "Simulations",
            value: profile.completed_simulations_count,
            suffix: "",
            icon: Rocket,
            color: "text-emerald-400",
            bg: "from-emerald-500/20 to-emerald-900/10",
            detail: "Completed",
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
                        className="relative rounded-[1.25rem] border-[0.75px] border-white/10 p-1.5"
                    >
                        <div
                            className="relative overflow-hidden rounded-xl border-[0.75px] border-white/5 p-4 md:p-5 backdrop-blur-xl"
                            style={{
                                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)",
                                boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
                            }}
                        >
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.04] via-transparent to-transparent rounded-xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                        {stat.label}
                                    </span>
                                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", stat.bg)}>
                                        <Icon className={cn("h-4 w-4", stat.color)} />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                                        {stat.value}
                                    </span>
                                    {stat.suffix && (
                                        <span className="text-xs font-medium text-white/20">
                                            {stat.suffix}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[10px] text-white/30">{stat.detail}</p>

                                {/* XP Progress Bar */}
                                {stat.progress !== undefined && (
                                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
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

// --- Level Progression ---

function LevelProgression({ profile }: { profile: ProfileData }) {
    return (
        <GlassCard delay={0.2}>
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[0.75px] border-purple-500/20 bg-purple-500/10">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Level Progression</h2>
                    <p className="text-xs text-white/40">Your journey through the ranks</p>
                </div>
            </div>

            <div className="space-y-2">
                {LEVEL_CONFIG.map((level) => {
                    const isCompleted = profile.current_level > level.levelNumber
                    const isCurrent = profile.current_level === level.levelNumber
                    const isLocked = profile.current_level < level.levelNumber

                    return (
                        <motion.div
                            key={level.levelNumber}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + level.levelNumber * 0.04 }}
                            className={cn(
                                "flex items-center gap-3 rounded-xl border-[0.75px] px-4 py-3 transition-all",
                                isCurrent
                                    ? "border-purple-500/30 bg-purple-500/[0.08] shadow-[0_0_20px_-8px_rgba(168,85,247,0.2)]"
                                    : isCompleted
                                        ? "border-white/10 bg-white/[0.03]"
                                        : "border-white/5 bg-white/[0.01] opacity-40"
                            )}
                        >
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0",
                                isCurrent
                                    ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30"
                                    : isCompleted
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-white/5 text-white/20"
                            )}>
                                {isCompleted ? (
                                    <Sparkles className="h-4 w-4" />
                                ) : (
                                    level.levelNumber
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    isCurrent ? "text-white" : isCompleted ? "text-white/70" : "text-white/30"
                                )}>
                                    {level.label}
                                </p>
                            </div>
                            {isCurrent && (
                                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                    Current
                                </span>
                            )}
                            {isCompleted && (
                                <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60">
                                    Done
                                </span>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </GlassCard>
    )
}

// --- Achievements ---

function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
    const unlocked = achievements.filter((a) => a.unlocked)
    const locked = achievements.filter((a) => !a.unlocked)

    return (
        <GlassCard delay={0.25}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[0.75px] border-amber-500/20 bg-amber-500/10">
                        <Trophy className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Achievements</h2>
                        <p className="text-xs text-white/40">
                            {unlocked.length} / {achievements.length} unlocked
                        </p>
                    </div>
                </div>
                {/* Progress ring */}
                <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
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
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/70">
                        {Math.round((unlocked.length / Math.max(achievements.length, 1)) * 100)}%
                    </span>
                </div>
            </div>

            {/* Unlocked achievements */}
            {unlocked.length > 0 && (
                <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Unlocked</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unlocked.map((achievement, i) => (
                            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked achievements */}
            {locked.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Locked</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {locked.map((achievement, i) => (
                            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
                        ))}
                    </div>
                </div>
            )}
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
            transition={{ delay: 0.4 + index * 0.04 }}
            className={cn(
                "flex items-center gap-3 rounded-xl border-[0.75px] px-4 py-3 transition-all",
                achievement.unlocked
                    ? cn(rarity.border, rarity.glow, "bg-white/[0.04]")
                    : "border-white/5 bg-white/[0.01] opacity-40 grayscale"
            )}
        >
            <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0",
                achievement.unlocked ? cn(rarity.bg, rarity.border, "border-[0.75px]") : "bg-white/5 border-[0.75px] border-white/5"
            )}>
                <Icon className={cn(
                    "h-5 w-5",
                    achievement.unlocked ? rarity.color : "text-white/20"
                )} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        achievement.unlocked ? "text-white" : "text-white/30"
                    )}>
                        {achievement.title}
                    </p>
                    <span className={cn(
                        "flex-shrink-0 text-[8px] font-bold uppercase tracking-widest",
                        rarity.color
                    )}>
                        {rarity.label}
                    </span>
                </div>
                <p className="text-[11px] text-white/30 truncate">
                    {achievement.description}
                </p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-blue-400/60 flex items-center gap-0.5">
                        <Zap className="h-2.5 w-2.5" /> +{achievement.xp_reward} XP
                    </span>
                    <span className="text-[10px] text-amber-400/60 flex items-center gap-0.5">
                        <CreditCard className="h-2.5 w-2.5" /> +{achievement.credit_reward}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

// --- Premium Upsell Card ---

function PremiumCard({ isPremium }: { isPremium: boolean }) {
    if (isPremium) {
        return (
            <GlassCard delay={0.3}>
                <div className="relative overflow-hidden">
                    {/* Animated gradient background */}
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
                        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                            Premium Active
                        </h3>
                        <p className="text-sm text-white/40 mt-1">
                            You have access to all premium features
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
                className="relative overflow-hidden rounded-xl border-[0.75px] border-purple-500/10 p-6 md:p-8 backdrop-blur-3xl"
                style={{
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(124, 58, 237, 0.06) 100%)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(168, 85, 247, 0.1) inset",
                }}
            >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.06] via-transparent to-purple-500/[0.03] rounded-xl" />

                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />

                <div className="relative z-10 text-center py-2">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] mb-4"
                    >
                        <Crown className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-1">
                        Upgrade to{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-400">
                            Premium
                        </span>
                    </h3>
                    <p className="text-sm text-white/40 mb-5 max-w-xs mx-auto">
                        Unlock unlimited simulations, advanced AI personas, and exportable certificates.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 rounded-xl h-11 px-6 text-sm font-semibold bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] hover:shadow-[0_0_30px_-5px_rgba(78,30,64,0.7)] transition-all"
                    >
                        <Sparkles className="h-4 w-4" />
                        Go Premium
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

// --- Main Export ---

export function ProfilePage({ profile, achievements }: ProfilePageProps) {
    return (
        <div className="relative min-h-screen">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,7,100,0.06),transparent_40%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-4 md:space-y-6">
                {/* Hero Card */}
                <ProfileHero profile={profile} />

                {/* Stats Grid */}
                <StatsGrid profile={profile} />

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                    {/* Left: Level Progression */}
                    <div className="lg:col-span-2">
                        <LevelProgression profile={profile} />
                    </div>

                    {/* Right: Achievements */}
                    <div className="lg:col-span-3">
                        <AchievementsSection achievements={achievements} />
                    </div>
                </div>

                {/* Premium Card */}
                <PremiumCard isPremium={profile.is_premium} />
            </div>
        </div>
    )
}
