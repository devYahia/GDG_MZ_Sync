"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { BookOpen, Target, Calendar, HelpCircle } from "lucide-react"

const links = [
  { href: "/dashboard", label: "Resources", icon: BookOpen, desc: "Guides & docs" },
  { href: "/dashboard", label: "My progress", icon: Target, desc: "Track completion" },
  { href: "/dashboard", label: "Schedule", icon: Calendar, desc: "Upcoming sessions" },
  { href: "/dashboard", label: "Help", icon: HelpCircle, desc: "FAQ & support" },
]

export function QuickAccess() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="rounded-2xl border border-border bg-card/30 p-4"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick access
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.label} href={link.href}>
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-medium">{link.label}</span>
                <span className="hidden text-muted-foreground sm:inline">— {link.desc}</span>
              </motion.span>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
