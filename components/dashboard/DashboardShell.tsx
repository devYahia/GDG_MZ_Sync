"use client"

import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { AppNavbar } from "@/components/dashboard/AppNavbar"
import { SidebarProvider, useSidebar } from "@/components/dashboard/SidebarContext"
import { LiquidGlassBubble } from "@/components/dashboard/LiquidGlassBubble"

function DashboardShellInner({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
}) {
  const pathname = usePathname()
  const { width } = useSidebar()
  const isProjectPage = pathname?.startsWith("/dashboard/project")

  if (isProjectPage) {
    return <>{children}</>
  }

  return (
    <>
      <AppSidebar />
      <motion.div
        className="min-h-screen flex flex-col"
        initial={false}
        animate={{ marginLeft: width }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AppNavbar userName={userName} userEmail={userEmail} />
        <main className="flex-1 p-6">{children}</main>
      </motion.div>
    </>
  )
}

interface DashboardShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
  showOnboarding?: boolean
}


export function DashboardShell({ children, userName, userEmail, showOnboarding = false }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardShellInner userName={userName} userEmail={userEmail}>
        {children}
      </DashboardShellInner>
      <LiquidGlassBubble
        userName={userName}
        showOnboarding={showOnboarding}
      />
    </SidebarProvider>
  )
}
