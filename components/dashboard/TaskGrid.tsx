"use client"

import { useState, useMemo } from "react"
import { motion } from "motion/react"
import { Sparkles, FolderKanban } from "lucide-react"

import { TaskCard } from "@/components/dashboard/TaskCard"
import { TaskFilters } from "@/components/dashboard/TaskFilters"
import { TASKS, type TaskField } from "@/lib/tasks"

export function TaskGrid() {
    const [selectedTracks, setSelectedTracks] = useState<TaskField[]>([])
    const [selectedLevels, setSelectedLevels] = useState<number[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const filteredTasks = useMemo(() => {
        return TASKS.filter((task) => {
            if (selectedTracks.length > 0 && !selectedTracks.includes(task.field)) return false
            if (selectedLevels.length > 0 && !selectedLevels.includes(task.level)) return false
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                return (
                    task.title.toLowerCase().includes(q) ||
                    task.description.toLowerCase().includes(q) ||
                    task.clientPersona.toLowerCase().includes(q) ||
                    task.tools.some((t) => t.toLowerCase().includes(q))
                )
            }
            return true
        })
    }, [selectedTracks, selectedLevels, searchQuery])

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap items-center gap-2"
            >
                <FolderKanban className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Projects</h2>
                <span className="text-sm text-muted-foreground">Filter by track & level</span>
            </motion.div>
            <TaskFilters
                selectedTracks={selectedTracks}
                selectedLevels={selectedLevels}
                searchQuery={searchQuery}
                onTracksChange={setSelectedTracks}
                onLevelsChange={setSelectedLevels}
                onSearchChange={setSearchQuery}
            />

            {filteredTasks.length > 0 ? (
                <motion.div
                    layout
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                        hidden: {},
                    }}
                >
                    {filteredTasks.map((task, i) => (
                        <motion.div
                            key={task.id}
                            layout
                            variants={{
                                hidden: { opacity: 0, y: 12 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <TaskCard task={task} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center"
                >
                    <Sparkles className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">No projects found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Try adjusting your filters or search
                    </p>
                </motion.div>
            )}
        </div>
    )
}
