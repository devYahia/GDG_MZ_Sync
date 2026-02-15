import Link from "next/link"
import { Terminal, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

import { signout } from "@/app/(auth)/actions"

interface DashboardNavbarProps {
    userEmail: string
    userName: string
}

export function DashboardNavbar({ userEmail, userName }: DashboardNavbarProps) {
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <Terminal className="h-5 w-5 text-purple-500 transition-transform group-hover:scale-110" />
                    <span className="text-lg font-bold tracking-tight text-white font-logo">
                        Interna<span className="text-purple-500">.</span> Virtual
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-white">{userName}</p>
                            <p className="text-xs text-white/50">
                                {userEmail}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-bold text-purple-400">
                            {initials}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <form action={signout}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/50 hover:text-white hover:bg-white/5"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
