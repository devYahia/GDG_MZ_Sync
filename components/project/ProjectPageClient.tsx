"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles, Zap } from "lucide-react"
import type { SimulationTask } from "@/lib/tasks"
import { generateSimulation, type SimulationData, postProjectChat, type ChatMessage } from "@/lib/api"
import { ProjectSidebar, type SidebarItem } from "./ProjectSidebar"
import { ProjectDescription } from "./ProjectDescription"
import { ProjectChat } from "./ProjectChat"
import { ProjectWorkspaceProvider } from "./ProjectWorkspaceContext"
import { ProjectIDE } from "./ProjectIDE"
import { ProjectPresence } from "./ProjectPresence"

interface ProjectPageClientProps {
    task: SimulationTask
}

function getLevelColor(n: number): string {
    if (n <= 2) return "text-emerald-400"
    if (n <= 5) return "text-amber-400"
    if (n <= 7) return "text-orange-400"
    return "text-red-400"
}

export function ProjectPageClient({ task }: ProjectPageClientProps) {
    const [simulation, setSimulation] = useState<SimulationData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeId, setActiveId] = useState("description")
    // Separate chat thread per persona (e.g. messagesByPersona["persona-0"])
    const [messagesByPersona, setMessagesByPersona] = useState<Record<string, ChatMessage[]>>({})

    const generate = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const levelKey = `L${task.level}`
            const context = [
                task.description,
                `Field: ${task.field}`,
                `Tools: ${task.tools.join(", ")}`,
                `Duration: ${task.duration}`,
                `Client Persona: ${task.clientPersona} (${task.clientMood})`,
            ].join("\n")

            const response = await generateSimulation({
                title: task.title,
                context,
                level: levelKey,
            })

            setSimulation(response.simulation_data)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to generate simulation"
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }, [task])

    useEffect(() => {
        generate()
    }, [generate])

    // ── Loading Screen ──
    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-black">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_70%)]" />
                </div>

                <div className="relative text-center space-y-8">
                    <div className="relative mx-auto h-24 w-24">
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">
                            Generating Your Simulation
                        </h2>
                        <p className="text-sm text-white/50 max-w-sm mx-auto">
                            Our AI is crafting &quot;{task.title}&quot; with custom personas, milestones, and requirements...
                        </p>
                    </div>

                    <div className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                        <Zap className={`h-4 w-4 ${getLevelColor(task.level)}`} />
                        <span className="text-xs text-white/60">
                            Level L{task.level} • {task.field}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center bg-black">
                <div className="text-center space-y-4 max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Generation Failed</h2>
                    <p className="text-sm text-white/50">{error}</p>
                    <button
                        onClick={generate}
                        className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // ── Success: Build sidebar items from generated personas ──
    const sidebarItems: SidebarItem[] = [
        {
            id: "description",
            label: "Project Description",
            type: "description" as const,
        },
        // Add generated personas
        ...(simulation?.personas ?? []).map((persona, i) => ({
            id: `persona-${i}`,
            label: `${persona.name} (${persona.role})`,
            type: "persona" as const,
        })),
    ]

    return (
        <ProjectWorkspaceProvider initialCode="// Implement your solution here.\n// Push to GitHub from the toolbar when ready.\n">
        <div className="flex flex-1 min-h-0">
            {/* Left: Sidebar Navigation */}
            <div className="flex w-[240px] shrink-0 min-w-0 flex-col">
                <ProjectSidebar
                    items={sidebarItems}
                    activeId={activeId}
                    onSelect={setActiveId}
                />
            </div>

            {/* Middle: Content Area — Description or separate chat per persona */}
            <div className="flex flex-1 min-w-0 flex-col border-r border-white/10">
                {activeId === "description" && simulation ? (
                    <ProjectDescription
                        title={simulation.title}
                        overview={simulation.overview}
                        domain={simulation.domain}
                        difficulty={simulation.difficulty}
                        estimatedDuration={simulation.estimated_duration}
                        techStack={simulation.tech_stack}
                        learningObjectives={simulation.learning_objectives}
                        functionalRequirements={simulation.functional_requirements}
                        nonFunctionalRequirements={simulation.non_functional_requirements}
                        milestones={simulation.milestones}
                    />
                ) : (
                    <ProjectChat
                        task={task}
                        personaId={activeId.startsWith("persona-") ? activeId : undefined}
                        persona={activeId.startsWith("persona-") && simulation
                            ? simulation.personas[parseInt(activeId.replace("persona-", ""), 10)]
                            : undefined}
                        simulation={simulation ?? undefined}
                        messages={activeId.startsWith("persona-") ? (messagesByPersona[activeId] ?? []) : undefined}
                        onSendMessage={activeId.startsWith("persona-") && simulation
                            ? async (text, codeContext) => {
                                const userMsg: ChatMessage = { role: "user", content: text }
                                const thread = messagesByPersona[activeId] ?? []
                                setMessagesByPersona((prev) => ({ ...prev, [activeId]: [...thread, userMsg] }))
                                try {
                                    const persona = simulation.personas[parseInt(activeId.replace("persona-", ""), 10)]
                                    const res = await postProjectChat({
                                        project_id: task.id,
                                        project_title: task.title,
                                        project_description: task.description,
                                        client_persona: persona?.name ?? task.clientPersona,
                                        client_mood: task.clientMood,
                                        messages: [...thread, userMsg],
                                        language: "en",
                                        level: task.level ?? 1,
                                        code_context: codeContext?.trim() || undefined,
                                        persona: persona ? {
                                            name: persona.name,
                                            role: persona.role,
                                            personality: persona.personality,
                                            system_prompt: persona.system_prompt,
                                            initial_message: persona.initial_message,
                                        } : undefined,
                                        simulation_context: {
                                            overview: simulation.overview,
                                            learning_objectives: simulation.learning_objectives,
                                            functional_requirements: simulation.functional_requirements,
                                            non_functional_requirements: simulation.non_functional_requirements,
                                            milestones: simulation.milestones,
                                            domain: simulation.domain,
                                            difficulty: simulation.difficulty,
                                            tech_stack: simulation.tech_stack,
                                        },
                                    })
                                    setMessagesByPersona((prev) => ({
                                        ...prev,
                                        [activeId]: [...(prev[activeId] ?? []), { role: "assistant", content: res.reply }],
                                    }))
                                } catch (e) {
                                    const err = e instanceof Error ? e.message : "Something went wrong"
                                    setMessagesByPersona((prev) => ({
                                        ...prev,
                                        [activeId]: [...(prev[activeId] ?? []), { role: "assistant", content: `[Error: ${err}]` }],
                                    }))
                                }
                            }
                            : undefined}
                    />
                )}
            </div>

            {/* Right: VS Code-style sandbox (Monaco editor + AI review + Push to GitHub) */}
            <div className="flex w-[40%] min-w-0 flex-col">
                <ProjectPresence projectId={task.id} />
                <ProjectIDE task={task} />
            </div>
        </div>
        </ProjectWorkspaceProvider>
    )
}
