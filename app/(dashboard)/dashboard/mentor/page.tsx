import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MentorView } from "@/components/mentor/MentorView"

export default async function MentorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = myProfile?.role as string | undefined
  if (role !== "mentor" && role !== "admin") {
    redirect("/dashboard")
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, field, experience_level, role")
    .eq("role", "intern")
    .order("full_name")

  const { data: progress } = await supabase
    .from("intern_progress")
    .select("user_id, project_id, status, last_activity_at, last_review_at, last_review_approved")
    .order("last_activity_at", { ascending: false })

  const progressByUser = (progress ?? []).reduce((acc, p) => {
    if (!acc[p.user_id]) acc[p.user_id] = []
    acc[p.user_id].push(p)
    return acc
  }, {} as Record<string, typeof progress>)

  const interns = (profiles ?? []).map((p) => ({
    ...p,
    progress: progressByUser[p.id] ?? [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mentor view</h1>
        <p className="text-muted-foreground">Interns and their project progress. Open a project to leave feedback.</p>
      </div>
      <MentorView interns={interns} />
    </div>
  )
}
