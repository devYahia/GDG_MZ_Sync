import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { getUserProjects } from "@/app/actions/projects"
import { MyProjectsPage } from "@/components/dashboard/MyProjectsPage"

export const metadata = {
    title: "My Projects | Interna",
    description: "View and manage your simulation projects",
}

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const { projects } = await getUserProjects()

    return <MyProjectsPage projects={projects} />
}
