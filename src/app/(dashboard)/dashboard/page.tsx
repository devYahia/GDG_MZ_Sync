
import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { DashboardWithOnboarding } from "@/components/dashboard/DashboardWithOnboarding"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const user = await container.userRepository.findById(session.user.id)
    if (!user) redirect("/login")

    return (
        <DashboardWithOnboarding
            userName={user.name ?? user.email ?? "Developer"}
            fieldKey={user.field ?? "frontend"}
            experienceLevel={user.experienceLevel ?? "junior"}
            onboardingCompleted={user.onboardingCompleted ?? false}
        />
    )
}
