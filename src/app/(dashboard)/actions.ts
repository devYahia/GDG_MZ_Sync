"use server"

import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const onboardingSchema = z.object({
    field: z.string(),
    experience_level: z.string(),
    interests: z.array(z.string()),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

export async function updateOnboardingProfile(data: OnboardingData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        await container.userRepository.update(session.user.id, {
            field: data.field as any,
            experienceLevel: data.experience_level as any,
            interests: data.interests,
            onboardingCompleted: true,
        })

        revalidatePath("/dashboard", "layout")
        return { success: true }
    } catch (error: any) {
        console.error("Onboarding update error:", error)
        return { error: error.message }
    }
}
