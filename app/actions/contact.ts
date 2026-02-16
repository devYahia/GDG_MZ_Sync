"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const contactSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

export type ContactResult = {
    success?: string
    error?: string
    fieldErrors?: Record<string, string[]>
}

export async function submitContactForm(data: {
    full_name: string
    email: string
    subject: string
    message: string
}): Promise<ContactResult> {
    const validated = contactSchema.safeParse(data)

    if (!validated.success) {
        return {
            error: "Please check your input.",
            fieldErrors: validated.error.flatten().fieldErrors as Record<string, string[]>,
        }
    }

    const supabase = await createClient()

    const { error } = await supabase.from("contact_submissions").insert({
        full_name: validated.data.full_name,
        email: validated.data.email,
        subject: validated.data.subject,
        message: validated.data.message,
    })

    if (error) {
        console.error("Contact form error:", error)
        return { error: "Something went wrong. Please try again later." }
    }

    return { success: "Message sent successfully! We will get back to you soon." }
}
