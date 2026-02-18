"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardClient } from "./DashboardClient"
import { LiquidGlassBubble } from "./LiquidGlassBubble"

interface DashboardWithOnboardingProps {
    userName: string
    fieldKey: string
    experienceLevel: string
}

export function DashboardWithOnboarding({
    userName,
    fieldKey,
    experienceLevel,
}: DashboardWithOnboardingProps) {
    const router = useRouter()
    const [onboardingComplete, setOnboardingComplete] = useState(false)

    const handleOnboardingComplete = () => {
        setOnboardingComplete(true)
        // Refresh to get updated profile data
        router.refresh()
    }

    return (
        <>
            <DashboardClient
                userName={userName}
                fieldKey={fieldKey}
                experienceLevel={experienceLevel}
            />
            <LiquidGlassBubble
                userName={userName}
                showOnboarding={!onboardingComplete}
                onComplete={handleOnboardingComplete}
            />
        </>
    )
}
