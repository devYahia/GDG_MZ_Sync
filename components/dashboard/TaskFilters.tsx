"use client"

import { motion } from "motion/react"
import { Search, X, Filter } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

function toggleInArray<T>(arr: T[], item: T): T[] {
  if (arr.includes(item)) return arr.filter((x) => x !== item)
  return [...arr, item]
}

export function TaskFilters({
  selectedTracks,
  selectedLevels,
  searchQuery,
  onTracksChange,
  onLevelsChange,
  onSearchChange,
}: TaskFiltersProps) {
  const hasActiveFilters =
    selectedTracks.length > 0 || selectedLevels.length > 0 || searchQuery.length > 0

  const clearAll = () => {
    onTracksChange([])
    onLevelsChange([])
    onSearchChange("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-card/40 shadow-sm backdrop-blur-sm overflow-hidden"
    >
      {/* Top row: search + clear */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border/60">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search projects, clients, tools..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pl-9 pr-4 rounded-xl border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground rounded-xl"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Wrapped filter chips */}
      <div className="p-4 pt-3 space-y-4">
        {/* Tracks */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
            <Filter className="h-3 w-3" />
            Tracks
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FIELD_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              const isExplicitlySelected = selectedTracks.includes(key as TaskField)
              const showActive = selectedTracks.length === 0 || isExplicitlySelected
              const activeClasses: Record<string, string> = {
                blue: "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400",
                green: "border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-400",
                purple: "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400",
                orange: "border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-400",
                cyan: "border-cyan-500/40 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
                pink: "border-pink-500/40 bg-pink-500/15 text-pink-600 dark:text-pink-400",
              }
              const colorKey = config.color.includes("blue") ? "blue" : config.color.includes("green") ? "green" : config.color.includes("purple") ? "purple" : config.color.includes("orange") ? "orange" : config.color.includes("cyan") ? "cyan" : "pink"
              const chipClass = showActive
                ? activeClasses[colorKey]
                : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/60"
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onTracksChange(toggleInArray(selectedTracks, key as TaskField))}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${chipClass}`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {config.label}
                  {isExplicitlySelected && selectedTracks.length > 0 && <span className="opacity-80">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Levels */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 w-14">
              Level
            </span>
            <div className="flex flex-wrap gap-2">
              {LEVEL_CONFIG.map((lvl) => {
                const isExplicitlySelected = selectedLevels.includes(lvl.levelNumber)
                const showActive = selectedLevels.length === 0 || isExplicitlySelected
                return (
                  <button
                    key={lvl.levelNumber}
                    type="button"
                    onClick={() => onLevelsChange(toggleInArray(selectedLevels, lvl.levelNumber))}
                    className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${showActive ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400" : "border-border bg-muted/40 text-muted-foreground hover:border-amber-500/30 hover:text-foreground"}`}
                  >
                    L{lvl.levelNumber}
                    {isExplicitlySelected && selectedLevels.length > 0 && " ✓"}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
