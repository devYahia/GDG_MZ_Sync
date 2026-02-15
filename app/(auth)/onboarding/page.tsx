"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
    Terminal,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Code,
    Server,
    Layers,
    Smartphone,
    Database,
    Palette,
    Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { completeOnboarding } from "../actions"

const FIELDS = [
    { id: "frontend", label: "Frontend", icon: Code, desc: "React, Vue, Angular" },
    { id: "backend", label: "Backend", icon: Server, desc: "Node, Python, Go" },
    { id: "fullstack", label: "Full Stack", icon: Layers, desc: "End-to-end development" },
    { id: "mobile", label: "Mobile", icon: Smartphone, desc: "iOS, Android, Flutter" },
    { id: "data", label: "Data", icon: Database, desc: "ML, Analytics, Engineering" },
    { id: "design", label: "Design", icon: Palette, desc: "UI/UX, Product Design" },
]

const EXPERIENCE_LEVELS = [
    { id: "student", label: "Student", desc: "Currently studying computer science or related field" },
    { id: "fresh_grad", label: "Fresh Graduate", desc: "Recently graduated, looking for first role" },
    { id: "junior", label: "Junior Developer", desc: "1-2 years of professional experience" },
]

const INTERESTS = [
    "System Design", "API Development", "Testing", "CI/CD",
    "Cloud Computing", "Databases", "Security", "Performance",
    "Accessibility", "Open Source", "AI/ML", "DevOps",
]

type Step = 1 | 2 | 3

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>(1)
    const [isPending, startTransition] = useTransition()

    const [field, setField] = useState("")
    const [experienceLevel, setExperienceLevel] = useState("")
    const [interests, setInterests] = useState<string[]>([])

    function toggleInterest(interest: string) {
        setInterests((prev) => {
            const arr = Array.isArray(prev) ? prev : []
            return arr.includes(interest)
                ? arr.filter((i) => i !== interest)
                : [...arr, interest]
        })
    }

    function handleComplete() {
        if (interests.length === 0) {
            toast.error("Please select at least one interest")
            return
        }

        startTransition(async () => {
            const result = await completeOnboarding({
                field,
                experienceLevel,
                interests,
            })

            if (result?.error) {
                toast.error(result.error)
            }
            // On success, completeOnboarding redirects to /dashboard
        })
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-black text-white selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Logo */}
                <Link
                    href="/"
                    className="mb-6 flex items-center justify-center gap-2 group"
                >
                    <Terminal className="h-6 w-6 text-purple-500 transition-transform group-hover:scale-110" />
                    <span className="text-xl font-bold tracking-tight font-logo">
                        Interna<span className="text-purple-500">.</span> Virtual
                    </span>
                </Link>

                {/* Progress Bar */}
                <div className="mb-6 flex items-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step
                                ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                : "bg-white/10"
                                }`}
                        />
                    ))}
                </div>
                <p className="mb-4 text-center text-xs text-white/40">
                    Step {step} of 3 - Complete your profile
                </p>

                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                    {/* Step 1: Field Selection */}
                    {step === 1 && (
                        <>
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    Choose your field
                                </h1>
                                <p className="text-white/50 text-sm mt-2">
                                    What area of development excites you most?
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {FIELDS.map((f) => {
                                    const Icon = f.icon
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => setField(f.id)}
                                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 ${field === f.id
                                                ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]"
                                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                }`}
                                        >
                                            <Icon className={`h-6 w-6 ${field === f.id ? "text-purple-400" : "text-white/50"}`} />
                                            <span className={`text-sm font-medium ${field === f.id ? "text-purple-300" : "text-white/70"}`}>{f.label}</span>
                                            <span className="text-xs text-white/30">{f.desc}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            <Button
                                className="w-full h-12 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 hover:shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] transition-all duration-300 rounded-lg font-medium text-white"
                                disabled={!field}
                                onClick={() => setStep(2)}
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Step 2: Experience Level */}
                    {step === 2 && (
                        <>
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    Experience level
                                </h1>
                                <p className="text-white/50 text-sm mt-2">
                                    Where are you in your career journey?
                                </p>
                            </div>
                            <div className="space-y-3 mb-6">
                                {EXPERIENCE_LEVELS.map((lvl) => (
                                    <button
                                        key={lvl.id}
                                        onClick={() => setExperienceLevel(lvl.id)}
                                        className={`flex w-full flex-col rounded-xl border p-4 text-left transition-all duration-200 ${experienceLevel === lvl.id
                                            ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]"
                                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                            }`}
                                    >
                                        <span className={`text-sm font-medium ${experienceLevel === lvl.id ? "text-purple-300" : "text-white/70"}`}>{lvl.label}</span>
                                        <span className="text-xs text-white/30 mt-1">{lvl.desc}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 flex-1 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                    onClick={() => setStep(1)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    className="h-12 flex-1 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 hover:shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] transition-all duration-300 rounded-lg font-medium text-white"
                                    disabled={!experienceLevel}
                                    onClick={() => setStep(3)}
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Interests */}
                    {step === 3 && (
                        <>
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    Your interests
                                </h1>
                                <p className="text-white/50 text-sm mt-2">
                                    Select topics you want to explore
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {INTERESTS.map((interest) => (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${(interests ?? []).includes(interest)
                                            ? "border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-[0_0_10px_-3px_rgba(168,85,247,0.3)]"
                                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs text-white/30 mb-4">
                                {interests.length} selected
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 flex-1 border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                    onClick={() => setStep(2)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    className="h-12 flex-1 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 hover:shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] transition-all duration-300 rounded-lg font-medium text-white"
                                    disabled={interests.length === 0 || isPending}
                                    onClick={handleComplete}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Start Exploring
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <p className="mt-8 text-center font-mono text-xs text-white/20">
                    Built for GDG Hackathon 2026
                </p>
            </div>
        </div>
    )
}
