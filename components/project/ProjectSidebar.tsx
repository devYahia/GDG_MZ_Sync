"use client"

import { FileText, MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarItem {
    id: string
    label: string
    type: "description" | "persona"
    icon?: React.ReactNode
}

interface ProjectSidebarProps {
    items: SidebarItem[]
    activeId: string
    onSelect: (id: string) => void
}

export function ProjectSidebar({ items, activeId, onSelect }: ProjectSidebarProps) {
    return (
        <div className="flex h-full w-full flex-col bg-muted/20 border-r border-border">
            {/* Sidebar Header */}
            <div className="shrink-0 border-b border-border px-4 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Navigation
                </h3>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            activeId === item.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                        )}
                    >
                        <span className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                            activeId === item.id
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground/60"
                        )}>
                            {item.type === "description" ? (
                                <FileText className="h-3.5 w-3.5" />
                            ) : (
                                <MessageCircle className="h-3.5 w-3.5" />
                            )}
                        </span>
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="shrink-0 border-t border-border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                    <Users className="h-3 w-3" />
                    <span>{items.filter(i => i.type === "persona").length} Personas</span>
                </div>
            </div>
        </div>
    )
}
