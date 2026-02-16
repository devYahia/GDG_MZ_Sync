"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Code2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/dashboard/SidebarContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AppSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban, exact: false },
  { href: "/ide", label: "IDE", icon: Code2, exact: false },
  { href: "/dashboard/progress", label: "My Progress", icon: Target, exact: false },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen, exact: false },
]

const bottomItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "#", label: "Log out", icon: LogOut, action: "logout" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, setCollapsed, width } = useSidebar()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname?.startsWith("/dashboard/project")
    return pathname?.startsWith(href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card/95 backdrop-blur-xl",
        "shadow-xl shadow-black/5"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-3">
        <Link
          href="/dashboard"
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg py-2"
        >
          {/* Small purple "iv" mark for collapsed state */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
            <span className="text-sm font-black tracking-tighter text-primary font-logo select-none">iv</span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col leading-none overflow-hidden"
              >
                <span className="text-sm font-black tracking-tight text-foreground font-logo whitespace-nowrap">
                  INTER<span className="text-primary">NA</span><span className="text-primary">.</span>
                </span>
                <span className="text-[9px] font-bold tracking-wider text-muted-foreground font-logo whitespace-nowrap">
                  <span className="text-primary">V</span>IRTUAL
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.label} href={item.href}>
              <motion.span
                whileHover={{ x: active ? 0 : 2 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary-foreground" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-2 bg-border" />

      {/* Bottom: Theme + Profile/Settings */}
      <div className="flex flex-col gap-1 p-2">

        {bottomItems.map((item) => {
          const Icon = item.icon
          const content = (
            <span
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground cursor-pointer"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </span>
          )

          if ('action' in item && item.action === "logout") {
            return (
              <button key={item.label} onClick={handleLogout} className="w-full text-left">
                {content}
              </button>
            )
          }

          return (
            <Link key={item.label} href={item.href}>
              {content}
            </Link>
          )
        })}
      </div>
    </motion.aside>
  )
}
