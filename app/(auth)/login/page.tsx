"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Loader2, Mail, Lock, Terminal } from "lucide-react"
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

                    {/* Google OAuth - Postponed for demo, can be activated later */}
                    {/* 
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/50 px-2 text-white/40 backdrop-blur-sm">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-normal relative overflow-hidden group"
                        onClick={() => {
                            startTransition(async () => {
                                await signInWithGoogle()
                            })
                        }}
                        disabled={isPending}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                    */}

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
