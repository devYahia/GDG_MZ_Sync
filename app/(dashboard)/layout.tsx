import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // if (!profile || !profile.onboarding_completed) redirect("/signup") // Removed redirect to allow bubble flow

  if (!profile) redirect("/signup")

  return (
    <DashboardShell
      userName={profile.full_name}
      userEmail={user.email ?? ""}
      showOnboarding={!profile.onboarding_completed}
    >
      {children}
    </DashboardShell>
  )
}
