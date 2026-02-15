"use client"

import { Clock, Zap, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    type SimulationTask,
    FIELD_CONFIG,
    DIFFICULTY_CONFIG,
} from "@/lib/tasks"

interface TaskCardProps {
    task: SimulationTask
}

export function TaskCard({ task }: TaskCardProps) {
    const fieldConfig = FIELD_CONFIG[task.field]
    const diffConfig = DIFFICULTY_CONFIG[task.difficulty]
    const FieldIcon = fieldConfig.icon

    return (
        <Card className="group glass-card border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]">
            <CardContent className="flex flex-col gap-4 p-5">
                {/* Header: Field + Difficulty */}
                <div className="flex items-center justify-between">
                    <div
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${fieldConfig.color === "text-emerald-500" ? "border-emerald-500/20 bg-emerald-500/10" :
                            fieldConfig.color === "text-blue-500" ? "border-blue-500/20 bg-blue-500/10" :
                                fieldConfig.color === "text-purple-500" ? "border-purple-500/20 bg-purple-500/10" :
                                    "border-white/10 bg-white/5"
                            } ${fieldConfig.color}`}
                    >
                        <FieldIcon className="h-3 w-3" />
                        {fieldConfig.label}
                    </div>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full ${i < diffConfig.dots
                                    ? diffConfig.color.replace("text-", "bg-")
                                    : "bg-white/10"
                                    }`}
                            />
                        ))}
                        <span
                            className={`ml-1 text-xs ${diffConfig.color}`}
                        >
                            {diffConfig.label}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold leading-tight text-white group-hover:text-purple-200 transition-colors">
                    {task.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-white/60 line-clamp-2">
                    {task.description}
                </p>

                {/* Client Persona */}
                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs">
                        <span className="text-white/40">Client: </span>
                        <span className="font-medium text-white/80">{task.clientPersona}</span>
                    </span>
                    <Badge
                        variant="secondary"
                        className="ml-auto text-[10px] bg-white/5 text-white/70 hover:bg-white/10"
                    >
                        {task.clientMood}
                    </Badge>
                </div>

                {/* Footer: Duration + Tools + CTA */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-white/40">
                            <Clock className="h-3 w-3" />
                            {task.duration}
                        </div>
                        <div className="flex gap-1">
                            {task.tools.slice(0, 2).map((tool) => (
                                <span
                                    key={tool}
                                    className="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 text-[10px] text-white/50"
                                >
                                    {tool}
                                </span>
                            ))}
                            {task.tools.length > 2 && (
                                <span className="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                                    +{task.tools.length - 2}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="h-8 gap-1 text-xs bg-white/5 text-white border border-white/10 hover:bg-purple-500 hover:border-purple-500/50 hover:text-white transition-all duration-300"
                    >
                        Start
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
