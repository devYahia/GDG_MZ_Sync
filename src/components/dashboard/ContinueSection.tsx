import { Clock, ArrowRight, Code, Server, Layers, Smartphone, BarChart3, Palette } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { InProgressProject } from "@/app/(dashboard)/actions"

const FIELD_ICONS: Record<string, any> = {
    frontend: Code,
    backend: Server,
    fullstack: Layers,
    mobile: Smartphone,
    data: BarChart3,
    design: Palette,
}

const FIELD_COLORS: Record<string, string> = {
    frontend: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    backend: "bg-green-500/15 text-green-400 border-green-500/30",
    fullstack: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    mobile: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    data: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    design: "bg-pink-500/15 text-pink-400 border-pink-500/30",
}

function timeAgo(date: Date | null): string {
    if (!date) return "Never"
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}

interface ContinueSectionProps {
    projects: InProgressProject[]
}

export function ContinueSection({ projects }: ContinueSectionProps) {
    if (projects.length === 0) return null

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Continue Where You Left Off</h2>
                <Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    View all
                </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                    const Icon = FIELD_ICONS[project.field] ?? Code
                    const colorClass = FIELD_COLORS[project.field] ?? FIELD_COLORS.frontend
                    return (
                        <Card
                            key={project.projectId}
                            className="group relative overflow-hidden border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                        >
                            {/* Subtle glow */}
                            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <Badge variant="outline" className={cn("text-xs", colorClass)}>
                                        {project.field}
                                    </Badge>
                                </div>
                                <h3 className="font-medium text-sm leading-snug mt-2">{project.title}</h3>
                            </CardHeader>

                            <CardContent className="pb-3">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{project.progressPercent}%</span>
                                    </div>
                                    <Progress value={project.progressPercent} className="h-1.5" />
                                </div>
                            </CardContent>

                            <CardFooter className="pt-0 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {timeAgo(project.lastActivityAt)}
                                </span>
                                <Link href={`/project/${project.projectId}`}>
                                    <Button size="sm" variant="ghost" className="h-7 px-3 text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        Resume
                                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </section>
    )
}
