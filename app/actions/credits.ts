"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const CREDITS_PER_SIMULATION = 3

export type CreditResult = {
    error?: string
    success?: boolean
    credits?: number
}

export async function checkAndDeductCredits(): Promise<CreditResult> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to start a simulation." }
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()

    if (profileError || !profile) {
        return { error: "Could not load your profile. Please try again." }
    }

    const currentCredits = profile.credits ?? 0

    if (currentCredits < CREDITS_PER_SIMULATION) {
        return {
            error: `Insufficient credits. You need ${CREDITS_PER_SIMULATION} credits to start a simulation but you only have ${currentCredits}. Please add more credits.`,
        }
    }

    // Atomic deduction using rpc or direct update
    const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({ credits: currentCredits - CREDITS_PER_SIMULATION })
        .eq("id", user.id)
        .gte("credits", CREDITS_PER_SIMULATION)
        .select("credits")
        .single()

    if (updateError || !updated) {
        return {
            error: "Failed to deduct credits. You may not have enough credits. Please try again.",
        }
    }

    revalidatePath("/dashboard", "layout")

    return {
        success: true,
        credits: updated.credits,
    }
}

export async function getUserCredits(): Promise<CreditResult> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()

    if (error || !profile) {
        return { error: "Could not load credits" }
    }

    return { success: true, credits: profile.credits ?? 0 }
}

export async function addCredits(amount: number): Promise<CreditResult> {
    if (!amount || amount <= 0 || amount > 10000) {
        return { error: "Invalid credit amount. Must be between 1 and 10,000." }
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to purchase credits." }
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single()

    if (profileError || !profile) {
        return { error: "Could not load your profile." }
    }

    const newCredits = (profile.credits ?? 0) + amount

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", user.id)

    if (updateError) {
        return { error: "Failed to add credits. Please try again." }
    }

    revalidatePath("/dashboard", "layout")

    return { success: true, credits: newCredits }
}
