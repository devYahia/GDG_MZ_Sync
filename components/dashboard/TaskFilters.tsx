"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

import { FIELD_CONFIG, type TaskField, type TaskDifficulty } from "@/lib/tasks"

interface TaskFiltersProps {
    selectedField: TaskField | "all"
    selectedDifficulty: TaskDifficulty | "all"
    searchQuery: string
    onFieldChange: (field: TaskField | "all") => void
    onDifficultyChange: (difficulty: TaskDifficulty | "all") => void
    onSearchChange: (query: string) => void
}

const DIFFICULTY_OPTIONS = [
    { value: "all" as const, label: "All Levels" },
    { value: "easy" as const, label: "Easy" },
    { value: "medium" as const, label: "Medium" },
    { value: "hard" as const, label: "Hard" },
]

export function TaskFilters({
    selectedField,
    selectedDifficulty,
    searchQuery,
    onFieldChange,
    onDifficultyChange,
    onSearchChange,
}: TaskFiltersProps) {
    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                    placeholder="Search simulations..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
            </div>

            {/* Field Filter Pills */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onFieldChange("all")}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedField === "all"
                        ? "border-purple-500 bg-purple-500/20 text-purple-200 shadow-[0_0_10px_-4px_rgba(168,85,247,0.5)]"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                        }`}
                >
                    All Fields
                </button>
                {Object.entries(FIELD_CONFIG).map(([key, config]) => {
                    const Icon = config.icon
                    const isSelected = selectedField === key
                    // Map config colors to our dark theme
                    let activeClass = ""
                    if (isSelected) {
                        if (config.color.includes("emerald")) activeClass = "border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-[0_0_10px_-4px_rgba(16,185,129,0.5)]"
                        else if (config.color.includes("blue")) activeClass = "border-blue-500 bg-blue-500/20 text-blue-200 shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)]"
                        else if (config.color.includes("purple")) activeClass = "border-purple-500 bg-purple-500/20 text-purple-200 shadow-[0_0_10px_-4px_rgba(168,85,247,0.5)]"
                        else activeClass = "border-white bg-white/20 text-white"
                    }

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onFieldChange(key as TaskField)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${isSelected
                                ? activeClass
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                                }`}
                        >
                            <Icon className="h-3 w-3" />
                            {config.label}
                        </button>
                    )
                })}
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onDifficultyChange(opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${selectedDifficulty === opt.value
                            ? "border-purple-500 bg-purple-500/20 text-purple-200"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
