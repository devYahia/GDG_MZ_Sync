"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

// --- Schemas ---

const authSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(72, "Password must be at most 72 characters"),
})

const signupSchema = authSchema
    .extend({
        confirmPassword: z.string(),
        fullName: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name is too long"),
        region: z.string().min(2, "Region is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })


const profileSchema = z.object({
    field: z.enum([
        "frontend",
        "backend",
        "fullstack",
        "mobile",
        "data",
        "design",
    ]),
    experienceLevel: z.enum(["student", "fresh_grad", "junior"]),
    interests: z
        .array(z.string())
        .min(1, "Select at least one interest"),
})

// --- Types ---

export type AuthResult = {
    error?: string
    success?: string
}

// --- Actions ---

export async function login(formData: FormData): Promise<AuthResult> {
    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const validated = authSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: validated.data.email,
        password: validated.data.password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}

export async function signup(data: {
    email: string
    password: string
    confirmPassword: string
    fullName: string
    region: string
}): Promise<AuthResult> {
    const validated = signupSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.getUser()
    if (existingUser?.user) {
        return { error: "You are already logged in. Please sign out first." }
    }

    // Create user account directly with password
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.data.email,
        password: validated.data.password,
        options: {
            emailRedirectTo: undefined,
            data: {
                full_name: validated.data.fullName,
                region: validated.data.region,
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Failed to create account. Please try again." }
    }

    // Check if this user already has a profile
    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, onboarding_completed")
        .eq("id", authData.user.id)
        .single()

    if (existingProfile) {
        // Profile already exists - check if onboarding is complete
        if (existingProfile.onboarding_completed) {
            return { error: "Account already exists. Please sign in instead." }
        }
        // Profile exists but onboarding incomplete - let them continue
        return { success: "Account created successfully!" }
    }

    // Create profile for new user using upsert
    const { error: profileError } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: validated.data.fullName,
        region: validated.data.region,
        field: "frontend", // placeholder, updated in onboarding
        experience_level: "student", // placeholder
        interests: [],
        onboarding_completed: false,
    }, {
        onConflict: "id"
    })

    if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: "Account created but profile setup failed. Please contact support." }
    }

    // Revalidate to ensure session is picked up
    revalidatePath("/", "layout")

    return { success: "Account created successfully!" }
}


export async function completeOnboarding(data: {
    field: string
    experienceLevel: string
    interests: string[]
}): Promise<AuthResult> {
    const validated = profileSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            field: validated.data.field,
            experience_level: validated.data.experienceLevel,
            interests: validated.data.interests,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}

export async function signout(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/")
}
