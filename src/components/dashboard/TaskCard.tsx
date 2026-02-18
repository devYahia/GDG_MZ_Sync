"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Clock, Zap, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    type SimulationTask,
    FIELD_CONFIG,
} from "@/lib/tasks"
import { cn } from "@/lib/utils"

interface TaskCardProps {
    task: SimulationTask
}

export function TaskCard({ task }: TaskCardProps) {
    const fieldConfig = FIELD_CONFIG[task.field]
    const FieldIcon = fieldConfig.icon

    return (
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Card className="group h-full overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 dark:bg-card/60">
                <CardContent className="flex flex-col gap-4 p-5">
                    {/* Header: Track */}
                    <div className="flex items-center justify-between">
                        <div
                            className={cn(
                                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                                fieldConfig.bg,
                                fieldConfig.color,
                                "border-current/20"
                            )}
                        >
                            <FieldIcon className="h-3 w-3" />
                            {fieldConfig.label}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>

                    {/* Level + Client Persona */}
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                        <span className="rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            L{task.level}
                        </span>
                        <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                        <span className="text-xs text-muted-foreground">
                            <span className="text-muted-foreground/80">Client: </span>
                            <span className="font-medium text-foreground">{task.clientPersona}</span>
                        </span>
                        <Badge
                            variant="secondary"
                            className="ml-auto text-[10px] border-border bg-muted/50 text-muted-foreground"
                        >
                            {task.clientMood}
                        </Badge>
                    </div>

                    {/* Footer: Duration + Tools + CTA */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {task.duration}
                            </div>
                            <div className="flex gap-1">
                                {task.tools.slice(0, 2).map((tool) => (
                                    <span
                                        key={tool}
                                        className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                    >
                                        {tool}
                                    </span>
                                ))}
                                {task.tools.length > 2 && (
                                    <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                        +{task.tools.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="h-8 gap-1 rounded-xl text-xs transition-all duration-300"
                            asChild
                        >
                            <Link href={`/project/${task.id}`} className="gap-1">
                                Start
                                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
