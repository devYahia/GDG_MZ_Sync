"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Terminal, Loader2, Mail, Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { login } from "../actions"

export default function LoginPage() {
    const [isPending, startTransition] = useTransition()

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await login(formData)

            if (result?.error) {
                toast.error(result.error)
            }
        })
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 bg-black text-white selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link
                    href="/"
                    className="mb-8 flex items-center justify-center gap-2 group"
                >
                    <Terminal className="h-6 w-6 text-purple-500 transition-transform group-hover:scale-110" />
                    <span className="text-xl font-bold tracking-tight font-logo">
                        Interna<span className="text-purple-500">.</span> Virtual
                    </span>
                </Link>

                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                            Welcome back
                        </h1>
                        <p className="text-white/50 text-sm mt-2">
                            Sign in to continue your internship
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white/70">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    disabled={isPending}
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/70">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Min. 6 characters"
                                    required
                                    disabled={isPending}
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 group glass-card transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)] rounded-lg font-medium text-white"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-xs text-white/40">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                <p className="mt-8 text-center font-mono text-xs text-white/20">
                    Built for GDG Hackathon 2026
                </p>
            </div>
        </div>
    )
}
