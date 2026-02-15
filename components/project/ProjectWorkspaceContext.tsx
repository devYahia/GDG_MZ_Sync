"use client"

import { createContext, useContext, useState, useCallback } from "react"

const DEFAULT_FILES: Record<string, string> = {
  "src/index.js": "// Entry point – implement your solution here.\n// Use Run (▶) to execute and see output.\n",
  "src/utils.js": "// Helper functions\n\nexport function greet(name) {\n  return `Hello, ${name}!`;\n}\n",
}

export type ProjectWorkspaceContextType = {
  /** All files in the workspace (path -> content) */
  files: Record<string, string>
  /** Currently focused file path */
  activeFileId: string
  /** Set content of a file */
  setFileContent: (path: string, content: string) => void
  /** Switch active file */
  setActiveFileId: (path: string) => void
  /** Add a new file */
  addFile: (path: string, content?: string) => void
  /** Remove a file (cannot remove if it's the only one) */
  removeFile: (path: string) => void
  /** Primary code for backward compat (active file content); used by chat context & single-file push */
  code: string
  /** Update active file content (backward compat) */
  setCode: (code: string) => void
  /** Get full code for push/evaluate (entry file or concatenated) */
  getPrimaryCode: () => string
}

const ProjectWorkspaceContext = createContext<ProjectWorkspaceContextType | null>(null)

export function ProjectWorkspaceProvider({
  children,
  initialCode,
  initialFiles,
}: {
  children: React.ReactNode
  initialCode?: string
  initialFiles?: Record<string, string>
}) {
  const defaultFiles =
    initialFiles ??
    (initialCode !== undefined
      ? { "solution.js": initialCode }
      : {
          "src/index.js": "// Entry point – implement your solution here.\n// Use Run (▶) to execute and see output.\n",
          "src/utils.js": "// Helper functions\n\nexport function greet(name) {\n  return `Hello, ${name}!`;\n}\n",
        })
  const [files, setFiles] = useState<Record<string, string>>(defaultFiles)
  const filePaths = Object.keys(files)
  const [activeFileId, setActiveFileIdState] = useState<string>(filePaths[0] ?? "solution.js")

  const setActiveFileId = useCallback((path: string) => {
    setActiveFileIdState((prev) => (files[path] !== undefined ? path : prev))
  }, [files])

  const setFileContent = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }))
  }, [])

  const addFile = useCallback((path: string, content = "// New file\n") => {
    setFiles((prev) => ({ ...prev, [path]: content }))
    setActiveFileIdState(path)
  }, [])

  const removeFile = useCallback((path: string) => {
    const next = { ...files }
    delete next[path]
    if (Object.keys(next).length === 0) return
    setFiles(next)
    if (activeFileId === path) {
      setActiveFileIdState(Object.keys(next)[0])
    }
  }, [files, activeFileId])

  const code = files[activeFileId] ?? ""
  const setCode = useCallback(
    (c: string) => {
      setFileContent(activeFileId, c)
    },
    [activeFileId, setFileContent]
  )

  const getPrimaryCode = useCallback(() => {
    const entry = filePaths.find((p) => p === "src/index.js" || p === "index.js") ?? filePaths[0]
    return entry ? (files[entry] ?? "") : code
  }, [files, filePaths, code])

  const value: ProjectWorkspaceContextType = {
    files,
    activeFileId,
    setFileContent,
    setActiveFileId,
    addFile,
    removeFile,
    code,
    setCode,
    getPrimaryCode,
  }

  return (
    <ProjectWorkspaceContext.Provider value={value}>
      {children}
    </ProjectWorkspaceContext.Provider>
  )
}

export function useProjectWorkspace() {
  const ctx = useContext(ProjectWorkspaceContext)
  if (!ctx)
    return {
      code: "",
      setCode: () => {},
      files: {} as Record<string, string>,
      activeFileId: "solution.js",
      setFileContent: () => {},
      setActiveFileId: () => {},
      addFile: () => {},
      removeFile: () => {},
      getPrimaryCode: () => "",
    }
  return ctx
}
