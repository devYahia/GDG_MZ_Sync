"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles, Zap, BarChart3, User, Users, AlertCircle, Coins } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import type { SimulationTask } from "@/lib/tasks"
import { generateSimulation, type SimulationData, postProjectChat, type ChatMessage, postChatAnalysis, type ChatAnalysisResponse } from "@/lib/api"
import { ProjectSidebar, type SidebarItem } from "./ProjectSidebar"
import { ProjectDescription } from "./ProjectDescription"
import { ProjectChat } from "./ProjectChat"
import { ProjectReport } from "./ProjectReport"
import { ProjectWorkspaceProvider } from "./ProjectWorkspaceContext"
import { ProjectIDE } from "./ProjectIDE"
import { ProjectPresence } from "./ProjectPresence"
import { checkAndDeductCredits } from "@/app/actions/credits"

import { ProjectMilestones } from "./ProjectMilestones"
import { ProjectResources } from "./ProjectResources"
import { ProjectKanban } from "./ProjectKanban"
import { ProjectQuiz } from "./ProjectQuiz"

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
    const [isLoading, setIsLoading] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [teamMode, setTeamMode] = useState<"solo" | "group">("group")
    const [error, setError] = useState<string | null>(null)
    const [creditError, setCreditError] = useState<string | null>(null)
    const [isCheckingCredits, setIsCheckingCredits] = useState(false)
    const [activeId, setActiveId] = useState("description")
    // Separate chat thread per persona (e.g. messagesByPersona["persona-0"])
    const [messagesByPersona, setMessagesByPersona] = useState<Record<string, ChatMessage[]>>({})
    const [analysis, setAnalysis] = useState<ChatAnalysisResponse | null>(null)
    const [analysisLoading, setAnalysisLoading] = useState(false)
    const [completedMilestones, setCompletedMilestones] = useState<number[]>([])

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
                team_mode: teamMode,
            })

            setSimulation(response.simulation_data)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to generate simulation"
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }, [task, teamMode])

    const handleAnalyze = async () => {
        if (!simulation) return
        setAnalysisLoading(true)
        try {
            // Aggregate all messages from all personas for a holistic analysis
            const allMessages: ChatMessage[] = []
            Object.values(messagesByPersona).forEach(msgs => allMessages.push(...msgs))

            // If no messages, maybe add a system message saying "No interaction yet"
            if (allMessages.length === 0) {
                // For demo purposes, we might want to allow it or just show error
            }

            const res = await postChatAnalysis({
                messages: allMessages,
                project_title: task.title,
                project_description: task.description,
                client_persona: task.clientPersona,
            })
            setAnalysis(res)
        } catch (e) {
            console.error(e)
        } finally {
            setAnalysisLoading(false)
        }
    }

    const handleMilestoneToggle = async (index: number) => {
        if (!simulation || completedMilestones.includes(index)) return
        setCompletedMilestones(prev => [...prev, index])

        // Trigger chat interaction
        const milestone = simulation.milestones[index]
        const title = typeof milestone === 'string' ? milestone : milestone.title

        // Find responder: First team member (Peer) or Client
        const hasTeam = (simulation.team?.length ?? 0) > 0
        const responderId = hasTeam ? "team-0" : "persona-0"
        const responder = hasTeam ? simulation.team[0] : simulation.personas[0]

        // Switch to chat view for that persona
        setActiveId(responderId)

        const userText = `I've completed the milestone: "${title}". Ready for review!`
        const thread = messagesByPersona[responderId] ?? []
        setMessagesByPersona(prev => ({ ...prev, [responderId]: [...thread, { role: "user", content: userText }] }))

        try {
            const res = await postProjectChat({
                project_id: task.id,
                project_title: task.title,
                project_description: task.description,
                client_persona: responder.name,
                client_mood: task.clientMood,
                messages: [...thread, { role: "user", content: userText }],
                language: "en",
                level: task.level ?? 1,
                // Add context that this is a milestone completion
                code_context: `[System: The user has marked milestone "${title}" as complete. Review their work or congratulate them.]`,
                persona: {
                    name: responder.name,
                    role: responder.role,
                    personality: responder.personality,
                    system_prompt: responder.system_prompt,
                    initial_message: responder.initial_message,
                },
                simulation_context: { ...simulation } as any // Type casting for ease, assuming it matches mostly
            })
            setMessagesByPersona(prev => ({
                ...prev,
                [responderId]: [...(prev[responderId] ?? []), { role: "assistant", content: res.reply }]
            }))
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (hasStarted && !simulation && !isLoading) {
            generate()
        }
    }, [hasStarted, simulation, isLoading, generate])

    // ── Configuration Screen ──
    if (!hasStarted) {
        return (
            <div className="flex flex-1 items-center justify-center bg-black p-8">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-white">Project Setup</h1>
                        <p className="text-white/60">Choose how you want to tackle "{task.title}"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setTeamMode("solo")}
                            className={`p-6 rounded-2xl border text-left transition-all ${teamMode === "solo" ? "bg-purple-500/20 border-purple-500" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                        >
                            <div className="mb-4 inline-flex items-center justify-center p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                <User className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Solo Developer</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Just you and the client. Focus on pure coding and requirements gathering without team distractions.
                            </p>
                        </button>

                        <button
                            onClick={() => setTeamMode("group")}
                            className={`p-6 rounded-2xl border text-left transition-all ${teamMode === "group" ? "bg-purple-500/20 border-purple-500" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                        >
                            <div className="mb-4 inline-flex items-center justify-center p-3 rounded-xl bg-orange-500/20 text-orange-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Cross-Functional Team</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Work alongside AI peers (QA, Senior Dev, Designer). Experience team dynamics, code reviews, and collaboration.
                            </p>
                        </button>
                    </div>

                    {creditError && (
                        <div className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                            <AlertCircle className="mx-auto mb-2 h-5 w-5 text-red-400" />
                            <p className="text-sm text-red-300">{creditError}</p>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-3 pt-4">
                        <button
                            onClick={async () => {
                                setCreditError(null)
                                setIsCheckingCredits(true)
                                try {
                                    const result = await checkAndDeductCredits()
                                    if (result.error) {
                                        setCreditError(result.error)
                                        return
                                    }
                                    setHasStarted(true)
                                    setIsLoading(true)
                                } catch {
                                    setCreditError("Something went wrong. Please try again.")
                                } finally {
                                    setIsCheckingCredits(false)
                                }
                            }}
                            disabled={isCheckingCredits}
                            className="px-8 py-3 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCheckingCredits ? "Checking credits..." : "Start Simulation"}
                        </button>
                        <span className="flex items-center gap-1.5 text-xs text-white/30">
                            <Coins className="h-3 w-3" /> Costs 3 credits per simulation
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // ── Loading Screen ──
    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-background">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_70%)]" />
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
                        <h2 className="text-xl font-bold text-foreground">
                            Generating Your Simulation
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
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

                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2">
                        <Zap className={`h-4 w-4 ${getLevelColor(task.level)}`} />
                        <span className="text-xs text-muted-foreground">
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
            <div className="flex flex-1 items-center justify-center bg-background">
                <div className="text-center space-y-4 max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Generation Failed</h2>
                    <p className="text-sm text-muted-foreground">{error}</p>
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
    // ── Success: Build sidebar groups ──
    const sidebarGroups = [
        {
            title: "Project Info",
            items: [
                {
                    id: "description",
                    label: "Overview",
                    type: "description" as const,
                },
                {
                    id: "roadmap",
                    label: "Roadmap",
                    type: "description" as const, // Reusing icon for now or I can add a new type
                },
                {
                    id: "kanban",
                    label: "Kanban Board",
                    type: "description" as const,
                },
                {
                    id: "resources",
                    label: "Resources",
                    type: "description" as const,
                },
                {
                    id: "quiz",
                    label: "Skill Quiz",
                    type: "description" as const,
                }
            ]
        },
        {
            title: "Client",
            items: (simulation?.personas ?? []).map((persona, i) => ({
                id: `persona-${i}`,
                label: `${persona.name} (${persona.role})`,
                type: "persona" as const,
            }))
        },
        {
            title: "Team (AI Peers)",
            items: (simulation?.team ?? []).map((member, i) => ({
                id: `team-${i}`,
                label: `${member.name} (${member.role})`,
                type: "persona" as const,
            }))
        },
        {
            title: "Analysis",
            items: [
                {
                    id: "report",
                    label: "Performance Report",
                    type: "report" as const,
                }
            ]
        }
    ].filter(g => g.items.length > 0)

    return (
        <ProjectWorkspaceProvider initialCode="// Implement your solution here.\n// Push to GitHub from the toolbar when ready.\n">
            <div className="flex flex-1 min-h-0">
                {/* Left: Sidebar Navigation */}
                <div className="flex w-[240px] shrink-0 min-w-0 flex-col">
                    <ProjectSidebar
                        groups={sidebarGroups}
                        activeId={activeId}
                        onSelect={setActiveId}
                    />
                </div>

                {/* Middle: Content Area — Description or separate chat per persona */}
                <div className="flex flex-1 min-w-0 flex-col border-r border-white/10 bg-black/40 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeId === "report" ? (
                            <motion.div
                                key="report"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                {analysis ? (
                                    <ProjectReport analysis={analysis} />
                                ) : (
                                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-6">
                                        <div className="rounded-full bg-white/5 p-4">
                                            <BarChart3 className="h-8 w-8 text-white/40" />
                                        </div>
                                        <div className="space-y-2 max-w-md">
                                            <h3 className="text-xl font-bold text-white">Generate Performance Report</h3>
                                            <p className="text-sm text-white/50">
                                                Analyze your conversation history to get AI-driven insights on your soft skills and technical proficiency.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={analysisLoading}
                                            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 font-medium text-white transition-all hover:bg-purple-500 disabled:opacity-50"
                                        >
                                            {analysisLoading ? (
                                                <>
                                                    <Sparkles className="h-4 w-4 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="h-4 w-4" />
                                                    Generate Analysis
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeId === "description" && simulation ? (
                            <motion.div
                                key="description"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full overflow-y-auto"
                            >
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
                            </motion.div>

                        ) : activeId === "roadmap" && simulation ? (
                            <motion.div
                                key="roadmap"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full overflow-y-auto"
                            >
                                <ProjectMilestones
                                    milestones={simulation.milestones}
                                    completedIndices={completedMilestones}
                                    onToggle={handleMilestoneToggle}
                                />
                            </motion.div>
                        ) : activeId === "kanban" && simulation ? (
                            <motion.div
                                key="kanban"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <ProjectKanban
                                    milestones={simulation.milestones}
                                    completedIndices={completedMilestones}
                                    onToggle={handleMilestoneToggle}
                                />
                            </motion.div>
                        ) : activeId === "resources" && simulation ? (
                            <motion.div
                                key="resources"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <ProjectResources resources={simulation.resources} />
                            </motion.div>
                        ) : activeId === "quiz" && simulation ? (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <ProjectQuiz quiz={simulation.quiz} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col"
                            >
                                <ProjectChat
                                    task={task}
                                    personaId={(activeId.startsWith("persona-") || activeId.startsWith("team-")) ? activeId : undefined}
                                    persona={
                                        (activeId.startsWith("persona-") && simulation) ? simulation.personas[parseInt(activeId.replace("persona-", ""), 10)] :
                                            (activeId.startsWith("team-") && simulation) ? (simulation.team?.[parseInt(activeId.replace("team-", ""), 10)]) :
                                                undefined
                                    }
                                    simulation={simulation ?? undefined}
                                    messages={(activeId.startsWith("persona-") || activeId.startsWith("team-")) ? (messagesByPersona[activeId] ?? []) : undefined}
                                    onSendMessage={(activeId.startsWith("persona-") || activeId.startsWith("team-")) && simulation
                                        ? async (text, codeContext) => {
                                            const userMsg: ChatMessage = { role: "user", content: text }
                                            const thread = messagesByPersona[activeId] ?? []
                                            setMessagesByPersona((prev) => ({ ...prev, [activeId]: [...thread, userMsg] }))
                                            try {
                                                const isTeam = activeId.startsWith("team-")
                                                const index = parseInt(activeId.split("-")[1], 10)
                                                // Handle potential missing team array or index out of bounds
                                                const persona = isTeam ? (simulation.team?.[index]) : simulation.personas[index]

                                                if (!persona) throw new Error("Persona not found")

                                                const res = await postProjectChat({
                                                    project_id: task.id,
                                                    project_title: task.title,
                                                    project_description: task.description,
                                                    client_persona: persona.name,
                                                    client_mood: task.clientMood, // Mood might differ for peers, but keeping simple for now
                                                    messages: [...thread, userMsg],
                                                    language: "en",
                                                    level: task.level ?? 1,
                                                    code_context: codeContext?.trim() || undefined,
                                                    persona: {
                                                        name: persona.name,
                                                        role: persona.role,
                                                        personality: persona.personality,
                                                        system_prompt: persona.system_prompt,
                                                        initial_message: persona.initial_message,
                                                    },
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: VS Code-style sandbox (Monaco editor + AI review + Push to GitHub) */}
                <div className="flex w-[40%] min-w-0 flex-col">
                    <ProjectPresence projectId={task.id} />
                    <ProjectIDE task={task} />
                </div>
            </div>
        </ProjectWorkspaceProvider >
    )
}
