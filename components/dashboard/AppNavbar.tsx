"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, LogOut, ChevronDown, User } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { signout } from "@/app/(auth)/actions"

interface AppNavbarProps {
  userName: string
  userEmail: string
}

export function AppNavbar({ userName, userEmail }: AppNavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      {/* Spacer (search removed — ProjectGallery has its own) */}
      <div className="flex-1" />

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
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
                  <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                    <span className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                      <User className="h-4 w-4" />
                      Profile
                    </span>
                  </Link>
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
  )
}
