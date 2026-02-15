import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Octokit } from "octokit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface PushBody {
  repo: string
  branch: string
  commitMessage: string
  code: string
  /** Optional: multiple files to push (path -> content). If provided, used instead of single code. */
  files?: Record<string, string>
  projectTitle: string
  accessToken: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await request.json()) as PushBody
    const { repo, branch, commitMessage, code, files: filesMap, projectTitle, accessToken } = body

    const hasFiles = filesMap && Object.keys(filesMap).length > 0
    if (!repo?.trim() || !branch?.trim() || !accessToken) {
      return NextResponse.json(
        { error: "Missing repo, branch, or accessToken" },
        { status: 400 }
      )
    }
    if (!hasFiles && code == null) {
      return NextResponse.json(
        { error: "Missing code or files" },
        { status: 400 }
      )
    }

    const [owner, repoName] = repo.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "").split("/")
    if (!owner || !repoName) {
      return NextResponse.json({ error: "Invalid repo: use owner/repo" }, { status: 400 })
    }

    const octokit = new Octokit({ auth: accessToken })

    const defaultBranch = "main"
    const ref = await octokit.rest.git.getRef({ owner, repo: repoName, ref: `heads/${defaultBranch}` }).catch(() => null)
    if (!ref?.data?.object?.sha) {
      return NextResponse.json({ error: "Could not get default branch. Use main or master." }, { status: 400 })
    }
    const baseSha = ref.data.object.sha

    await octokit.rest.git.createRef({
      owner,
      repo: repoName,
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    })

    const filesToPush = hasFiles
      ? Object.entries(filesMap!)
      : [["solution.js", code as string]]

    for (const [path, fileContent] of filesToPush) {
      const content = Buffer.from(fileContent, "utf8").toString("base64")
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo: repoName,
        path: path,
        message: commitMessage || `Interna: ${projectTitle}`,
        content,
        branch,
      })
    }

    const pr = await octokit.rest.pulls.create({
      owner,
      repo: repoName,
      title: `[Interna] ${projectTitle}`,
      head: branch,
      base: defaultBranch,
      body: `Solution for **${projectTitle}** (Interna. Virtual internship).`,
    })

    return NextResponse.json({
      success: true,
      prUrl: pr.data.html_url,
      branch,
      repo: `${owner}/${repoName}`,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "GitHub push failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
