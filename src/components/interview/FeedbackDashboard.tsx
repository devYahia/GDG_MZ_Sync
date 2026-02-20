"use client"

import { motion } from "framer-motion"
import { CheckCircle2, ChevronRight, BarChart3, ArrowLeft, TerminalSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface FeedbackDashboardProps {
    score: number
    reportMarkdown: string
}

export function FeedbackDashboard({ score, reportMarkdown }: FeedbackDashboardProps) {
    const router = useRouter()

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"
        if (score >= 70) return "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        return "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0A0A0A] overflow-y-auto px-4 py-12 text-slate-300 font-sans selection:bg-cyan-500/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-4xl space-y-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <TerminalSquare className="h-8 w-8 text-cyan-500" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Interview Concluded</h1>
                            <p className="text-sm text-slate-400">Senior Engineering Assessment</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="bg-[#161618] text-slate-300 border-white/10 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
                    </Button>
                </div>

                {/* Score Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="col-span-1 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#121215] p-8 shadow-2xl relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 blur-[50px] rounded-full point-events-none" />

                        <span className="text-sm font-medium tracking-wide text-slate-400 uppercase mb-4 z-10">Overall Score</span>
                        <div className={`text-7xl font-bold tracking-tighter z-10 flex items-baseline gap-1 ${getScoreColor(score)}`}>
                            {score}
                            <span className="text-2xl text-slate-500 font-normal">/100</span>
                        </div>
                        {score >= 85 && (
                            <div className="mt-6 flex items-center text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 z-10">
                                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Strong Performance
                            </div>
                        )}
                    </motion.div>

                    {/* Report Content */}
                    <div className="col-span-1 md:col-span-2 rounded-2xl border border-white/10 bg-[#121215] p-8 shadow-2xl">
                        <div className="flex items-center gap-2 text-lg font-semibold text-white mb-6 border-b border-white/5 pb-4">
                            <BarChart3 className="h-5 w-5 text-purple-400" />
                            Detailed Assessment
                        </div>

                        {/* Render Markdown realistically - in a real app, use react-markdown here */}
                        <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-slate-200 prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-cyan-400">
                            {/* Simulated markdown rendering fallback for scaffolding */}
                            {reportMarkdown ? (
                                <div className="space-y-4 whitespace-pre-wrap font-sans leading-relaxed text-sm">
                                    {reportMarkdown}
                                </div>
                            ) : (
                                <div className="animate-pulse flex flex-col gap-4">
                                    <div className="h-4 w-3/4 rounded bg-white/5" />
                                    <div className="h-4 w-full rounded bg-white/5" />
                                    <div className="h-4 w-5/6 rounded bg-white/5" />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={() => router.push("/dashboard/progress")}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all"
                            >
                                View Learning Path <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
