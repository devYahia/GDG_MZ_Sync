"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Terminal,
    Loader2,
    Mail,
    Lock,
    User,
    ArrowRight,
    MapPin,
    Shield,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signup } from "../actions"

const REGIONS = [
    "North America",
    "South America",
    "Europe",
    "Africa",
    "Asia",
    "Oceania",
    "Middle East",
]

export default function SignupPage() {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Form data
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [region, setRegion] = useState("")

    function handleSignup() {
        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !region.trim()) {
            toast.error("Please fill in all fields")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords don't match")
            return
        }

        startTransition(async () => {
            const result = await signup({
                email,
                password,
                confirmPassword,
                fullName,
                region,
            })

            if (result?.error) {
                toast.error(result.error)
                return
            }

            // If we get a success message (auto-login failed), redirect to login
            if (result?.success) {
                toast.success(result.success)
                router.push("/login")
            }
            // Otherwise the server action already redirected to /dashboard
        })
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-black text-white selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Logo */}
                <Link
                    href="/"
                    className="mb-6 flex items-center justify-center gap-2 group"
                >
                    <Terminal className="h-6 w-6 text-purple-500 transition-transform group-hover:scale-110" />
                    <span className="text-xl font-bold tracking-tight font-logo">
                        Interna<span className="text-purple-500">.</span> Virtual
                    </span>
                </Link>

                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    Create your account
                                </h1>
                                <p className="text-white/50 text-sm mt-2">
                                    Start your virtual internship journey
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-white/70">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            disabled={isPending}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white/70">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            disabled={isPending}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="region" className="text-white/70">Region</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <select
                                            id="region"
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            disabled={isPending}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white [&>option]:bg-black [&>option]:text-white"
                                        >
                                            <option value="">Select your region</option>
                                            {REGIONS.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white/70">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Secure password"
                                            disabled={isPending}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        />
                                    </div>

                                    {/* Real-time Password Validation */}
                                    <div className="mt-2 grid grid-cols-2 gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                                        {[
                                            { label: "Min. 6 chars", met: password.length >= 6 },
                                            { label: "Lowercase (a-z)", met: /[a-z]/.test(password) },
                                            { label: "Uppercase (A-Z)", met: /[A-Z]/.test(password) },
                                            { label: "Number (0-9)", met: /[0-9]/.test(password) },
                                            { label: "Special char (!@#...)", met: /[!@#$%^&*()_+\-=\[\]{};':"|\<\>?,./`~]/.test(password) },
                                        ].map((req, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${req.met ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/20"}`} />
                                                <span className={`text-[10px] transition-colors duration-300 ${req.met ? "text-white/80" : "text-white/30"}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-white/70">Confirm Password</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            disabled={isPending}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 hover:shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] transition-all duration-300 rounded-lg font-medium text-white"
                                    disabled={isPending}
                                    onClick={handleSignup}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-white/40">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="text-purple-400 underline-offset-4 hover:underline hover:text-purple-300"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                </div>

                <p className="mt-8 text-center font-mono text-xs text-white/20">
                    Built for GDG Hackathon 2026
                </p>
            </div>
        </div >
    )
}
