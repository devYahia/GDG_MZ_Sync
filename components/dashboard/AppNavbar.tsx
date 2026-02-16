"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut, ChevronDown, User, Sun, Moon, Coins, Plus } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { signout } from "@/app/(auth)/actions"
import { CreditsPurchaseModal } from "@/components/dashboard/CreditsPurchaseModal"

interface AppNavbarProps {
  userName: string
  userEmail: string
  credits?: number
}

export function AppNavbar({ userName, userEmail, credits = 0 }: AppNavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [creditsModalOpen, setCreditsModalOpen] = useState(false)
  const [displayCredits, setDisplayCredits] = useState(credits)
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useState(() => { setMounted(true) })

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Credits + Theme Toggle + User */}
        <div className="flex items-center gap-2">
          {/* Credits Badge -- opens purchase modal */}
          <button
            onClick={() => setCreditsModalOpen(true)}
            className="group flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-50 dark:bg-purple-500/5 px-3 py-2 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-purple-100 dark:hover:bg-purple-500/10 hover:shadow-[0_0_16px_-4px_rgba(168,85,247,0.3)]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/30 to-violet-600/30 shadow-inner">
              <Coins className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
            </div>
            <span className="text-sm font-semibold tabular-nums text-purple-700 dark:text-purple-200 group-hover:text-purple-800 dark:group-hover:text-purple-100">
              {displayCredits.toLocaleString()}
            </span>
            <span className="hidden text-xs font-medium text-purple-500/60 dark:text-purple-400/60 sm:inline">credits</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="h-3 w-3" />
            </div>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground overflow-hidden"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
            <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              className="flex h-10 gap-2 rounded-xl px-2 py-1.5 text-left"
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              <Avatar className="h-8 w-8 rounded-lg border-2 border-border">
                <AvatarFallback className="rounded-lg bg-primary/20 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{userEmail}</span>
              </div>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")}
              />
            </Button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card py-1 shadow-xl"
                  >
                    <div className="border-b border-border px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{userName}</p>
                      <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                    <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)}>
                      <span className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                        <User className="h-4 w-4" />
                        Profile
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        setCreditsModalOpen(true)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Coins className="h-4 w-4" />
                      Buy Credits
                    </button>
                    <form action={signout}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Credits Purchase Modal */}
      <CreditsPurchaseModal
        isOpen={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
        currentCredits={displayCredits}
        onCreditsUpdated={(newCredits) => setDisplayCredits(newCredits)}
      />
    </>
  )
}
