"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Sparkles, SlidersHorizontal } from "lucide-react"

import { TaskCard } from "@/components/dashboard/TaskCard"
import { TASKS, FIELD_CONFIG, type TaskField } from "@/lib/tasks"
import { cn } from "@/lib/utils"

// Tab definitions — "all" plus each field
const TABS: { id: string; label: string; field?: TaskField }[] = [
    { id: "all", label: "All" },
    { id: "frontend", label: "Frontend", field: "frontend" },
    { id: "backend", label: "Backend", field: "backend" },
    { id: "fullstack", label: "Full Stack", field: "fullstack" },
    { id: "mobile", label: "Mobile", field: "mobile" },
    { id: "data", label: "Data / AI", field: "data" },
    { id: "design", label: "Design", field: "design" },
]

export function ProjectGallery() {
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearch, setShowSearch] = useState(false)

    const filteredTasks = useMemo(() => {
        let tasks = TASKS

        // Filter by tab
        const tab = TABS.find((t) => t.id === activeTab)
        if (tab?.field) {
            tasks = tasks.filter((t) => t.field === tab.field)
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            tasks = tasks.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    t.clientPersona.toLowerCase().includes(q) ||
                    t.tools.some((tool) => tool.toLowerCase().includes(q))
            )
        }

        return tasks
    }, [activeTab, searchQuery])

    return (
        <section className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
                        <Sparkles className="h-4.5 w-4.5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Simulation Projects</h2>
                        <p className="text-xs text-white/40">Pick a project and start your simulation</p>
                    </div>
                </div>

                {/* Search toggle */}
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                        showSearch
                            ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                    )}
                >
                    <Search className="h-3.5 w-3.5" />
                    Search
                </button>
            </div>

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
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search by project name, persona, or tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-1 scrollbar-hide">
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
                                    ? "text-white"
                                    : "text-white/40 hover:text-white/60"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                {Icon && <Icon className={cn("h-3.5 w-3.5", isActive ? fieldConf?.color : "")} />}
                                {tab.label}
                                {tab.field && (
                                    <span className={cn(
                                        "text-[10px] min-w-[18px] text-center rounded-full px-1",
                                        isActive ? "bg-white/15 text-white/80" : "bg-white/5 text-white/30"
                                    )}>
                                        {TASKS.filter(t => t.field === tab.field).length}
                                    </span>
                                )}
                            </span>
                        </button>
                    )
                })}
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
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                        <SlidersHorizontal className="h-6 w-6 text-white/30" />
                    </div>
                    <p className="text-sm font-medium text-white/60">No projects found</p>
                    <p className="mt-1 text-xs text-white/30">
                        Try a different tab or search term
                    </p>
                </motion.div>
            )}
        </section>
    )
}
