import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { HomeWelcome } from "@/components/dashboard/HomeWelcome"
import { HomeStats } from "@/components/dashboard/HomeStats"
import { QuickAccess } from "@/components/dashboard/QuickAccess"
import { TaskGrid } from "@/components/dashboard/TaskGrid"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const user = await container.userRepository.findById(session.user.id)
    if (!user) redirect("/login")

    return (
        <div className="space-y-8">
            <HomeWelcome
                userName={user.name ?? user.email ?? "Developer"}
                fieldKey={user.field ?? "frontend"}
                experienceLevel={user.experienceLevel ?? "junior"}
            />
            <HomeStats />
            <QuickAccess />
            <section className="space-y-6">
                <TaskGrid />
            </section>
        </div>
    )
}
