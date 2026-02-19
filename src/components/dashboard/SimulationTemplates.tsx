"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Clock, Star, Zap, Code, Layout, Database, Server, Smartphone, BarChart3, Palette, Shield, Layers, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    const [searchQuery, setSearchQuery] = useState("")
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    // Normalize user field to TaskField or default to frontend if unknown
    const normalizedField = (userField?.toLowerCase() as TaskField) || "frontend"

    // Filter tasks based on search query
    const displayTasks = TASKS.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.tools.some(tool => tool.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesSearch
    }).sort((a, b) => {
        // Sort recommended field tasks to the top
        if (a.field === normalizedField && b.field !== normalizedField) return -1
        if (a.field !== normalizedField && b.field === normalizedField) return 1
        return 0
    })

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Simulation Templates</h2>
                    <p className="text-sm text-muted-foreground">
                        Real-world scenarios to sharpen your engineering skills.
                    </p>
                </div>

                <div className="relative w-full md:max-w-md group">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search templates & stacks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 pl-11 pr-12 rounded-full border-white/10 bg-white/5 backdrop-blur-md focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-sm shadow-sm hover:bg-white/10"
                        />
                        <div className="absolute right-3 hidden sm:flex items-center gap-1 opacity-50">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
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
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <Badge variant="outline" className={cn("capitalize border-white/10 bg-black/20", difficultyConfig.color)}>
                                                        {difficultyConfig.label}
                                                    </Badge>
                                                    {task.field === normalizedField && (
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Recommended</span>
                                                    )}
                                                </div>
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
