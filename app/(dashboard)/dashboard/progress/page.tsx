"use client"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ProgressClient } from "@/components/dashboard/progress/ProgressClient"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProgressPage() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            setUser({ ...user, profile })
        }
        checkUser()
    }, [])

    if (!user) return null

    return (
        <DashboardShell
            userName={user.profile?.full_name ?? user.email ?? "Developer"}
            userEmail={user.email ?? ""}
        >
            <ProgressClient />
        </DashboardShell>
    )
}
