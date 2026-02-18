"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowLeft, Loader2, Zap, CheckCircle, AlertCircle, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { SimulationView } from "@/components/simulation-view"
import { checkAndDeductCredits } from "@/app/actions/credits"

const LEVEL_LABELS: Record<string, string> = {
    L0: "Absolute Beginner",
    L1: "Novice",
    L2: "Early Learner",
    L3: "Developing Student",
    L4: "Competent Student",
    L5: "Junior Developer",
    L6: "Solid Junior",
    L7: "Mid-Level Developer",
    L8: "Senior Developer",
    L9: "Staff Engineer",
    L10: "Principal / Architect",
}

const LEVEL_HINTS: Record<string, string> = {
    L0: "No coding experience. Step-by-step hand-holding.",
    L1: "Knows basic concepts. Encouraging guidance.",
    L2: "Can write simple scripts. Starting independence.",
    L3: "Comfortable with one language. Small projects.",
    L4: "Understands OOP & frameworks. Moderate challenge.",
    L5: "Can build full-stack apps. Professional personas.",
    L6: "Testing, CI/CD basics. Less patient personas.",
    L7: "Strong in a domain. Demanding & ambiguous.",
    L8: "System design & trade-offs. Tough stakeholders.",
    L9: "Cross-functional concerns. Executive-level scrutiny.",
    L10: "Enterprise architecture. Contradictory requirements.",
}

function getLevelColor(n: number): string {
    if (n <= 2) return "text-emerald-400"
    if (n <= 5) return "text-amber-400"
    if (n <= 7) return "text-orange-400"
    return "text-red-400"
}

function getLevelBg(n: number): string {
    if (n <= 2) return "from-emerald-500/20 to-emerald-500/5"
    if (n <= 5) return "from-amber-500/20 to-amber-500/5"
    if (n <= 7) return "from-orange-500/20 to-orange-500/5"
    return "from-red-500/20 to-red-500/5"
}

function getLevelBarColor(n: number): string {
    if (n <= 2) return "bg-emerald-500"
    if (n <= 5) return "bg-amber-500"
    if (n <= 7) return "bg-orange-500"
    return "bg-red-500"
}

export default function CreateSimulationPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [title, setTitle] = useState("")
    const [context, setContext] = useState("")
    const [levelNum, setLevelNum] = useState(5)
    const [isLoading, setIsLoading] = useState(false)
    /** After successful generation, show preview with this data (so user sees result instead of going back to form) */
    const [generatedResult, setGeneratedResult] = useState<{ simulation_id: string; simulation_data: any } | null>(null)

    const levelKey = `L${levelNum}` as keyof typeof LEVEL_LABELS

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate input fields
        if (!title || !context) {
            toast({
                title: "Incomplete details",
                description: "Please fill in the title and context.",
                variant: "destructive"
            })
            return
        }

        // Check and deduct credits before generating
        try {
            const creditResult = await checkAndDeductCredits()
            if (creditResult.error) {
                toast({
                    title: "Insufficient Credits",
                    description: creditResult.error,
                    variant: "destructive"
                })
                return
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to verify credits. Please try again.",
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)
        setGeneratedResult(null)

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.error("Request timed out after 60 seconds")
            setIsLoading(false)
            toast({
                title: "Request timed out",
                description: "The simulation generation is taking too long. Please try again.",
                variant: "destructive"
            })
        }, 60000) // 60 second timeout

        try {
            console.log("Starting simulation generation...", { title, context, level: levelKey })

            // Make API call to generate simulation
            const response = await fetch("/api/generate-simulation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, context, level: levelKey }),
            })

            console.log("Response received:", response.status, response.statusText)

            // Clear timeout since we got a response
            clearTimeout(timeoutId)

            // Parse response - this can throw if JSON is invalid
            let data
            try {
                data = await response.json()
                console.log("Response data parsed successfully")
            } catch (parseError) {
                console.error("Failed to parse response JSON:", parseError)
                throw new Error("Server returned invalid response format")
            }

            // Check if response was successful
            if (!response.ok) {
                console.error("API error:", data)
                throw new Error(data?.error || data?.message || "Failed to generate simulation")
            }

            // Validate response structure
            if (!data.simulation_id || !data.simulation_data) {
                console.error("Invalid response structure:", data)
                throw new Error("Server returned incomplete data")
            }

            console.log("Simulation generated successfully:", data.simulation_id)

            // Show success message
            toast({
                title: "Success!",
                description: "Your simulation has been generated. Here's the preview.",
            })

            // Store generated result to show preview
            setGeneratedResult({
                simulation_id: data.simulation_id,
                simulation_data: data.simulation_data,
            })

            // Stop loading
            setIsLoading(false)
        } catch (error) {
            // Clear timeout if still active
            clearTimeout(timeoutId)
            
            // Log error for debugging
            console.error("Generation error:", error)
            
            // Determine error message
            let errorMessage = "Failed to generate simulation. Please try again."
            
            if (error instanceof TypeError && error.message.includes("fetch")) {
                errorMessage = "Network error. Please check your connection and try again."
            } else if (error instanceof Error) {
                errorMessage = error.message
            }
            
            // Show error message to user
            toast({
                title: "Generation failed",
                description: errorMessage,
                variant: "destructive"
            })
            
            // Stop loading state so user can try again
            setIsLoading(false)
        }
    }

    // ── Loading Screen ──
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_70%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(79,70,229,0.1),transparent_60%)]" />
                </div>

                <div className="relative text-center space-y-8">
                    {/* Spinning loader */}
                    <div className="relative mx-auto h-24 w-24">
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">
                            Generating Your Simulation
                        </h2>
                        <p className="text-sm text-white/50 max-w-sm mx-auto">
                            Our AI is crafting a personalized workspace project with personas, milestones, and requirements...
                        </p>
                    </div>

                    {/* Animated dots */}
                    <div className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>

                    {/* Level badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                        <Zap className={`h-4 w-4 ${getLevelColor(levelNum)}`} />
                        <span className="text-xs text-white/60">
                            Level {levelKey} • {LEVEL_LABELS[levelKey]}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // ── Preview (after successful generation) ──
    if (generatedResult?.simulation_data) {
        return (
            <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
                </div>
                <div className="relative z-10">
                    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/50 hover:text-white"
                                onClick={() => setGeneratedResult(null)}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to form
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/50 hover:text-white"
                                onClick={() => router.push("/dashboard")}
                            >
                                Dashboard
                            </Button>
                            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">Simulation generated</span>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500"
                                onClick={() => router.push(`/simulations/${generatedResult.simulation_id}`)}
                            >
                                Open full simulation
                            </Button>
                        </div>
                        <SimulationView data={generatedResult.simulation_data} />
                    </main>
                </div>
            </div>
        )
    }

    // ── Form ──
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
            </div>

            <div className="relative z-10">
                <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-8 text-white/50 hover:text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>

                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2 text-purple-400">
                                <Sparkles className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">AI Generated Simulation</span>
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Design Your Simulation</CardTitle>
                            <CardDescription className="text-white/60">
                                Tell us what you want to learn, and our AI will build a realistic workplace scenario for you.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleGenerate}>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium text-white/80">Project Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. E-commerce Mobile App, Data Analysis for Retail"
                                        className="border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="context" className="text-sm font-medium text-white/80">Context & Learning Goals</Label>
                                    <textarea
                                        id="context"
                                        placeholder="Tell us about your background and what you want to focus on..."
                                        className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 focus-visible:outline-none"
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                    />
                                </div>

                                {/* L0-L10 Level Slider */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium text-white/80">Level</Label>

                                    {/* Level Display */}
                                    <div className={`rounded-xl border border-white/10 bg-gradient-to-b ${getLevelBg(levelNum)} p-4`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Zap className={`h-4 w-4 ${getLevelColor(levelNum)}`} />
                                                <span className={`text-lg font-bold ${getLevelColor(levelNum)}`}>{levelKey}</span>
                                            </div>
                                            <span className="text-sm font-medium text-white/70">{LEVEL_LABELS[levelKey]}</span>
                                        </div>
                                        <p className="text-xs text-white/50 mb-4">{LEVEL_HINTS[levelKey]}</p>

                                        {/* Slider */}
                                        <div className="space-y-2">
                                            <input
                                                type="range"
                                                min={0}
                                                max={10}
                                                value={levelNum}
                                                onChange={(e) => setLevelNum(Number(e.target.value))}
                                                aria-label="Simulation difficulty level"
                                                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 
                                                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
                                                           [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                            />
                                            {/* Level markers */}
                                            <div className="flex justify-between px-0.5">
                                                {Array.from({ length: 11 }, (_, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setLevelNum(i)}
                                                        className={`text-[9px] font-mono transition-colors ${i === levelNum
                                                            ? getLevelColor(levelNum) + " font-bold"
                                                            : "text-white/20 hover:text-white/40"
                                                            }`}
                                                    >
                                                        {i}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getLevelBarColor(levelNum)} transition-all duration-300`}
                                                style={{ width: `${(levelNum / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 h-11"
                                    disabled={isLoading}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Simulation
                                </Button>
                                <p className="text-[10px] text-center text-white/40 flex items-center justify-center gap-1">
                                    <Coins className="h-3 w-3" /> Costs 3 credits per simulation
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </main>
            </div>
        </div>
    )
}