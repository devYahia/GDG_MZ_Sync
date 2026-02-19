"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Clock, Star, Zap, Code, Layout, Database, Server, Smartphone, BarChart3, Palette, Shield, Layers } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    TASKS,
    FIELD_CONFIG,
    DIFFICULTY_CONFIG,
    type TaskField,
    type SimulationTask
} from "@/lib/tasks"
import { cn } from "@/lib/utils"

interface SimulationTemplatesProps {
    userField: string | null
}

export function SimulationTemplates({ userField }: SimulationTemplatesProps) {
    const [showAll, setShowAll] = useState(false)

    // Normalize user field to TaskField or default to frontend if unknown
    const normalizedField = (userField?.toLowerCase() as TaskField) || "frontend"

    // Filter tasks
    const relevantTasks = TASKS.filter(t => t.field === normalizedField)
    const otherTasks = TASKS.filter(t => t.field !== normalizedField)

    // If no relevant tasks found (e.g. unknown field), show all
    const displayTasks = showAll || relevantTasks.length === 0 ? TASKS : relevantTasks
    const hasMore = relevantTasks.length > 0 && otherTasks.length > 0

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">Simulation Templates</h2>
                    <p className="text-sm text-muted-foreground">
                        Real-world scenarios tailored to your {showAll ? "skills" : "specialization"}
                    </p>
                </div>
                {hasMore && (
                    <Button
                        variant="ghost"
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm"
                    >
                        {showAll ? "Show Recommended" : "Explore All"}
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {displayTasks.map((task, i) => {
                        const fieldConfig = FIELD_CONFIG[task.field]
                        const difficultyConfig = DIFFICULTY_CONFIG[task.difficulty]
                        const FieldIcon = fieldConfig.icon

                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: i * 0.05 }}
                            >
                                <Link href={`/simulations/create?template=${task.id}`}>
                                    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-primary/5">
                                        {/* Hover Gradient Bloom */}
                                        <div className="absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

                                        <div className="relative p-6 space-y-4">
                                            {/* Header: Icon + Difficulty */}
                                            <div className="flex items-start justify-between">
                                                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-transform group-hover:scale-110", fieldConfig.bg)}>
                                                    <FieldIcon className={cn("h-6 w-6", fieldConfig.color)} />
                                                </div>
                                                <Badge variant="outline" className={cn("capitalize border-white/10 bg-black/20", difficultyConfig.color)}>
                                                    {difficultyConfig.label}
                                                </Badge>
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {task.description}
                                                </p>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {task.duration}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="h-3.5 w-3.5 text-amber-500/50" />
                                                    Lvl {task.level}
                                                </div>
                                            </div>

                                            {/* Tools Tags */}
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {task.tools.slice(0, 3).map(tool => (
                                                    <span key={tool} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/60 border border-white/5">
                                                        {tool}
                                                    </span>
                                                ))}
                                                {task.tools.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40 border border-white/5">
                                                        +{task.tools.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="border-t border-white/5 p-4 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors">
                                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                                <span>Start Simulation</span>
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </section>
    )
}
