"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Bot, ArrowRight, Zap, Target, BookOpen, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

const DIFFICULTIES = [
    { id: "junior", label: "Junior", color: "text-emerald-400 font-bold bg-emerald-500/10 border-emerald-500/20" },
    { id: "mid", label: "Mid-Level", color: "text-cyan-400 font-bold bg-cyan-500/10 border-cyan-500/20" },
    { id: "senior", label: "Senior", color: "text-purple-400 font-bold bg-purple-500/10 border-purple-500/20" },
]

export default function InterviewSetup() {
    const router = useRouter()
    const [role, setRole] = useState("")
    const [difficulty, setDifficulty] = useState("mid")
    const [isStarting, setIsStarting] = useState(false)

    const handleStart = () => {
        if (!role.trim()) return
        setIsStarting(true)

        // Construct the URL with query parameters
        const queryParams = new URLSearchParams({
            role: role.trim(),
            difficulty: difficulty
        }).toString()

        // Short delay for visual polish before routing
        setTimeout(() => {
            router.push(`/interview?${queryParams}`)
        }, 600)
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground selection:bg-primary/30 font-sans px-4">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <main className="relative z-10 flex flex-1 items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-lg"
                >
                    <div className="overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-2xl shadow-2xl relative">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="p-10 space-y-8 relative z-10">

                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/20 shadow-inner"
                                >
                                    <Bot className="h-8 w-8 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                                </motion.div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        Configure Session
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                        A highly technical AI Engineering Manager will conduct your interview based on these parameters.
                                    </p>
                                </div>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleStart(); }}>
                                <div className="space-y-3">
                                    <Label htmlFor="role" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 font-sans flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Target Role
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="role"
                                            placeholder="e.g. Senior Frontend Engineer, DevOps Manager..."
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            required
                                            className="h-14 font-medium text-[15px] bg-background/50 border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary px-4 rounded-xl transition-all shadow-inner group-hover:border-border/80"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 flex items-center bg-muted px-2 py-1 rounded text-[10px] font-mono border border-border">
                                            Role
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 font-sans flex items-center gap-2">
                                        <Layers className="w-3 h-3" /> Candidate Level
                                    </Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {DIFFICULTIES.map((d) => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => setDifficulty(d.id)}
                                                className={`
                                                    relative flex flex-col items-center justify-center p-4 rounded-xl border text-sm transition-all duration-200 overflow-hidden
                                                    ${difficulty === d.id
                                                        ? d.color + ' shadow-lg scale-[1.02] ring-1 ring-inset ring-white/10'
                                                        : 'border-border/50 bg-background/30 text-muted-foreground hover:bg-muted/50 hover:border-border'}
                                                `}
                                            >
                                                <span className="relative z-10">{d.label}</span>
                                                {difficulty === d.id && (
                                                    <motion.div
                                                        layoutId="activeDiff"
                                                        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0"
                                                    />
                                                )}
                                                {difficulty === d.id && (
                                                    <div className="absolute top-1.5 right-1.5">
                                                        <CheckCircle2 className="w-3 h-3 opacity-70" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="pt-4"
                                >
                                    <Button
                                        type="submit"
                                        disabled={!role.trim() || isStarting}
                                        className="w-full h-14 rounded-xl font-semibold text-[15px] shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all bg-primary hover:bg-primary/90 text-primary-foreground group"
                                    >
                                        {isStarting ? (
                                            <span className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                >
                                                    <Zap className="h-5 w-5 fill-current opacity-70" />
                                                </motion.div>
                                                Initializing Engine...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2 w-full">
                                                Initialize Interview
                                                <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>

                            <div className="flex justify-center text-xs text-muted-foreground items-center gap-1.5 pt-2">
                                <BookOpen className="w-3 h-3 opacity-50" />
                                Requires Microphone access for Voice Mode
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
