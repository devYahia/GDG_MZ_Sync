import Link from "next/link"
import { LogOut } from "lucide-react"

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
        <header className="sticky top-0 z-50 border-b border-border bg-background/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-1.5 group">
                    <span className="text-lg font-black tracking-tight text-foreground font-logo">
                        INTER<span className="text-primary">NA</span><span className="text-primary">.</span>
                    </span>
                    <span className="text-sm font-bold tracking-tight text-foreground font-logo">
                        <span className="text-primary">V</span>IRTUAL
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-foreground">{userName}</p>
                            <p className="text-xs text-muted-foreground">
                                {userEmail}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary">
                            {initials}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <form action={signout}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
