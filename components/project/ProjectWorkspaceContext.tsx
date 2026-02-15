"use client"

import { createContext, useContext, useState, useCallback } from "react"

type ProjectWorkspaceContextType = {
  code: string
  setCode: (code: string) => void
}

const ProjectWorkspaceContext = createContext<ProjectWorkspaceContextType | null>(null)

export function ProjectWorkspaceProvider({
  children,
  initialCode,
}: {
  children: React.ReactNode
  initialCode?: string
}) {
  const [code, setCode] = useState(initialCode ?? "// Your code here\n")
  return (
    <ProjectWorkspaceContext.Provider value={{ code, setCode }}>
      {children}
    </ProjectWorkspaceContext.Provider>
  )
}

export function useProjectWorkspace() {
  const ctx = useContext(ProjectWorkspaceContext)
  if (!ctx) return { code: "", setCode: () => {} }
  return ctx
}
