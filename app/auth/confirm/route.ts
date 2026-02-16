import { type EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get("token_hash")
    const type = searchParams.get("type") as EmailOtpType | null

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            // Check if the user has completed onboarding
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("onboarding_completed")
                    .eq("id", user.id)
                    .single()

                if (profile?.onboarding_completed) {
                    return NextResponse.redirect(
                        new URL("/dashboard", request.url)
                    )
                } else {
                    return NextResponse.redirect(
                        new URL("/onboarding", request.url)
                    )
                }
            }

            // Fallback: user exists but no profile yet (trigger may still be processing)
            return NextResponse.redirect(new URL("/onboarding", request.url))
        }
    }

    // Verification failed - redirect to login with error
    return NextResponse.redirect(
        new URL("/login?error=confirmation_failed", request.url)
    )
}
