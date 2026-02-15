"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar"
import { SimulationView } from "@/components/simulation-view"
import { createClient } from "@/lib/supabase/client"

export default function SimulationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [simulation, setSimulation] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSimulation() {
            if (!params.id) return

            try {
                const { data, error } = await supabase
                    .from("simulations")
                    .select("*, personas(*)")
                    .eq("id", params.id)
                    .single()

                if (error) throw error
                if (!data) throw new Error("Simulation not found")

                // Combine simulation project_details and personas into the format SimulationView expects
                const formattedData = {
                    ...data.project_details,
                    personas: data.personas
                }

                setSimulation(formattedData)
            } catch (err: any) {
                console.error("Fetch error:", err)
                setError(err.message || "Failed to load simulation")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSimulation()
    }, [params.id, supabase])

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

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-8 text-white/50 hover:text-white"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                            <p className="text-white/40 animate-pulse">Loading your simulation...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
                            <p className="text-white/40 max-w-md">{error}</p>
                            <Button onClick={() => router.push("/dashboard")} className="mt-4">
                                Return to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <SimulationView data={simulation} />
                    )}
                </main>
            </div>
        </div>
    )
}
