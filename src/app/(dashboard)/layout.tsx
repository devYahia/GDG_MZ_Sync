import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await container.userRepository.findById(session.user.id)
  if (!user) redirect("/login")

  // Ensure onboarding is completed
  if (!user.field || !user.experienceLevel) {
    redirect("/onboarding")
  }

  return (
    <DashboardShell
      userName={user.name ?? user.email ?? "Developer"}
      userEmail={user.email ?? ""}
      credits={user.credits ?? 0}
    >
      {children}
    </DashboardShell>
  )
}
