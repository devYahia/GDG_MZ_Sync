"use client"

import { Flame, TrendingUp, Star, Trophy, Target, Zap, Crown, Swords, GitPullRequest, CheckCircle2, Mic } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const ICON_MAP: Record<string, any> = {
    trophy: Trophy,
    swords: Swords,
    "git-pull-request": GitPullRequest,
    "check-circle-2": CheckCircle2,
    mic: Mic,
    star: Star,
    flame: Flame,
    zap: Zap,
    crown: Crown,
    target: Target,
}

// Lazy-load recharts to avoid SSR issues
const RadarChart = dynamic(() => import("recharts").then((m) => m.RadarChart), { ssr: false })
const Radar = dynamic(() => import("recharts").then((m) => m.Radar), { ssr: false })
const PolarGrid = dynamic(() => import("recharts").then((m) => m.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import("recharts").then((m) => m.PolarAngleAxis), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false })

const RARITY_COLORS: Record<string, string> = {
    legendary: "bg-amber-400/20 text-amber-400 border-amber-400/40",
    epic: "bg-purple-400/20 text-purple-400 border-purple-400/40",
    rare: "bg-blue-400/20 text-blue-400 border-blue-400/40",
    common: "bg-slate-400/20 text-slate-400 border-slate-400/40",
}

interface ProgressSnapshotProps {
    currentLevel: number
    nextLevel: number
    xp: number
    xpPercent: number
    streakDays: number
    credits: number
    earnedBadges: Array<{ slug: string; title: string; icon: string; rarity: string }>
    skillAverages: {
        communication: number
        codeQuality: number
        requirementsGathering: number
        technicalDepth: number
        problemSolving: number
        professionalism: number
    } | null
}

export function ProgressSnapshot({
    currentLevel,
    nextLevel,
    xp,
    xpPercent,
    streakDays,
    credits,
    earnedBadges,
    skillAverages,
}: ProgressSnapshotProps) {
    const radarData = skillAverages
        ? [
            { subject: "Comm.", A: skillAverages.communication },
            { subject: "Code", A: skillAverages.codeQuality },
            { subject: "Req.", A: skillAverages.requirementsGathering },
            { subject: "Tech", A: skillAverages.technicalDepth },
            { subject: "Solve", A: skillAverages.problemSolving },
            { subject: "Prof.", A: skillAverages.professionalism },
        ]
        : null

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Level + XP Card */}
            <div className="col-span-full lg:col-span-1 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Current Level</p>
                            <p className="text-2xl font-bold leading-none">{currentLevel}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">XP</p>
                        <p className="text-sm font-semibold tabular-nums">{xp.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Level {currentLevel}</span>
                        <span>Level {nextLevel} — {Math.round(xpPercent)}%</span>
                    </div>
                    <div className="relative">
                        <Progress value={xpPercent} className="h-2" />
                        <div
                            className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Flame className={cn("h-4 w-4", streakDays >= 3 ? "text-orange-400" : "text-muted-foreground")} />
                        <span className="text-sm font-medium">{streakDays}</span>
                        <span className="text-xs text-muted-foreground">day streak</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{credits}</span>
                        <span className="text-xs text-muted-foreground">credits</span>
                    </div>
                </div>
            </div>

            {/* Skills Radar */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">Skill Profile</p>
                </div>
                {radarData ? (
                    <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} />
                                <Radar
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.15}
                                    strokeWidth={1.5}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
                        Complete a session to see skills
                    </div>
                )}
            </div>

            {/* Badges */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <p className="text-sm font-medium">Earned Badges</p>
                </div>
                {earnedBadges.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Complete activities to earn badges.</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {earnedBadges.slice(0, 8).map((badge) => {
                            const Icon = ICON_MAP[badge.icon] || Trophy
                            return (
                                <span
                                    key={badge.slug}
                                    title={badge.title}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-white/10",
                                        RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.common
                                    )}
                                >
                                    <Icon className="h-3 w-3" />
                                    {badge.title}
                                </span>
                            )
                        })}
                        {earnedBadges.length > 8 && (
                            <span className="text-xs text-muted-foreground self-center">+{earnedBadges.length - 8} more</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
