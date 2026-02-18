"use client"

import { motion } from "motion/react"
import { FolderKanban, Target, TrendingUp, Zap } from "lucide-react"
import { TASKS } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const stats = [
  {
    label: "Total projects",
    value: TASKS.length,
    icon: FolderKanban,
    color: "from-violet-500/20 to-purple-600/20 border-violet-500/30 text-violet-600 dark:text-violet-400",
  },
  {
    label: "Levels available",
    value: "1–7",
    icon: Target,
    color: "from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-600 dark:text-amber-400",
  },
  {
    label: "Tracks",
    value: "6",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Quick start",
    value: "Pick one",
    icon: Zap,
    color: "from-rose-500/20 to-pink-600/20 border-rose-500/30 text-rose-600 dark:text-rose-400",
  },
]

export function HomeStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10",
              "hover:-translate-y-0.5",
              stat.color
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-xl bg-background/60 p-2.5 transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
