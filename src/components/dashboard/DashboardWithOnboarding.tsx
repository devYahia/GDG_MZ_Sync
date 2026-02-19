
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardClient } from "./DashboardClient"
import { LiquidGlassBubble } from "./LiquidGlassBubble"

interface DashboardWithOnboardingProps {
    userName: string
    fieldKey: string
    experienceLevel: string
    onboardingCompleted: boolean
}

export function DashboardWithOnboarding({
    userName,
    fieldKey,
    experienceLevel,
    onboardingCompleted,
}: DashboardWithOnboardingProps) {
    const router = useRouter()
    const [justFinished, setJustFinished] = useState(false)

    const handleOnboardingComplete = () => {
        setJustFinished(true)
        router.refresh()
    }

    const showOnboarding = !onboardingCompleted && !justFinished

    return (
        <>
            <DashboardClient
                userName={userName}
                fieldKey={fieldKey}
                experienceLevel={experienceLevel}
                showQuickStart={justFinished} // Only show if they just finished in this session
            />
            <LiquidGlassBubble
                userName={userName}
                showOnboarding={showOnboarding}
                onComplete={handleOnboardingComplete}
            />
        </>
    )
}
