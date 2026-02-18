import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { ResourcesClient } from "@/components/dashboard/ResourcesClient"
import { TaskField } from "@/lib/tasks"

export default async function ResourcesPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const user = await container.userRepository.findById(session.user.id)
    if (!user) redirect("/login")

    return (
        <ResourcesClient
            initialTrack={user.field as TaskField}
        />
    )
}
