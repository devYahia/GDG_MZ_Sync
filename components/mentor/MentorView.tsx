"use client"

import Link from "next/link"
import { ExternalLink, User, FolderKanban } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

type ProgressRow = {
  user_id: string
  project_id: string
  status: string
  last_activity_at: string | null
  last_review_at: string | null
  last_review_approved: boolean | null
}

type Intern = {
  id: string
  full_name: string | null
  field: string
  experience_level: string
  role: string
  progress: ProgressRow[]
}

interface MentorViewProps {
  interns: Intern[]
}

export function MentorView({ interns }: MentorViewProps) {
  if (interns.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="py-12 text-center text-muted-foreground">
          No interns yet. Assign the <strong>intern</strong> role to users; set your role to <strong>mentor</strong> to see this page.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {interns.map((intern) => (
        <Card key={intern.id} className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{intern.full_name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">
                    {intern.field} · {intern.experience_level}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {intern.progress.length === 0 ? (
              <p className="text-sm text-muted-foreground">No project activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {intern.progress.slice(0, 10).map((p) => (
                  <li
                    key={`${p.user_id}-${p.project_id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{p.project_id}</span>
                      <Badge variant="secondary" className="text-xs">
                        {p.status}
                      </Badge>
                      {p.last_review_approved !== null && (
                        <span className={p.last_review_approved ? "text-emerald-500" : "text-amber-500"}>
                          {p.last_review_approved ? "Approved" : "Needs work"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.last_activity_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(p.last_activity_at), { addSuffix: true })}
                        </span>
                      )}
                      <Link
                        href={`/dashboard/project/${p.project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        View project
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
