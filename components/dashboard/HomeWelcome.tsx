"use client"

import { motion } from "motion/react"
import { Rocket } from "lucide-react"
import { FIELD_CONFIG } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const levelLabels: Record<string, string> = {
  student: "Student",
  fresh_grad: "Fresh Graduate",
  junior: "Junior Developer",
}

interface HomeWelcomeProps {
  userName: string
  fieldKey: string
  experienceLevel: string
}

export function HomeWelcome({ userName, fieldKey, experienceLevel }: HomeWelcomeProps) {
  const fieldConfig = FIELD_CONFIG[fieldKey as keyof typeof FIELD_CONFIG] ?? FIELD_CONFIG.frontend
  const FieldIcon = fieldConfig.icon

  const firstName = userName.split(" ")[0] ?? "there"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-violet-400 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Career Track:</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                  fieldConfig.bg,
                  fieldConfig.color,
                  "border-current/20 shadow-sm"
                )}
              >
                <FieldIcon className="h-3.5 w-3.5" />
                {fieldConfig.label}
              </span>
            </div>
            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Level:</span>
              <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                {levelLabels[experienceLevel] ?? experienceLevel}
              </span>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2"
        >
          <Rocket className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Pick a project and start</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
