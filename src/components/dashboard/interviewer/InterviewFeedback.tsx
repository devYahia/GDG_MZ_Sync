"use client"

import { motion } from "motion/react"
import { RefreshCcw, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

interface InterviewFeedbackProps {
    report: string | null
    processing: boolean
    onRestart: () => void
}

export function InterviewFeedback({ report, processing, onRestart }: InterviewFeedbackProps) {
    return (
        <motion.div
            className="flex h-full w-full flex-col items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="w-full max-w-3xl space-y-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Interview Complete</h2>
                    <p className="text-muted-foreground">Here is your performance analysis.</p>
                </div>

                <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
                    {processing ? (
                        <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-sm font-medium animate-pulse">Generating comprehensive report...</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px] w-full p-6">
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
