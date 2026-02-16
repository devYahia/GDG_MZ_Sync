"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Play, Download, Loader2, CheckCircle2, AlertTriangle, XCircle, FileCode, Zap, Search, Terminal, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_BASE = "http://localhost:8000"

interface StepEvent {
    type: "step" | "file" | "execute" | "lint" | "error" | "done" | "report"
    message: string
    data?: string
}

const STEP_CONFIG = {
    step: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
    file: { icon: FileCode, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    execute: { icon: Terminal, color: "text-green-400", bg: "bg-green-500/10" },
    lint: { icon: Search, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    report: { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
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
            // 1. POST /review → get job_id
            const res = await fetch(`${API_BASE}/review`, {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
            {/* Animated background gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-purple-900/20 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                            <Zap className="h-8 w-8 text-blue-400" />
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Code Review Agent
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
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
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="https://github.com/owner/repo"
                                disabled={isReviewing}
                                className="flex-1 bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/30 h-12 text-base"
                            />
                            <Button
                                onClick={startReview}
                                disabled={isReviewing || !repoUrl}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 h-12 shadow-lg shadow-blue-500/25"
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
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                                    Live Progress
                                </h2>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                    <AnimatePresence>
                                        {steps.map((step, index) => {
                                            const config = STEP_CONFIG[step.type]
                                            const Icon = config.icon
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} border border-white/10`}
                                                >
                                                    <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                                                    <span className="text-sm text-gray-200 leading-relaxed">{step.message}</span>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                    {isReviewing && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                                        >
                                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                                            <span className="text-sm text-gray-400">Working...</span>
                                        </motion.div>
                                    )}
                                    <div ref={stepsEndRef} />
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
                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
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
                                <div className="bg-black/50 border border-white/10 rounded-xl p-8 prose prose-invert prose-blue max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ children }) => <h1 className="text-3xl font-bold text-blue-400 mb-4">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-2xl font-semibold text-gray-200 mt-8 mb-3 pb-2 border-b border-white/10">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-xl font-medium text-gray-300 mt-6 mb-2">{children}</h3>,
                                            p: ({ children }) => <p className="text-gray-400 mb-3 leading-relaxed">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc list-inside text-gray-400 space-y-1 mb-3">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside text-gray-400 space-y-1 mb-3">{children}</ol>,
                                            code: ({ children }) => <code className="bg-blue-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                                            strong: ({ children }) => <strong className="text-gray-200 font-semibold">{children}</strong>,
                                            hr: () => <hr className="border-white/10 my-6" />,
                                        }}
                                    >
                                        {report
                                            .replace(/\[PASS\]/g, '<span class="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-bold">PASS</span>')
                                            .replace(/\[WARN\]/g, '<span class="inline-block bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-xs font-bold">WARN</span>')
                                            .replace(/\[FAIL\]/g, '<span class="inline-block bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-xs font-bold">FAIL</span>')
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
