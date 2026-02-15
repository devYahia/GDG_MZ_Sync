"use client"

import { useState, useMemo } from "react"
import { Sparkles } from "lucide-react"

import { TaskCard } from "@/components/dashboard/TaskCard"
import { TaskFilters } from "@/components/dashboard/TaskFilters"
import { TASKS, type TaskField, type TaskDifficulty } from "@/lib/tasks"

export function TaskGrid() {
    const [selectedField, setSelectedField] = useState<TaskField | "all">("all")
    const [selectedDifficulty, setSelectedDifficulty] = useState<
        TaskDifficulty | "all"
    >("all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredTasks = useMemo(() => {
        return TASKS.filter((task) => {
            if (selectedField !== "all" && task.field !== selectedField)
                return false
            if (
                selectedDifficulty !== "all" &&
                task.difficulty !== selectedDifficulty
            )
                return false
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
    }, [selectedField, selectedDifficulty, searchQuery])

    return (
        <div className="space-y-6">
            <TaskFilters
                selectedField={selectedField}
                selectedDifficulty={selectedDifficulty}
                searchQuery={searchQuery}
                onFieldChange={setSelectedField}
                onDifficultyChange={setSelectedDifficulty}
                onSearchChange={setSearchQuery}
            />

            {filteredTasks.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                    <Sparkles className="mb-3 h-8 w-8 text-white/20" />
                    <p className="text-sm font-medium text-white/60">No simulations found</p>
                    <p className="mt-1 text-xs text-white/40">
                        Try adjusting your filters
                    </p>
                </div>
            )}
        </div>
    )
}
