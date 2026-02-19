import { Sparkles, MessageSquare, Code2, Mic, FileText, GitPullRequest } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Feature {
    id: string
    title: string
    description: string
    href: string
    icon: any
    gradient: string
    eventType: string // matches activity log event type
}

const ALL_FEATURES: Feature[] = [
    {
        id: "simulation",
        title: "Project Simulations",
        description: "Practice real-world projects with AI client personas.",
        href: "/simulations/create",
        icon: Code2,
        gradient: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
        eventType: "simulation_started",
    },
    {
        id: "interview",
        title: "Mock Interviews",
        description: "Sharpen your interview skills with an AI interviewer.",
        href: "/dashboard/interview",
        icon: Mic,
        gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
        eventType: "interview_completed",
    },
    {
        id: "code_review",
        title: "AI Code Review",
        description: "Get instant, detailed feedback on your GitHub code.",
        href: "/code-review",
        icon: GitPullRequest,
        gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
        eventType: "code_review_requested",
    },
    {
        id: "report",
        title: "Performance Reports",
        description: "Generate AI-powered skill assessments after each session.",
        href: "/dashboard/progress",
        icon: FileText,
        gradient: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
        eventType: "report_generated",
    },
]

interface DiscoverSectionProps {
    discoveredEventTypes: Set<string>
}

export function DiscoverSection({ discoveredEventTypes }: DiscoverSectionProps) {
    const undiscovered = ALL_FEATURES.filter((f) => !discoveredEventTypes.has(f.eventType))

    if (undiscovered.length === 0) return null

    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">Discover Features</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {undiscovered.slice(0, 4).map((feature) => {
                    const Icon = feature.icon
                    return (
                        <Link
                            key={feature.id}
                            href={feature.href}
                            className={cn(
                                "group relative flex items-start gap-4 rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
                                feature.gradient
                            )}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                                <Icon className="h-5 w-5 text-white/80" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-white/90">{feature.title}</p>
                                <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{feature.description}</p>
                                <span className="mt-2 inline-flex items-center text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                                    Try it now →
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
