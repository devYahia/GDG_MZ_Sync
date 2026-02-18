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
  credits,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  credits: number
}) {
  const pathname = usePathname()
  const { width } = useSidebar()
  const isProjectPage = /^\/dashboard\/project(\/|$)/.test(pathname ?? "")
  const isIDEPage = pathname === "/ide"

  if (isProjectPage || isIDEPage) {
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
        <AppNavbar userName={userName} userEmail={userEmail} credits={credits} />
        <main className="flex-1 p-6">{children}</main>
      </motion.div>
    </>
  )
}

interface DashboardShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
  credits?: number
  showOnboarding?: boolean
}


export function DashboardShell({ children, userName, userEmail, credits = 0, showOnboarding = false }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardShellInner userName={userName} userEmail={userEmail} credits={credits}>
        {children}
      </DashboardShellInner>
      <LiquidGlassBubble
        userName={userName}
        showOnboarding={showOnboarding}
      />
    </SidebarProvider>
  )
}
