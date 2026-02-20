"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, Download, Loader2, CheckCircle2, AlertTriangle, XCircle, FileCode, Zap, Search, Terminal, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getBackendBase } from "@/lib/api-config"
import { logActivity, saveSkillScores } from "@/app/(dashboard)/actions"

const API_BASE = getBackendBase()

interface StepEvent {
    type: "step" | "file" | "execute" | "lint" | "error" | "done" | "report"
    message: string
    data?: string
}

const STEP_CONFIG = {
    step: { icon: Zap, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    file: { icon: FileCode, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
    execute: { icon: Terminal, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
    lint: { icon: Search, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
    error: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
    done: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    report: { icon: FileText, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
}

export default function CodeReviewPage() {
    const [repoUrl, setRepoUrl] = useState("")
    const [isReviewing, setIsReviewing] = useState(false)
    const [steps, setSteps] = useState<StepEvent[]>([])
    const [report, setReport] = useState("")
    const [showReport, setShowReport] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)
    const stepsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        stepsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [steps])

    const startReview = async () => {
        if (!repoUrl.startsWith("http")) {
            alert("Please enter a valid GitHub URL starting with https://")
            return
        }

        // Reset state
        setSteps([])
        setReport("")
        setShowReport(false)
        setIsReviewing(true)

        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        try {
            // 1. POST /api/repo/review → get job_id
            const res = await fetch(`${API_BASE}/api/repo/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_url: repoUrl }),
            })

            if (!res.ok) {
                const err = await res.json()
                setSteps([{ type: "error", message: err.detail || "Failed to start review" }])
                setIsReviewing(false)
                return
            }

            const { job_id, stream_url } = await res.json()
            setSteps([{ type: "step", message: `🚀 Review started (job: ${job_id.slice(0, 8)}…)` }])

            // 2. GET /review/{job_id} → SSE stream
            const eventSource = new EventSource(`${API_BASE}${stream_url}`)
            eventSourceRef.current = eventSource

            const STREAM_EVENTS: StepEvent["type"][] = ["step", "file", "execute", "lint", "error", "done", "report"]

            STREAM_EVENTS.forEach((eventType) => {
                eventSource.addEventListener(eventType, (e) => {
                    const payload = JSON.parse(e.data)

                    if (eventType === "report") {
                        setSteps((prev) => [...prev, { type: "report", message: "📋 Report generated" }])
                        setReport(payload.data)
                        setShowReport(true)
                    } else if (eventType === "done") {
                        setSteps((prev) => [...prev, { type: "done", message: payload.message || "Review complete" }])
                        setIsReviewing(false)
                        eventSource.close()
                        // T038-T040: Log activity + save skill scores from review
                        logActivity("code_review_completed", "code_review", undefined, { repoUrl }).catch(() => { })
                        saveSkillScores({
                            sourceType: "code_review",
                            communication: 50,
                            codeQuality: 75,
                            requirementsGathering: 50,
                            technicalDepth: 70,
                            problemSolving: 65,
                            professionalism: 60,
                            overallScore: 70,
                        }).catch(() => { })
                    } else if (eventType === "error") {
                        setSteps((prev) => [...prev, { type: "error", message: payload.message || "An error occurred" }])
                        setIsReviewing(false)
                        eventSource.close()
                    } else {
                        setSteps((prev) => [...prev, { type: eventType, message: payload.message }])
                    }
                })
            })

            eventSource.onerror = () => {
                setSteps((prev) => [...prev, { type: "error", message: "Connection lost" }])
                setIsReviewing(false)
                eventSource.close()
            }
        } catch (err) {
            setSteps([{ type: "error", message: `Network error: ${err instanceof Error ? err.message : "Unknown error"}` }])
            setIsReviewing(false)
        }
    }

    const downloadReport = () => {
        const blob = new Blob([report], { type: "text/markdown" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = "code_review_report.md"
        a.click()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isReviewing) {
            startReview()
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
            {/* Animated background gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-5xl font-bold text-foreground">
                            Code Review Agent
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Paste a GitHub repo URL — the agent will clone, execute, lint, and review every file
                    </p>
                </motion.header>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6 shadow-2xl">
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="https://github.com/owner/repo"
                                disabled={isReviewing}
                                className="flex-1 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-primary h-12 text-base"
                            />
                            <Button
                                onClick={startReview}
                                disabled={isReviewing || !repoUrl}
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 shadow-lg"
                            >
                                {isReviewing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-5 w-5" />
                                        Run Review
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => {
                                    // Extract full job ID from steps
                                    const jobStep = steps.find(s => s.message.includes("Review started"))
                                    const match = jobStep?.message.match(/\(job: (.*?)\…\)/)
                                    const jobId = match ? match[1] : null

                                    if (jobId) {
                                        window.open(`/sandbox?job=${jobId}`, '_blank')
                                    } else {
                                        alert("Please wait for the review to start and generate a job ID")
                                    }
                                }}
                                size="lg"
                                variant="outline"
                                className="border-border hover:bg-accent text-muted-foreground font-semibold px-8 h-12"
                                disabled={!repoUrl || isReviewing}
                            >
                                <Terminal className="mr-2 h-5 w-5" />
                                {report ? "Open Sandbox Results" : "Open Sandbox"}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Section */}
                <AnimatePresence>
                    {steps.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6 pl-2">
                                    Live Timeline
                                </h2>
                                <div className="max-h-96 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                    {/* Timeline container */}
                                    <div className="relative pl-6 border-l-2 border-border ml-3 space-y-6">
                                        <AnimatePresence mode="popLayout">
                                            {steps.map((step, index) => {
                                                const config = STEP_CONFIG[step.type]
                                                const Icon = config.icon
                                                return (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="relative"
                                                    >
                                                        {/* Timeline Dot/Icon */}
                                                        <div className={`absolute -left-[33px] p-1.5 rounded-full border-2 border-background ${config.bg} ${config.color} shadow-sm z-10`}>
                                                            <Icon className="h-3 w-3" />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-medium text-foreground leading-none">
                                                                {step.message}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                {step.type}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </AnimatePresence>

                                        {isReviewing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="relative"
                                            >
                                                <div className="absolute -left-[33px] p-1.5 rounded-full border-2 border-background bg-muted text-muted-foreground z-10">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                </div>
                                                <span className="text-sm text-muted-foreground italic ml-1">Processing...</span>
                                            </motion.div>
                                        )}
                                        <div ref={stepsEndRef} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Report Section */}
                <AnimatePresence>
                    {showReport && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Code Review Report
                                    </h2>
                                    <Button
                                        onClick={downloadReport}
                                        variant="outline"
                                        size="sm"
                                        className="border-white/20 hover:bg-white/10"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download .md
                                    </Button>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-8 prose prose-base prose-slate dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ children }) => <h1 className="text-3xl font-bold text-primary mb-4">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-2xl font-semibold text-foreground mt-8 mb-3 pb-2 border-b border-border">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-xl font-medium text-foreground/90 mt-6 mb-2">{children}</h3>,
                                            p: ({ children }) => <p className="text-muted-foreground mb-3 leading-relaxed">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-3">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside text-muted-foreground space-y-1 mb-3">{children}</ol>,
                                            code: ({ children }) => <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                                            strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                                            hr: () => <hr className="border-border my-6" />,
                                        }}
                                    >
                                        {report
                                            .replace(/\[PASS\]/g, '<span class="inline-block bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">PASS</span>')
                                            .replace(/\[WARN\]/g, '<span class="inline-block bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold">WARN</span>')
                                            .replace(/\[FAIL\]/g, '<span class="inline-block bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-bold">FAIL</span>')
                                        }
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
