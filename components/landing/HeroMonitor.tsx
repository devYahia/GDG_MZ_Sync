"use client"

import { motion } from "framer-motion"
import { Terminal, Cpu, Activity, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"

export function HeroMonitor() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 1))
        }, 50)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full aspect-video md:aspect-[16/10] max-w-2xl mx-auto perspective-1000"
        >
            {/* 3D Monitor/Screen Frame */}
            <div className={cn(
                "relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl",
                "shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]",
                "after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] after:pointer-events-none"
            )}>

                {/* Window Header */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 z-20">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="flex-1 text-center text-[10px] font-mono text-white/30 tracking-widest uppercase">
                        interna-build-v2.0.exe
                    </div>
                </div>

                {/* Content Area - Unicorn Scene + Overlay */}
                <div className="relative w-full h-full pt-8 bg-black/90">
                    {/* Unicorn Scene as Background/Content */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-purple-900/10 to-black opacity-50" />

                    {/* Code/Progress Overlay - "Simulate Progress" */}
                    <div className="absolute inset-0 z-10 p-6 font-mono text-sm text-green-400/80 overflow-hidden pointer-events-none">
                        <div className="flex flex-col gap-2 h-full justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-white/60">
                                    <Terminal className="w-4 h-4" />
                                    <span>User@Interna-Dev:~/project</span>
                                </div>
                                <div className="h-px w-full bg-white/5 my-2" />
                                <div className="opacity-80">
                                    <p>{`> initializing neural_network... [OK]`}</p>
                                    <p>{`> loading data_structures... [OK]`}</p>
                                    <p>{`> optimizing runtime performance...`}</p>
                                </div>
                            </div>

                            {/* Progress Indicators */}
                            <div className="space-y-4 bg-black/60 p-4 rounded-lg border border-white/5 backdrop-blur-sm w-fit max-w-full">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-white/50">{progress}%</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <Cpu className="w-3 h-3" />
                                    <span>System Load: Optimized</span>
                                    <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reflection/Glow under monitor */}
            <div className="absolute -bottom-10 left-10 right-10 h-10 bg-purple-500/20 blur-3xl opacity-50 rounded-full" />
        </motion.div>
    )
}
