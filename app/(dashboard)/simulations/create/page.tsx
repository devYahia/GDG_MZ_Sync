"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar"
import { useToast } from "@/hooks/use-toast"

export default function CreateSimulationPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [title, setTitle] = useState("")
    const [context, setContext] = useState("")
    const [level, setLevel] = useState("Intermediate")
    const [levelDescription, setLevelDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const levels = [
        { value: "Beginner", label: "Beginner", color: "border-emerald-500 bg-emerald-500/10 text-emerald-400", desc: "Patient personas, guided milestones, simple requirements" },
        { value: "Intermediate", label: "Intermediate", color: "border-amber-500 bg-amber-500/10 text-amber-400", desc: "Professional personas, moderate challenge, some ambiguity" },
        { value: "Advanced", label: "Advanced", color: "border-red-500 bg-red-500/10 text-red-400", desc: "Demanding personas, complex requirements, minimal guidance" },
    ]

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title || !context || !levelDescription) {
            toast({
                title: "Incomplete details",
                description: "Please fill in all fields including the level description.",
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("http://localhost:8000/generate-simulation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, context, level, level_description: levelDescription }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate simulation")
            }

            const data = await response.json()

            toast({
                title: "Success!",
                description: "Your simulation has been generated.",
            })

            // Navigate to the newly created simulation view
            router.push(`/simulations/${data.simulation_id}`)

        } catch (error) {
            console.error("Generation error:", error)
            toast({
                title: "Error",
                description: "Something went wrong while generating the simulation.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />
            </div>

            <div className="relative z-10">
                <DashboardNavbar
                    userEmail=""
                    userName="User"
                />

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
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="context" className="text-sm font-medium text-white/80">Context & Learning Goals</Label>
                                    <textarea
                                        id="context"
                                        placeholder="Tell us about your background (e.g. 2nd year CS student) and what you want to focus on (e.g. building a React Native app with a focus on UI and performance)."
                                        className="flex min-h-[150px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Level Selector */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-white/80">Difficulty Level</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {levels.map((l) => (
                                            <button
                                                key={l.value}
                                                type="button"
                                                onClick={() => setLevel(l.value)}
                                                disabled={isLoading}
                                                className={`rounded-lg border p-3 text-center transition-all ${level === l.value
                                                        ? l.color + " ring-1 ring-current"
                                                        : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                            >
                                                <span className="block text-sm font-semibold">{l.label}</span>
                                                <span className="block text-[10px] mt-1 opacity-70">{l.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Level Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="levelDescription" className="text-sm font-medium text-white/80">Your Current Skill Level</Label>
                                    <textarea
                                        id="levelDescription"
                                        placeholder="Describe your skills (e.g. I know Python basics and have built simple Flask apps, but haven't used Docker or deployed anything to production)."
                                        className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={levelDescription}
                                        onChange={(e) => setLevelDescription(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 h-11"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating Simulation...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Simulation
                                        </>
                                    )}
                                </Button>
                                <p className="text-[10px] text-center text-white/40">
                                    Our AI uses your context to design requirements, milestones, and personas for a total immersive experience.
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </main>
            </div>
        </div>
    )
}
