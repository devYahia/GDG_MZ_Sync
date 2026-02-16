import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResourcesClient } from "@/components/dashboard/ResourcesClient"
import { TaskField } from "@/lib/tasks"

export default async function ResourcesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("field")
        .eq("id", user.id)
        .single()

    return (
        <ResourcesClient
            initialTrack={profile?.field as TaskField}
        />
    )
}
