"use client"

import { motion } from "motion/react"
import { ExternalLink, BookOpen, Video, Code2, GraduationCap } from "lucide-react"
import Link from "next/link"

export interface Resource {
    title: string
    url: string
    type: "documentation" | "tutorial" | "library" | "video"
    description: string
}

interface ProjectResourcesProps {
    resources: Resource[]
}

const typeIcons: Record<string, any> = {
    documentation: BookOpen,
    tutorial: GraduationCap,
    library: Code2,
    video: Video,
}

const typeColors: Record<string, string> = {
    documentation: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    tutorial: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    library: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    video: "text-red-400 bg-red-500/10 border-red-500/20",
}

export function ProjectResources({ resources }: ProjectResourcesProps) {
    if (!resources || resources.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center">
                <p className="text-white/50">No resources available for this project yet.</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto bg-black p-6 md:p-10 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div>
                    <h2 className="text-3xl font-bold text-white">Resource Hub</h2>
                    <p className="text-white/60 mt-2">
                        Curated materials to help you build this project.
                    </p>
                </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource, i) => {
                    const Icon = typeIcons[resource.type] || BookOpen
                    const colorClass = typeColors[resource.type] || typeColors.documentation

                    return (
                        <motion.a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1"
                        >
                            <div className="space-y-4">
                                <div className={`w-fit rounded-lg p-3 ${colorClass}`}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                                        {resource.title}
                                    </h3>
                                    <p className="text-sm text-white/50 line-clamp-3 leading-relaxed">
                                        {resource.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between text-xs font-medium text-white/40 group-hover:text-white/80 transition-colors">
                                <span className="uppercase tracking-wider rounded-full bg-white/5 px-2 py-0.5">{resource.type}</span>
                                <ExternalLink className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                            </div>
                        </motion.a>
                    )
                })}
            </div>
        </div>
    )
}
