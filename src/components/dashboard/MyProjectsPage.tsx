"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
    FolderKanban,
    Clock,
    Zap,
    ArrowRight,
    Sparkles,
    Filter,
    CheckCircle2,
    Loader2,
    Search,
    Plus,
    Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { FIELD_CONFIG, type TaskField } from "@/lib/tasks"
import { cn } from "@/lib/utils"
import type { UserProject, ProjectStatus } from "@/application/dto/project-dto"

import { deleteUserProject } from "@/app/actions/projects"

// --- Types ---
type TabFilter = "all" | "in_progress" | "completed"

interface MyProjectsPageProps {
    projects: UserProject[]
}

// --- Helpers ---
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffMin < 1) return "Just now"
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getStatusConfig(status: ProjectStatus) {
    if (status === "completed") {
        return {
            label: "Completed",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            icon: CheckCircle2,
        }
    }
    return {
        label: "In Progress",
        color: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        icon: Loader2,
    }
}

// --- Tab Button ---
function TabButton({
    active,
    label,
    count,
    onClick,
}: {
    active: boolean
    label: string
    count: number
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
                active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {label}
            <span
                className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                    active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted-foreground/10 text-muted-foreground"
                )}
            >
                {count}
            </span>
        </button>
    )
}

// --- Project Card ---
function UserProjectCard({ project, onDelete }: { project: UserProject, onDelete: (id: string, isCustom: boolean) => void }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const fieldConfig = FIELD_CONFIG[project.field as TaskField]
    const FieldIcon = fieldConfig?.icon
    const statusConfig = getStatusConfig(project.status)
    const StatusIcon = statusConfig.icon

    const href =
        project.type === "custom" && project.simulationId
            ? `/simulations/${project.simulationId}`
            : `/project/${project.id}`

    const actionLabel = project.status === "completed" ? "Review" : "Continue"

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
            <Card className="group h-full overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 dark:bg-card/60">
                <CardContent className="flex flex-col gap-4 p-5">
                    {/* Top Row: Field badge + Status + Time */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {/* Field badge */}
                            {fieldConfig && (
                                <div
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                                        fieldConfig.bg,
                                        fieldConfig.color,
                                        "border-current/20"
                                    )}
                                >
                                    {FieldIcon && <FieldIcon className="h-3 w-3" />}
                                    {fieldConfig.label}
                                </div>
                            )}

                            {/* Type badge */}
                            {project.type === "custom" && (
                                <div className="flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Custom
                                </div>
                            )}
                        </div>

                        {/* Status badge & Delete Button */}
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                    statusConfig.bg,
                                    statusConfig.color
                                )}
                            >
                                <StatusIcon
                                    className={cn(
                                        "h-3 w-3",
                                        project.status === "in_progress" && "animate-spin"
                                    )}
                                />
                                {statusConfig.label}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (confirm("Are you sure you want to delete this project? Data will be lost.")) {
                                        setIsDeleting(true)
                                        // Wait a tiny bit for the spinner to render before main thread blocks
                                        setTimeout(() => onDelete(project.id, project.type === "custom"), 50)
                                    }
                                }}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {project.description}
                    </p>

                    {/* Level + Client Persona row */}
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                        <span className="rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            L{project.level}
                        </span>
                        <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground/80">Client: </span>
                            <span className="font-medium text-foreground">
                                {project.clientPersona}
                            </span>
                        </span>
                        <Badge
                            variant="secondary"
                            className="ml-auto border-border bg-muted/50 text-[10px] text-muted-foreground"
                        >
                            {project.clientMood}
                        </Badge>
                    </div>

                    {/* Footer: Last activity + Tools + CTA */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(String(project.lastActivity))}
                            </div>
                            <div className="flex gap-1">
                                {project.tools.slice(0, 2).map((tool: string) => (
                                    <span
                                        key={tool}
                                        className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                    >
                                        {tool}
                                    </span>
                                ))}
                                {project.tools.length > 2 && (
                                    <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                        +{project.tools.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="h-8 gap-1 rounded-xl text-xs transition-all duration-300"
                            asChild
                        >
                            <Link href={href} className="gap-1">
                                {actionLabel}
                                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// --- Empty State ---
function EmptyState({ filter }: { filter: TabFilter }) {
    const messages: Record<TabFilter, { title: string; desc: string }> = {
        all: {
            title: "No projects yet",
            desc: "Start a predefined task or create a custom simulation to see your projects here.",
        },
        in_progress: {
            title: "Nothing in progress",
            desc: "Start a task from the dashboard to begin your first project.",
        },
        completed: {
            title: "No completed projects",
            desc: "Complete a simulation to see it listed here.",
        },
    }

    const { title, desc } = messages[filter]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-20"
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50 ring-1 ring-border">
                <FolderKanban className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                <p className="max-w-sm text-sm text-muted-foreground">{desc}</p>
            </div>
            <div className="flex gap-3">
                <Button asChild variant="default" className="gap-2 rounded-xl">
                    <Link href="/dashboard">
                        <ArrowRight className="h-4 w-4" />
                        Browse Tasks
                    </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2 rounded-xl">
                    <Link href="/simulations/create">
                        <Plus className="h-4 w-4" />
                        Create Simulation
                    </Link>
                </Button>
            </div>
        </motion.div>
    )
}

// --- Main Page ---
export function MyProjectsPage({ projects: initialProjects }: MyProjectsPageProps) {
    const [projects, setProjects] = useState<UserProject[]>(initialProjects)
    const [activeTab, setActiveTab] = useState<TabFilter>("all")
    const [searchQuery, setSearchQuery] = useState("")

    // Handle Delete locally for speed
    const handleDelete = async (id: string, isCustom: boolean) => {
        const res = await deleteUserProject(id, isCustom)
        if (res.success) {
            setProjects(prev => prev.filter(p => p.id !== id))
        } else {
            alert(res.error || "Failed to delete project")
            // refresh page to restore state on failure
            window.location.reload()
        }
    }

    // Filter projects
    const filtered = projects.filter((p) => {
        // Tab filter
        if (activeTab !== "all" && p.status !== activeTab) return false
        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            return (
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.fieldLabel.toLowerCase().includes(q) ||
                p.tools.some((t: string) => t.toLowerCase().includes(q))
            )
        }
        return true
    })

    const counts = {
        all: projects.length,
        in_progress: projects.filter((p) => p.status === "in_progress").length,
        completed: projects.filter((p) => p.status === "completed").length,
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-1">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                        <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                            My Projects
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track your simulations and task progress
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Controls: Tabs + Search */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                {/* Tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 backdrop-blur-sm">
                    <TabButton
                        active={activeTab === "all"}
                        label="All"
                        count={counts.all}
                        onClick={() => setActiveTab("all")}
                    />
                    <TabButton
                        active={activeTab === "in_progress"}
                        label="In Progress"
                        count={counts.in_progress}
                        onClick={() => setActiveTab("in_progress")}
                    />
                    <TabButton
                        active={activeTab === "completed"}
                        label="Completed"
                        count={counts.completed}
                        onClick={() => setActiveTab("completed")}
                    />
                </div>

                {/* Search */}
                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 rounded-xl border-border bg-card/60 pl-9 text-sm backdrop-blur-sm placeholder:text-muted-foreground/50"
                    />
                </div>
            </motion.div>

            {/* Projects Grid */}
            {filtered.length > 0 ? (
                <motion.div
                    layout
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <AnimatePresence mode="popLayout">
                        {filtered.map((project) => (
                            <UserProjectCard key={project.id} project={project} onDelete={handleDelete} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <EmptyState filter={activeTab} />
            )}
        </div>
    )
}
