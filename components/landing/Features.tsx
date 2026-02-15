"use client"

import { motion } from "motion/react"
import { Users, Terminal, MessageSquare, Mic, Briefcase, GitBranch } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { cn } from "@/lib/utils"

const features = [
  {
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    icon: Users,
    title: "Adaptive AI Personas",
    description: "Master stakeholder management by interacting with diverse, AI-driven professional temperaments.",
  },
  {
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]",
    icon: Terminal,
    title: "Production Sandbox",
    description: "Escape the 'Notebook Trap'. Deploy to live environments and handle real-world chaos events.",
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/9/2/13]",
    icon: MessageSquare,
    title: "Jargon Barrier Dismantled",
    description: "Real-time analysis of your communication clarity and 'jargon-to-value' ratio.",
  },
  {
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:2/1/3/5]",
    icon: Mic,
    title: "Voice Intelligence",
    description: "Practice explaining complex concepts to non-technical stakeholders via voice notes.",
  },
  {
    area: "md:[grid-area:3/1/4/7] xl:[grid-area:2/5/3/9]",
    icon: Briefcase,
    title: "Market-Grounded Data",
    description: "Projects modeled after scraped freelance contracts, not academic toys.",
  },
  {
    area: "md:[grid-area:3/7/4/13] xl:[grid-area:2/9/3/13]",
    icon: GitBranch,
    title: "Git-Integrated Workflow",
    description: "Success is measured by PR approvals and version control history, not just code output.",
  },
]

export function Features() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      {features.map((item, i) => (
        <GridItem key={item.title} {...item} index={i} />
      ))}
    </ul>
  )
}

interface GridItemProps {
  area: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  index: number
}

function GridItem({ area, icon: Icon, title, description, index }: GridItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("min-h-[14rem] list-none", area)}
    >
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2 md:rounded-[1.5rem] md:p-3"
      >
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/5 bg-black/40 p-6 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.2)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-fit rounded-lg border-[0.75px] border-white/10 bg-white/5 p-2.5 text-white"
            >
              <Icon className="h-4 w-4" />
            </motion.div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl font-semibold leading-[1.375rem] tracking-[-0.04em] text-white md:text-2xl md:leading-[1.875rem] text-balance">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] text-white/50 md:text-base md:leading-[1.375rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.li>
  )
}
