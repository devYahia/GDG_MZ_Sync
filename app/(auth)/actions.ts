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

    // First, check if user already exists
    const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id || "")
        .single()

    if (existingUser) {
        return { error: "User already exists" }
    }

    // Use signInWithOtp to send verification email
    // This will send an email with a 6-digit OTP code
    const { error } = await supabase.auth.signInWithOtp({
        email: validated.data.email,
        options: {
            shouldCreateUser: true,
            data: {
                full_name: validated.data.fullName,
                region: validated.data.region,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    return {
        success:
            "Verification code sent! Please check your email for a 6-digit code.",
    }
}

export async function verifyEmailOtp(data: {
    email: string
    token: string
    fullName: string
    region: string
}): Promise<AuthResult> {
    const supabase = await createClient()

    // Verify the OTP
    const {
        data: { session },
        error,
    } = await supabase.auth.verifyOtp({
        email: data.email,
        token: data.token,
        type: "email",
    })

    if (error) {
        return { error: error.message }
    }

    if (!session?.user) {
        return { error: "Verification failed. Please try again." }
    }

    // Create profile after successful verification
    const { error: profileError } = await supabase.from("profiles").insert({
        id: session.user.id,
        full_name: data.fullName,
        region: data.region,
        field: "frontend", // placeholder, updated in onboarding
        experience_level: "student", // placeholder
        interests: [],
        onboarding_completed: false,
    })

    if (profileError) {
        // If profile creation fails, we should still let them continue
        // They can complete profile later
        console.error("Profile creation error:", profileError)
    }

    return { success: "Email verified! Completing your profile..." }
}

export async function resendEmailOtp(email: string): Promise<AuthResult> {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: "Verification code resent! Check your email." }
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
