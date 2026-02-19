import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { getProgressData } from "@/app/(dashboard)/actions"
import { ProgressClient } from "@/components/dashboard/progress/ProgressClient"

export default async function ProgressPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const data = await getProgressData()
    if (!data) redirect("/login")

    return <ProgressClient data={data} />
}
