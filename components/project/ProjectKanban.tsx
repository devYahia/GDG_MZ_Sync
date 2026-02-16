"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { SimulationMilestone } from "@/lib/api"
import { CheckCircle2, Circle, Clock, MoreHorizontal, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectKanbanProps {
    milestones: SimulationMilestone[]
    completedIndices: number[]
    onToggle: (index: number) => void
}

type KanbanColumn = "todo" | "doing" | "done"

interface KanbanItem {
    id: number
    title: string
    description: string
    status: KanbanColumn
    originalIndex: number
}

export function ProjectKanban({ milestones, completedIndices, onToggle }: ProjectKanbanProps) {
    const [items, setItems] = useState<KanbanItem[]>([])

    useEffect(() => {
        // Map milestones to kanban items
        const newItems = milestones.map((m, i) => {
            const isCompleted = completedIndices.includes(i)
            // Logic for "doing": If not completed, and previous is completed (or it's the first one)
            const isUnlocked = i === 0 || completedIndices.includes(i - 1)

            let status: KanbanColumn = "todo"
            if (isCompleted) status = "done"
            else if (isUnlocked) status = "doing"

            return {
                id: i,
                title: typeof m === 'string' ? m : m.title,
                description: typeof m === 'string' ? '' : m.description,
                status,
                originalIndex: i
            }
        })
        setItems(newItems)
    }, [milestones, completedIndices])

    const columns: { id: KanbanColumn; label: string; color: string }[] = [
        { id: "todo", label: "To Do", color: "bg-white/5 border-white/10" },
        { id: "doing", label: "In Progress", color: "bg-blue-500/10 border-blue-500/20" },
        { id: "done", label: "Done", color: "bg-emerald-500/10 border-emerald-500/20" },
    ]

    return (
        <div className="h-full overflow-x-auto overflow-y-hidden bg-black p-6 md:p-8">
            <div className="flex h-full gap-6 min-w-[800px]">
                {columns.map((col) => {
                    const colItems = items.filter(item => item.status === col.id)

                    return (
                        <div key={col.id} className="flex h-full w-1/3 min-w-[300px] flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-semibold text-white/90 flex items-center gap-2">
                                    <span className={cn("h-2 w-2 rounded-full", col.id === 'todo' ? "bg-white/30" : col.id === 'doing' ? "bg-blue-400" : "bg-emerald-400")} />
                                    {col.label}
                                </h3>
                                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50">
                                    {colItems.length}
                                </span>
                            </div>

                            <div className={cn("flex-1 rounded-2xl border p-3 md:p-4 overflow-y-auto space-y-3 scrollbar-hide", col.color)}>
                                <AnimatePresence mode="popLayout">
                                    {colItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layoutId={`card-${item.id}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-black/40 p-4 transition-all hover:border-white/20 hover:bg-black/60 hover:shadow-lg"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-medium text-white text-sm leading-snug">
                                                    {item.title}
                                                </h4>
                                                {item.status === "doing" && (
                                                    <button
                                                        onClick={() => onToggle(item.originalIndex)}
                                                        className="shrink-0 rounded-full bg-blue-500/10 p-1.5 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                                                        title="Mark as Done"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {item.description && (
                                                <p className="text-xs text-white/50 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                                                <span className="text-[10px] font-mono text-white/30 truncate">
                                                    MS-{item.originalIndex + 1}
                                                </span>
                                                {item.status === 'done' && (
                                                    <span className="flex items-center gap-1 text-[10px] text-emerald-400/80">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Completed
                                                    </span>
                                                )}
                                                {item.status === 'todo' && (
                                                    <span className="flex items-center gap-1 text-[10px] text-white/30">
                                                        <Clock className="h-3 w-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {colItems.length === 0 && (
                                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/5 p-4 text-center">
                                        <p className="text-xs text-white/20">No tasks</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
