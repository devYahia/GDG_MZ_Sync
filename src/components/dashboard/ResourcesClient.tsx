"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ExternalLink, Search, FilterX } from "lucide-react"
import { cn } from "@/lib/utils"
import { FIELD_CONFIG, type TaskField } from "@/lib/tasks"
import { RESOURCES, RESOURCE_TYPE_ICONS } from "@/lib/resources"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ResourcesClientProps {
    initialTrack?: TaskField
}

export function ResourcesClient({ initialTrack }: ResourcesClientProps) {
    const [selectedTrack, setSelectedTrack] = useState<TaskField | "all">(initialTrack || "all")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredResources = RESOURCES.filter((res) => {
        const matchesTrack = selectedTrack === "all" || res.track === selectedTrack
        const matchesSearch =
            res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesTrack && matchesSearch
    })

    return (
        <div className="space-y-8 pb-12">
            {/* Header section */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Curated <span className="text-primary italic">Resources</span>
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    Top-tier learning materials selected for each track to help you master your skills and excel in your virtual internship.
                </p>
            </div>

            {/* Controls: Search + Filter Bar */}
            <div className="flex flex-col gap-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search resources, topics, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/40 border-border focus:ring-primary/20"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedTrack === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTrack("all")}
                        className={cn(
                            "rounded-full px-4 h-9 font-medium transition-all duration-300",
                            selectedTrack === "all" ? "shadow-lg shadow-primary/20" : "bg-card/40 border-border hover:bg-accent"
                        )}
                    >
                        All Tracks
                    </Button>
                    {(Object.entries(FIELD_CONFIG) as [TaskField, typeof FIELD_CONFIG[TaskField]][]).map(([key, cfg]) => {
                        const Icon = cfg.icon
                        const isSelected = selectedTrack === key
                        return (
                            <Button
                                key={key}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTrack(key)}
                                className={cn(
                                    "rounded-full px-4 h-9 font-medium transition-all duration-300 group",
                                    isSelected
                                        ? cn("shadow-lg border-transparent", cfg.bg, cfg.color, "hover:opacity-90")
                                        : "bg-card/40 border-border hover:bg-accent"
                                )}
                            >
                                <Icon className={cn("mr-2 h-3.5 w-3.5", isSelected ? "" : "text-muted-foreground group-hover:text-foreground")} />
                                {cfg.label}
                            </Button>
                        )
                    })}
                </div>
            </div>

            {/* Resources Grid */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {filteredResources.length > 0 ? (
                        <motion.div
                            key={selectedTrack + searchQuery}
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {filteredResources.map((resource) => {
                                const TypeIcon = RESOURCE_TYPE_ICONS[resource.type]
                                const trackCfg = FIELD_CONFIG[resource.track]

                                return (
                                    <motion.a
                                        key={resource.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 15, scale: 0.98 },
                                            show: {
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 100,
                                                    damping: 15
                                                }
                                            }
                                        }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/40 p-6 transition-colors hover:bg-card/60 hover:shadow-2xl hover:shadow-black/10 backdrop-blur-sm"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-xl",
                                                    trackCfg.bg,
                                                    trackCfg.color
                                                )}>
                                                    <TypeIcon className="h-5 w-5" />
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                                                    {resource.title}
                                                </h3>
                                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground/80 font-medium leading-relaxed">
                                                    {resource.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-1.5">
                                            {resource.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors group-hover:border-white/10 group-hover:bg-white/[0.05] group-hover:text-muted-foreground/90"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.a>
                                )
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="rounded-2xl bg-muted/30 p-6 mb-4 border border-border/50">
                                <FilterX className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold">No resources found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">
                                Try adjusting your search or track filters to find what you're looking for.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => { setSelectedTrack("all"); setSearchQuery(""); }}
                                className="mt-6 rounded-full"
                            >
                                Clear all filters
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
