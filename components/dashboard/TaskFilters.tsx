"use client"

import { motion } from "motion/react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

import { FIELD_CONFIG, LEVEL_CONFIG, type TaskField } from "@/lib/tasks"

export type MultiSelectFilters = {
    tracks: TaskField[]
    levels: number[]
}

interface TaskFiltersProps {
    selectedTracks: TaskField[]
    selectedLevels: number[]
    searchQuery: string
    onTracksChange: (tracks: TaskField[]) => void
    onLevelsChange: (levels: number[]) => void
    onSearchChange: (query: string) => void
}



function toggleInArray<T>(arr: T[] | undefined, item: T): T[] {
    const a = Array.isArray(arr) ? arr : []
    if (a.includes(item)) return a.filter((x) => x !== item)
    return [...a, item]
}

export function TaskFilters({
    selectedTracks,
    selectedLevels,
    searchQuery,
    onTracksChange,
    onLevelsChange,
    onSearchChange,
}: TaskFiltersProps) {
    const st = Array.isArray(selectedTracks) ? selectedTracks : []
    const sl = Array.isArray(selectedLevels) ? selectedLevels : []
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5 rounded-2xl border border-border bg-card/50 p-5 shadow-sm"
        >
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search projects, client personas, tools..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 pl-10 rounded-xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 dark:focus:bg-muted/30"
                />
            </div>

            {/* Tracks (multi-select pills) */}
            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tracks</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(FIELD_CONFIG).map(([key, config]) => {
                        if (!config) return null
                        const Icon = config.icon
                        const color = config.color ?? ""

                        const isExplicitlySelected = st.includes(key as TaskField)
                        const showActive = st.length === 0 ? true : isExplicitlySelected
                        let activeClass = "border-border bg-muted/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        if (showActive && color) {
                            if (color.includes("blue")) activeClass = "border-blue-500/50 bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm"
                            else if (color.includes("green")) activeClass = "border-green-500/50 bg-green-500/15 text-green-600 dark:text-green-400 shadow-sm"
                            else if (color.includes("purple")) activeClass = "border-purple-500/50 bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-sm"
                            else if (color.includes("orange")) activeClass = "border-orange-500/50 bg-orange-500/15 text-orange-600 dark:text-orange-400 shadow-sm"
                            else if (color.includes("cyan")) activeClass = "border-cyan-500/50 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-sm"
                            else if (color.includes("pink")) activeClass = "border-pink-500/50 bg-pink-500/15 text-pink-600 dark:text-pink-400 shadow-sm"
                        }
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onTracksChange(toggleInArray(st, key as TaskField))}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${activeClass}`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {config.label}
                                {isExplicitlySelected && st.length > 0 && (
                                    <span className="ml-0.5 text-[10px] opacity-80">✓</span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>


            {/* Levels (multi-select) */}
            <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Levels</p>
                <div className="flex flex-wrap gap-2">
                    {LEVEL_CONFIG.map((lvl) => {
                        const isExplicitlySelected = sl.includes(lvl.levelNumber)
                        const showActive = sl.length === 0 ? true : isExplicitlySelected
                        return (
                            <button
                                key={lvl.levelNumber}
                                type="button"
                                onClick={() => onLevelsChange(toggleInArray(sl, lvl.levelNumber))}
                                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-[1.02] ${showActive
                                    ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-sm"
                                    : "border-border bg-muted/50 text-muted-foreground hover:border-amber-500/30 hover:text-foreground"
                                    }`}
                            >
                                L{lvl.levelNumber}
                                {isExplicitlySelected && sl.length > 0 && " ✓"}
                            </button>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}
