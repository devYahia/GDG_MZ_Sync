"use client"

import { motion } from "motion/react"
import { RefreshCcw, CheckCircle2, Trophy, TrendingUp, MessageSquare, Code, Brain, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

const SCORE_CATEGORIES = [
    { key: "Communication", icon: MessageSquare, color: "text-blue-400 bg-blue-400/20" },
    { key: "Problem Solving", icon: Brain, color: "text-purple-400 bg-purple-400/20" },
    { key: "Technical Depth", icon: Code, color: "text-emerald-400 bg-emerald-400/20" },
    { key: "Professionalism", icon: Shield, color: "text-amber-400 bg-amber-400/20" },
]

interface InterviewFeedbackProps {
    report: string | null
    processing: boolean
    onRestart: () => void
}

function extractScoreFromReport(report: string, category: string): number | null {
    // Try to find patterns like "Communication: 85/100" or "Score: 78" in the markdown
    const regex = new RegExp(`${category}[:\\s]*([\\d]+)`, "i")
    const match = report.match(regex)
    if (match) return parseInt(match[1], 10)
    return null
}

export function InterviewFeedback({ report, processing, onRestart }: InterviewFeedbackProps) {
    const scores = report
        ? SCORE_CATEGORIES.map((cat) => ({
            ...cat,
            score: extractScoreFromReport(report, cat.key),
        }))
        : []
    const hasScores = scores.some((s) => s.score !== null)

    return (
        <motion.div
            className="flex h-full w-full flex-col items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="w-full max-w-3xl space-y-6">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40"
                    >
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold">Interview Complete</h2>
                    <p className="text-muted-foreground">Here is your performance analysis.</p>
                </div>

                {/* Score Cards */}
                {hasScores && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {scores.map((cat, i) => {
                            const Icon = cat.icon
                            const score = cat.score ?? 0
                            return (
                                <motion.div
                                    key={cat.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center"
                                >
                                    <div className={cn("mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg", cat.color.split(" ")[1])}>
                                        <Icon className={cn("h-4 w-4", cat.color.split(" ")[0])} />
                                    </div>
                                    <motion.p
                                        className="text-2xl font-bold"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        {score}
                                    </motion.p>
                                    <p className="mt-1 text-xs text-muted-foreground">{cat.key}</p>
                                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            className={cn("h-full rounded-full", score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                                        />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Report Body */}
                <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
                    {processing ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center space-y-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm font-medium animate-pulse">Generating comprehensive report...</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px] w-full p-6">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{report || "No report available."}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="flex justify-center pt-4">
                    <Button onClick={onRestart} size="lg" variant="outline" className="border-white/10 hover:bg-white/5">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Start New Session
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
