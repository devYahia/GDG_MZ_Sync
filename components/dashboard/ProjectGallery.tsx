"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Sparkles, SlidersHorizontal, Filter } from "lucide-react"

import { TaskCard } from "@/components/dashboard/TaskCard"
import { TASKS, FIELD_CONFIG, LEVEL_CONFIG, type TaskField } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const

// Tab definitions — "all" plus each field (tracks)
const TABS: { id: string; label: string; field?: TaskField }[] = [
    { id: "all", label: "All" },
    { id: "frontend", label: "Frontend", field: "frontend" },
    { id: "backend", label: "Backend", field: "backend" },
    { id: "fullstack", label: "Full Stack", field: "fullstack" },
    { id: "mobile", label: "Mobile", field: "mobile" },
    { id: "data", label: "Data / AI", field: "data" },
    { id: "design", label: "Design", field: "design" },
]

function toggleInArray<T>(arr: T[] | undefined, item: T): T[] {
    const a = Array.isArray(arr) ? arr : []
    if (a.includes(item)) return a.filter((x) => x !== item)
    return [...a, item]
}

export function ProjectGallery() {
    const [activeTab, setActiveTab] = useState("all")
    const [selectedLevel, setSelectedLevel] = useState<number | "all">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearch, setShowSearch] = useState(false)
    const [showLevelFilter, setShowLevelFilter] = useState(false)

    const filteredTasks = useMemo(() => {
        let tasks = TASKS

        // Filter by track (tab)
        const tab = TABS.find((t) => t.id === activeTab)
        if (tab?.field) {
            tasks = tasks.filter((t) => t.field === tab.field)
        }

        // Filter by level (1–8)
        if (selectedLevel !== "all") {
            tasks = tasks.filter((t) => t.level === selectedLevel)
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            tasks = tasks.filter(
                (t) =>
                    (t.title && t.title.toLowerCase().includes(q)) ||
                    (t.description && t.description.toLowerCase().includes(q)) ||
                    (t.clientPersona && t.clientPersona.toLowerCase().includes(q)) ||
                    (Array.isArray(t.tools) && t.tools.some((tool) => String(tool).toLowerCase().includes(q)))
            )
        }

        return tasks
    }, [activeTab, selectedLevel, searchQuery])

    return (
        <section className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Simulation Projects</h2>
                        <p className="text-xs text-muted-foreground">Pick a project and start your simulation</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowLevelFilter(!showLevelFilter)}
                        className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                            showLevelFilter || selectedLevel !== "all"
                                ? "border-purple-500/40 bg-purple-500/10 text-purple-400 dark:text-purple-300"
                                : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground/70"
                        )}
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Level {selectedLevel === "all" ? "1–8" : selectedLevel}
                    </button>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                            showSearch
                                ? "border-purple-500/40 bg-purple-500/10 text-purple-400 dark:text-purple-300"
                                : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground/70"
                        )}
                    >
                        <Search className="h-3.5 w-3.5" />
                        Search
                    </button>
                </div>
            </div>

            {/* Level filter (1–8) */}
            <AnimatePresence>
                {showLevelFilter && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap items-center gap-2 py-2">
                            <span className="text-xs text-muted-foreground/70 mr-1">Level:</span>
                            <button
                                onClick={() => setSelectedLevel("all")}
                                className={cn(
                                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                                    selectedLevel === "all"
                                        ? "border-purple-500/50 bg-purple-500/20 text-purple-400 dark:text-purple-300"
                                        : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground/70"
                                )}
                            >
                                All
                            </button>
                            {LEVELS.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={cn(
                                        "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                                        selectedLevel === level
                                            ? "border-purple-500/50 bg-purple-500/20 text-purple-400 dark:text-purple-300"
                                            : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground/70"
                                    )}
                                >
                                    L{level}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search bar (collapsible) */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by project name, persona, or tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/20 p-1 scrollbar-hide">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id
                    const fieldConf = tab.field ? FIELD_CONFIG[tab.field] : null
                    const Icon = fieldConf?.icon

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200",
                                isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground/70"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-lg bg-card border border-border shadow-sm"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                {Icon && <Icon className={cn("h-3.5 w-3.5", isActive ? fieldConf?.color : "")} />}
                                {tab.label}
                                {tab.field && (
                                    <span className={cn(
                                        "text-[10px] min-w-[18px] text-center rounded-full px-1",
                                        isActive ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"
                                    )}>
                                        {TASKS.filter(t => t.field === tab.field).length}
                                    </span>
                                )}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Level Filters */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Levels</p>
                <div className="flex flex-wrap gap-2">
                    {LEVEL_CONFIG.map((lvl) => {
                        const isSelected = selectedLevel === lvl.levelNumber
                        const showActive = selectedLevel === "all" || isSelected
                        return (
                            <button
                                key={lvl.levelNumber}
                                type="button"
                                onClick={() => setSelectedLevel(isSelected ? "all" : lvl.levelNumber)}
                                className={cn(
                                    "rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-[1.02]",
                                    showActive
                                        ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-sm"
                                        : "border-border bg-muted/30 text-muted-foreground hover:border-amber-500/30 hover:text-foreground"
                                )}
                            >
                                L{lvl.levelNumber}
                                {isSelected && " ✓"}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Grid */}
            {filteredTasks.length > 0 ? (
                <motion.div
                    layout
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.04 } },
                        hidden: {},
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                variants={{
                                    hidden: { opacity: 0, y: 12, scale: 0.97 },
                                    visible: { opacity: 1, y: 0, scale: 1 },
                                }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                            >
                                <TaskCard task={task} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 py-20 text-center"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30 border border-border mb-4">
                        <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground/60">No projects found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Try a different tab, level, or search term
                    </p>
                </motion.div>
            )}
        </section>
    )
}
