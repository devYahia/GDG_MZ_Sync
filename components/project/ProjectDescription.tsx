"use client"

import { BookOpen, Target, Layers, CheckCircle, Clock, Wrench } from "lucide-react"

interface ProjectDescriptionProps {
    title: string
    overview: string
    domain?: string
    difficulty?: string
    estimatedDuration?: string
    techStack?: string[]
    learningObjectives?: string[]
    functionalRequirements?: string[]
    nonFunctionalRequirements?: string[]
    milestones?: {
        title: string
        description: string
        deliverables: string[]
    }[]
}

export function ProjectDescription({
    title,
    overview,
    domain,
    difficulty,
    estimatedDuration,
    techStack,
    learningObjectives,
    functionalRequirements,
    nonFunctionalRequirements,
    milestones,
}: ProjectDescriptionProps) {
    return (
        <div className="flex h-full flex-col bg-muted/10">
            {/* Header */}
            <div className="shrink-0 border-b border-border px-6 py-3">
                <span className="text-sm font-medium text-muted-foreground">Project Description</span>
            </div>

            {/* Scrollable Content — Google Docs-like */}
            <div className="flex-1 overflow-y-auto text-foreground">
                <div className="mx-auto max-w-3xl px-8 py-8 space-y-8">
                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {domain && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                    <Layers className="h-3 w-3" />
                                    {domain}
                                </span>
                            )}
                            {difficulty && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    {difficulty}
                                </span>
                            )}
                            {estimatedDuration && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {estimatedDuration}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Overview */}
                    <section>
                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground/90">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Overview
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{overview}</p>
                    </section>

                    {/* Tech Stack */}
                    {techStack && techStack.length > 0 && (
                        <section>
                            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground/90">
                                <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                Tech Stack
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {techStack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Learning Objectives */}
                    {learningObjectives && learningObjectives.length > 0 && (
                        <section>
                            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground/90">
                                <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                Learning Objectives
                            </h2>
                            <ul className="space-y-2">
                                {learningObjectives.map((obj, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/60" />
                                        {obj}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Functional Requirements */}
                    {functionalRequirements && functionalRequirements.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-lg font-semibold text-foreground/90">Functional Requirements</h2>
                            <ul className="space-y-2">
                                {functionalRequirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Non-Functional Requirements */}
                    {nonFunctionalRequirements && nonFunctionalRequirements.length > 0 && (
                        <section>
                            <h2 className="mb-3 text-lg font-semibold text-foreground/90">Non-Functional Requirements</h2>
                            <ul className="space-y-2">
                                {nonFunctionalRequirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Milestones */}
                    {milestones && milestones.length > 0 && (
                        <section>
                            <h2 className="mb-4 text-lg font-semibold text-foreground/90">Milestones</h2>
                            <div className="space-y-4">
                                {milestones.map((ms, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-border bg-card p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                                {i + 1}
                                            </span>
                                            <h3 className="text-sm font-semibold text-foreground/90">{ms.title}</h3>
                                        </div>
                                        <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{ms.description}</p>
                                        <ul className="space-y-1">
                                            {ms.deliverables.map((d, j) => (
                                                <li
                                                    key={j}
                                                    className="flex items-center gap-2 text-xs text-muted-foreground/80"
                                                >
                                                    <span className="h-1 w-1 rounded-full bg-emerald-500/60" />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
