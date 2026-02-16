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
        .max(72, "Password must be at most 72 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"|\<\>?,./`~]/, "Password must contain at least one special character"),
})

const signupSchema = authSchema
    .extend({
        confirmPassword: z.string(),
        fullName: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name is too long"),
        region: z.string().min(2, "Region is required"),
        field: z.enum([
            "frontend",
            "backend",
            "fullstack",
            "mobile",
            "data",
            "design",
        ]),
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
    field: string
}): Promise<AuthResult> {
    const validated = signupSchema.safeParse(data)
    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const supabase = await createClient()

    // Sign up the user (email confirmation is disabled via DB trigger)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: validated.data.email,
        password: validated.data.password,
        options: {
            data: {
                full_name: validated.data.fullName,
                region: validated.data.region,
                field: validated.data.field,
            },
        },
    })

    if (signUpError) {
        if (signUpError.message.includes("already registered")) {
            return { error: "An account with this email already exists. Please sign in instead." }
        }
        return { error: signUpError.message }
    }

    // Auto-login immediately after signup (no email verification needed)
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: validated.data.email,
        password: validated.data.password,
    })

    if (loginError) {
        // Signup succeeded but auto-login failed -- still a success, user can login manually
        return { success: "Account created! Please sign in with your credentials." }
    }

    // Create profile if it doesn't exist
    if (signUpData.user) {
        await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            full_name: validated.data.fullName,
            region: validated.data.region,
            field: validated.data.field || "frontend",
            experience_level: "student",
            interests: [],
            onboarding_completed: false,
        }, { onConflict: "id" })
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
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
