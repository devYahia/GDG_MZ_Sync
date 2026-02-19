"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardClient } from "./DashboardClient"
import { LiquidGlassBubble } from "./LiquidGlassBubble"
import type { DashboardData } from "@/app/(dashboard)/actions"

interface DashboardWithOnboardingProps {
    userName: string
    onboardingCompleted: boolean
    dashboardData: DashboardData | null
}

export function DashboardWithOnboarding({
    userName,
    onboardingCompleted,
    dashboardData,
}: DashboardWithOnboardingProps) {
    const router = useRouter()
    const [justFinished, setJustFinished] = useState(false)

    const handleOnboardingComplete = () => {
        setJustFinished(true)
        router.refresh()
    }

    const showOnboarding = !onboardingCompleted && !justFinished

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <>
            <DashboardClient
                data={dashboardData}
                showQuickStart={justFinished}
            />
            <LiquidGlassBubble
                userName={userName}
                showOnboarding={showOnboarding}
                onComplete={handleOnboardingComplete}
            />
        </>
    )
}
