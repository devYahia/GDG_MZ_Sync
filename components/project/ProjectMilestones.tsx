"use client"

import { motion } from "motion/react"
import { CheckCircle2, Circle, Lock, ArrowRight, PartyPopper } from "lucide-react"
import type { SimulationMilestone } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProjectMilestonesProps {
    milestones: SimulationMilestone[]
    completedIndices: number[]
    onToggle: (index: number) => void
}

export function ProjectMilestones({ milestones, completedIndices, onToggle }: ProjectMilestonesProps) {
    const isComplete = (index: number) => completedIndices.includes(index)
    // A milestone is unlocked if the previous one is complete (or it's the first one)
    const isUnlocked = (index: number) => index === 0 || isComplete(index - 1)

    return (
        <div className="flex h-full flex-col overflow-y-auto bg-black p-6 md:p-10 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h2 className="text-3xl font-bold text-white">Project Roadmap</h2>
                <p className="text-white/60">
                    Track your progress through the project stages. Completing milestones unlocks new challenges and feedback.
                </p>
            </motion.div>

            <div className="space-y-4 max-w-3xl">
                {milestones.map((milestone, i) => {
                    const completed = isComplete(i)
                    const unlocked = isUnlocked(i)
                    const title = typeof milestone === 'string' ? milestone : milestone.title
                    const description = typeof milestone === 'string' ? '' : milestone.description

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: unlocked ? 1 : 0.5, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                                completed
                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                    : unlocked
                                        ? "bg-white/5 border-white/10 hover:border-white/20"
                                        : "bg-black/40 border-white/5 opacity-50"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => unlocked && onToggle(i)}
                                    disabled={!unlocked || completed}
                                    className={cn(
                                        "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                                        completed
                                            ? "border-emerald-500 bg-emerald-500 text-black"
                                            : unlocked
                                                ? "border-white/30 hover:border-white text-transparent hover:bg-white/10"
                                                : "border-white/10 text-transparent cursor-not-allowed"
                                    )}
                                >
                                    {completed ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <Circle className="h-5 w-5" />
                                    )}
                                </button>

                                <div className="flex-1 space-y-1">
                                    <h3 className={cn(
                                        "text-xl font-semibold transition-colors",
                                        completed ? "text-emerald-400" : unlocked ? "text-white" : "text-white/40"
                                    )}>
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="text-white/60 leading-relaxed">
                                            {description}
                                        </p>
                                    )}

                                    {/* Unlocked/Locked Badge */}
                                    <div className="pt-2 flex items-center gap-2">
                                        {!unlocked ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/30">
                                                <Lock className="h-3 w-3" /> Locked
                                            </span>
                                        ) : completed ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                                                <PartyPopper className="h-3 w-3" /> Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                                                <ArrowRight className="h-3 w-3" /> In Progress
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Strikethrough line effect if completed */}
                            {completed && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/20"
                                />
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
