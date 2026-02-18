import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { ProgressClient } from "@/components/dashboard/progress/ProgressClient"

export default async function ProgressPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const user = await container.userRepository.findById(session.user.id)
    if (!user) redirect("/login")

    return <ProgressClient currentLevel={user.currentLevel} />
}
