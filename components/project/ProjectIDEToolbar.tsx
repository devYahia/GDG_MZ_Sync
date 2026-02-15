"use client"

import { useState } from "react"
import { Github, MessageCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const CALCOM_URL = process.env.NEXT_PUBLIC_CALCOM_SCHEDULING_URL || "https://cal.com"
const GITHUB_DOCS = "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"

interface ProjectIDEToolbarProps {
  projectTitle: string
  code: string
  notifyOnSubmit: boolean
  setNotifyOnSubmit: (v: boolean) => void
  webhookUrl: string
  setWebhookUrl: (v: string) => void
}

export function ProjectIDEToolbar({
  projectTitle,
  code,
  notifyOnSubmit,
  setNotifyOnSubmit,
  webhookUrl,
  setWebhookUrl,
}: ProjectIDEToolbarProps) {
  const [pushOpen, setPushOpen] = useState(false)
  const [repo, setRepo] = useState("")
  const [branch, setBranch] = useState("")
  const [token, setToken] = useState("")
  const [pushLoading, setPushLoading] = useState(false)
  const [pushResult, setPushResult] = useState<{ prUrl?: string; error?: string } | null>(null)

  const handlePush = async () => {
    if (!repo.trim() || !branch.trim() || !token.trim()) return
    setPushLoading(true)
    setPushResult(null)
    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repo.trim(),
          branch: branch.trim(),
          commitMessage: `Interna: ${projectTitle}`,
          code,
          projectTitle,
          accessToken: token.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPushResult({ error: data.error || "Push failed" })
        return
      }
      setPushResult({ prUrl: data.prUrl })
    } catch (e) {
      setPushResult({ error: e instanceof Error ? e.message : "Request failed" })
    } finally {
      setPushLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-3 py-1.5">
      <Dialog open={pushOpen} onOpenChange={setPushOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
            <Github className="h-3.5 w-3.5" />
            Push to GitHub
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Push solution to GitHub</DialogTitle>
            <DialogDescription>
              Create a branch, commit your code, and open a PR. Use <strong>owner/repo</strong> (e.g. <code className="text-xs">myorg/interna-solutions</code>).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="repo">Repo (owner/repo)</Label>
              <Input
                id="repo"
                placeholder="owner/repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch">Branch name</Label>
              <Input
                id="branch"
                placeholder="interna-project-name"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token">GitHub Personal Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="ghp_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
              />
              <a
                href={GITHUB_DOCS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Create a token (repo scope)
              </a>
            </div>
            {pushResult?.error && (
              <p className="text-sm text-destructive">{pushResult.error}</p>
            )}
            {pushResult?.prUrl && (
              <p className="text-sm text-green-600 dark:text-green-400">
                PR opened:{" "}
                <a href={pushResult.prUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {pushResult.prUrl}
                </a>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPushOpen(false)}>Cancel</Button>
            <Button onClick={handlePush} disabled={pushLoading}>
              {pushLoading ? "Pushing…" : "Create branch & PR"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={notifyOnSubmit}
          onChange={(e) => setNotifyOnSubmit(e.target.checked)}
          className="rounded border-border"
        />
        <MessageCircle className="h-3.5 w-3.5" />
        Notify Slack/Discord on review
      </label>
      {notifyOnSubmit && (
        <Input
          placeholder="Webhook URL (optional)"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="h-7 w-48 text-xs font-mono"
        />
      )}

      <a
        href={CALCOM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Calendar className="h-3.5 w-3.5" />
        Schedule 1:1 with mentor
      </a>
    </div>
  )
}
