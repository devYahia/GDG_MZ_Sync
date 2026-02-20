"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { AlertOctagon, RotateCcw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Unhandled Runtime Exception:", error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(220,40,40,0.06),transparent)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex max-w-md flex-col items-center text-center space-y-6 rounded-3xl border border-red-500/20 bg-red-500/5 p-10 backdrop-blur-xl shadow-2xl shadow-red-500/10"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30">
                    <AlertOctagon className="h-8 w-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-red-400">System Malfunction</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                        A critical error occurred while attempting to process this request.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => reset()}
                        className="group inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
                    >
                        <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-90" />
                        Retry execution
                    </button>
                    <Link
                        href="/dashboard"
                        className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                        Return Home
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
