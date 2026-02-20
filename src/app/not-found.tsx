"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,40,200,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,40,200,0.15),transparent)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex max-w-md flex-col items-center text-center space-y-6 rounded-3xl border border-white/10 bg-black/40 p-10 backdrop-blur-xl shadow-2xl shadow-primary/10"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
                    <h2 className="text-lg font-semibold text-muted-foreground">Resource Locked or Not Found</h2>
                    <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
                        The instance you're looking for doesn't exist or you lack clearance to view its parameters.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Return to Command Center
                </Link>
            </motion.div>
        </div>
    )
}
