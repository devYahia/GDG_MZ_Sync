"use client"

import { createContext, useContext, useState } from "react"

type SidebarContextType = {
  collapsed: boolean
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void
  width: number
}

const SidebarContext = createContext<SidebarContextType | null>(null)

const SIDEBAR_WIDTH = 260
const SIDEBAR_WIDTH_COLLAPSED = 72

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH
  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        width,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}

export { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED }
