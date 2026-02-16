"use client"

import { motion } from "motion/react"
import { ArrowRight, Briefcase, Globe, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SetupStepProps {
    jobDescription: string
    setJobDescription: (v: string) => void
    language: "en" | "ar"
    setLanguage: (v: "en" | "ar") => void
    onStart: () => void
}

export function SetupStep({
    jobDescription,
    setJobDescription,
    language,
    setLanguage,
    onStart
}: SetupStepProps) {
    return (
        <motion.div
            className="flex h-full w-full flex-col items-center justify-center p-6"
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
                    <div className="space-y-3">
                        <Label className="text-base font-medium text-white/80">Job Description / Role Context</Label>
                        <Textarea
                            placeholder="Paste the job description here (e.g., 'Senior Frontend Engineer at Google...'). The AI will tailor questions based on this."
                            className="min-h-[150px] resize-none border-white/10 bg-black/20 text-base focus:border-primary/50 focus:ring-primary/20 backdrop-blur-sm transition-all"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base font-medium text-white/80">Interview Language</Label>
                        <Select value={language} onValueChange={(v: "en" | "ar") => setLanguage(v)}>
                            <SelectTrigger className="h-12 border-white/10 bg-black/20 text-base focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🇬🇧</span> English (Professional)
                                    </div>
                                </SelectItem>
                                <SelectItem value="ar">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🇪🇬</span> Arabic (Technical)
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                        onClick={onStart}
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
