"use client"

import { Code, Terminal } from "lucide-react"

export function IDEPlaceholder() {
    return (
        <div className="flex h-full flex-col bg-[#1e1e1e]">
            {/* IDE Header */}
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#252526] px-4 py-2">
                <Code className="h-4 w-4 text-white/40" />
                <span className="text-sm font-medium text-white/60">Code Workspace</span>
            </div>

            {/* IDE Body — Empty state */}
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <Terminal className="h-8 w-8 text-white/20" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white/40">IDE Workspace</p>
                        <p className="mt-1 text-xs text-white/20">Coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
