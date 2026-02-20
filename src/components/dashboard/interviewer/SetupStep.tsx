"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Briefcase, Sparkles, Cpu, Layers, Layout, Server, MessageSquare, Database, Rocket, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const FOCUS_AREAS = [
    { id: "algorithms", label: "Algorithms", icon: Cpu },
    { id: "system-design", label: "System Design", icon: Layers },
    { id: "frontend", label: "Frontend", icon: Layout },
    { id: "backend", label: "Backend", icon: Server },
    { id: "behavioral", label: "Behavioral", icon: MessageSquare },
    { id: "databases", label: "Databases", icon: Database },
    { id: "devops", label: "DevOps", icon: Rocket },
    { id: "security", label: "Security", icon: Shield },
]

const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard", "Expert"]
const DIFFICULTY_COLORS = [
    "text-emerald-400",
    "text-amber-400",
    "text-orange-400",
    "text-red-400",
]

const ROLE_TOOLTIPS: Record<string, string> = {
    "Frontend Engineer": "Focus on UI/UX, component architecture, CSS, performance, and browser APIs.",
    "Backend Engineer": "Focus on APIs, databases, system architecture, and server-side logic.",
    "Full-Stack Engineer": "Covers both frontend and backend, plus integration patterns.",
    "DevOps Engineer": "CI/CD pipelines, infrastructure, containerization, and monitoring.",
    "Data Engineer": "Data pipelines, warehousing, ETL, and big data technologies.",
}

interface SetupStepProps {
    jobDescription: string
    setJobDescription: (v: string) => void
    language: "en" | "ar"
    setLanguage: (v: "en" | "ar") => void
    onStart: (config: { difficulty: number; focusAreas: string[]; role: string }) => void
}

export function SetupStep({
    jobDescription,
    setJobDescription,
    language,
    setLanguage,
    onStart,
}: SetupStepProps) {
    const [difficulty, setDifficulty] = useState(1)
    const [selectedFocus, setSelectedFocus] = useState<string[]>([])
    const [role, setRole] = useState("Frontend Engineer")

    const toggleFocus = (id: string) => {
        setSelectedFocus((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        )
    }

    return (
        <motion.div
            className="flex min-h-[max-content] w-full flex-col items-center justify-center py-12 px-6 pb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)]">
                        <Briefcase className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        Interview Simulation
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Configure your session to practice for your dream role.
                    </p>
                </div>

                <div className="space-y-6 rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl shadow-2xl">
                    {/* Job Description */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium text-white/80">Job Description / Role Context</Label>
                        <Textarea
                            placeholder="Paste the job description here (e.g., 'Senior Frontend Engineer at Google...'). The AI will tailor questions based on this."
                            className="min-h-[120px] resize-none border-white/10 bg-black/20 text-base focus:border-primary/50 focus:ring-primary/20 backdrop-blur-sm transition-all"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    {/* Role Selection with Tooltips */}
                    <TooltipProvider>
                        <div className="space-y-3">
                            <Label className="text-base font-medium text-white/80">Target Role</Label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(ROLE_TOOLTIPS).map((r) => (
                                    <Tooltip key={r}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => setRole(r)}
                                                className={cn(
                                                    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                                                    role === r
                                                        ? "border-primary bg-primary/20 text-primary"
                                                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                                                )}
                                            >
                                                {r}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-[250px]">
                                            <p className="text-xs">{ROLE_TOOLTIPS[r]}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    </TooltipProvider>

                    {/* Difficulty Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium text-white/80">Difficulty</Label>
                            <span className={cn("text-sm font-bold", DIFFICULTY_COLORS[difficulty])}>
                                {DIFFICULTY_LABELS[difficulty]}
                            </span>
                        </div>
                        <Slider
                            value={[difficulty]}
                            onValueChange={(v) => setDifficulty(v[0])}
                            min={0}
                            max={3}
                            step={1}
                            className="w-full"
                        />
                    </div>

                    {/* Focus Area Chips */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {FOCUS_AREAS.map((area) => {
                                const Icon = area.icon
                                const isSelected = selectedFocus.includes(area.id)
                                return (
                                    <button
                                        key={area.id}
                                        onClick={() => toggleFocus(area.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-all duration-300",
                                            isSelected
                                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]"
                                                : "border-white/5 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-white/30")} />
                                        {area.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium text-white/80">Interview Language</Label>
                        <Select value={language} onValueChange={(v: "en" | "ar") => setLanguage(v)}>
                            <SelectTrigger className="h-12 border-white/10 bg-black/20 text-base focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">
                                    <div className="flex items-center gap-2">English (Professional)</div>
                                </SelectItem>
                                <SelectItem value="ar">
                                    <div className="flex items-center gap-2">Arabic (Technical)</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                        onClick={() => onStart({ difficulty, focusAreas: selectedFocus, role })}
                        disabled={!jobDescription.trim()}
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Interview Session
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
