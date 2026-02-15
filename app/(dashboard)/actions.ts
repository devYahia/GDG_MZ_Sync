"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const onboardingSchema = z.object({
    field: z.string(),
    experience_level: z.string(),
    interests: z.array(z.string()),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

export async function updateOnboardingProfile(data: OnboardingData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("profiles")
        .update({
            field: data.field,
            experience_level: data.experience_level,
            interests: data.interests,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

    if (error) {
        console.error("Onboarding update error:", error)
        return { error: error.message }
    }

    revalidatePath("/dashboard", "layout")
    return { success: true }
}
