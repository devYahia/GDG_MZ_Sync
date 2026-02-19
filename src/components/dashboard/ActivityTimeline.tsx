import {
    Trophy, Flame, Mic, GitPullRequest, FileText, Star,
    LogIn, CheckCircle, Play, Code2, Zap, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const EVENT_CONFIG: Record<string, { label: string; icon: any; color: string; href?: (id: string | null) => string }> = {
    onboarding_completed: { label: "Completed onboarding", icon: CheckCircle, color: "text-emerald-400" },
    simulation_started: { label: "Started a simulation", icon: Play, color: "text-violet-400", href: (id) => id ? `/project/${id}` : "/simulations/create" },
    simulation_completed: { label: "Completed a simulation", icon: Trophy, color: "text-amber-400" },
    code_review_requested: { label: "Requested code review", icon: GitPullRequest, color: "text-blue-400", href: () => "/code-review" },
    code_review_completed: { label: "Code review finished", icon: CheckCircle, color: "text-green-400" },
    report_generated: { label: "Generated a report", icon: FileText, color: "text-cyan-400" },
    interview_completed: { label: "Completed an interview", icon: Mic, color: "text-orange-400" },
    achievement_unlocked: { label: "Unlocked an achievement", icon: Star, color: "text-yellow-400" },
    chat_message_sent: { label: "Sent a message", icon: Code2, color: "text-slate-400" },
}

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" })
}

interface ActivityTimelineProps {
    activities: Array<{
        id: string
        eventType: string
        contextType: string | null
        contextId: string | null
        metadata: unknown
        createdAt: Date
    }>
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
    if (activities.length === 0) return null

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
            </div>
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-white/5" />

                <ul className="space-y-1">
                    {activities.map((activity, idx) => {
                        const config = EVENT_CONFIG[activity.eventType] ?? {
                            label: activity.eventType.replace(/_/g, " "),
                            icon: Zap,
                            color: "text-muted-foreground",
                        }
                        const Icon = config.icon
                        const href = config.href?.(activity.contextId)

                        const content = (
                            <div className="group ml-10 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/80 truncate">{config.label}</p>
                                    {activity.metadata && typeof activity.metadata === "object" &&
                                        "title" in (activity.metadata as Record<string, unknown>) ? (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {String((activity.metadata as Record<string, unknown>).title)}
                                        </p>
                                    ) : null}
                                </div>
                                <time className="text-xs text-muted-foreground shrink-0">{timeAgo(activity.createdAt)}</time>
                            </div>
                        )

                        return (
                            <li key={activity.id} className="relative flex items-center">
                                {/* Dot */}
                                <div className={cn(
                                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0f0f0f]",
                                )}>
                                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                                </div>
                                {href ? (
                                    <Link href={href} className="flex-1">
                                        {content}
                                    </Link>
                                ) : (
                                    <div className="flex-1">{content}</div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
