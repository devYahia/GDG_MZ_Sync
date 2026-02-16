"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
    Terminal,
    Loader2,
    Mail,
    Lock,
    User,
    Check,
    MapPin,
    Shield,
    MailCheck,
    ArrowRight,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FIELD_CONFIG, type TaskField } from "@/lib/tasks"

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

type Step = 1 | 2

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1)
    const [isPending, startTransition] = useTransition()

    // Step 1 data
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [region, setRegion] = useState("")
    const [field, setField] = useState<TaskField | "">("")

    function handleStep1() {
        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !region.trim() || !field) {
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
                field,
            })

            if (result?.error) {
                toast.error(result.error)
                return
            }

            if (result?.success) {
                toast.success(result.success)
                setStep(2)
            }
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

                {/* Progress Bar */}
                <div className="mb-6 flex items-center gap-2">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step
                                ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                : "bg-white/10"
                                }`}
                        />
                    ))}
                </div>
                <p className="mb-4 text-center text-xs text-white/40">
                    Step {step} of 2
                </p>

                <div className="glass-card rounded-2xl p-8 shadow-2xl">
                    {/* Step 1: Account */}
                    {step === 1 && (
                        <>
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
                                            { label: "Special char (!@#...)", met: /[!@#$%^&*()_+\-=\[\]{};':"|<>?,./`~]/.test(password) },
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
                                <div className="space-y-3">
                                    <Label className="text-white/70">Select Your Track</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {(Object.entries(FIELD_CONFIG) as [TaskField, typeof FIELD_CONFIG[TaskField]][]).map(([key, cfg]) => {
                                            const Icon = cfg.icon
                                            const isSelected = field === key
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setField(key)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200",
                                                        isSelected
                                                            ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]"
                                                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                                        isSelected ? cfg.bg : "bg-white/5"
                                                    )}>
                                                        <Icon className={cn("h-4 w-4", isSelected ? cfg.color : "text-white/40")} />
                                                    </div>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider",
                                                        isSelected ? "text-white" : "text-white/40"
                                                    )}>
                                                        {cfg.label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 hover:shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] transition-all duration-300 rounded-lg font-medium text-white"
                                    disabled={isPending}
                                    onClick={handleStep1}
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

                                {/* Google OAuth - Postponed for demo, can be activated later */}
                                {/* 
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black/50 px-2 text-white/40 backdrop-blur-sm">
                                            Or check in with
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
                        </>
                    )}

                    {/* Step 2: Check Your Email */}
                    {step === 2 && (
                        <>
                            <div className="text-center mb-6">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30">
                                    <MailCheck className="h-8 w-8 text-purple-400" />
                                </div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    Check your email
                                </h1>
                                <p className="text-white/50 text-sm mt-3">
                                    We sent a confirmation link to
                                </p>
                                <p className="text-purple-300 font-medium mt-1">
                                    {email}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                                            <Check className="h-3 w-3 text-purple-400" />
                                        </div>
                                        <p className="text-sm text-white/70">
                                            Open the email from Interna
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                                            <Check className="h-3 w-3 text-purple-400" />
                                        </div>
                                        <p className="text-sm text-white/70">
                                            Click the confirmation link
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                                            <Check className="h-3 w-3 text-purple-400" />
                                        </div>
                                        <p className="text-sm text-white/70">
                                            You will be redirected to complete your profile
                                        </p>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-white/40">
                                    Didn&apos;t receive the email? Check your spam folder or{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            startTransition(async () => {
                                                const result = await signup({
                                                    email,
                                                    password,
                                                    confirmPassword,
                                                    fullName,
                                                    region,
                                                    field: field || "",
                                                })
                                                if (result?.error) {
                                                    toast.error(result.error)
                                                } else if (result?.success) {
                                                    toast.success("Confirmation email resent!")
                                                }
                                            })
                                        }}
                                        disabled={isPending}
                                        className="text-purple-400 hover:underline hover:text-purple-300 disabled:opacity-50"
                                    >
                                        {isPending ? "Sending..." : "resend it"}
                                    </button>
                                </p>

                                <div className="pt-2">
                                    <Link
                                        href="/login"
                                        className="block text-center text-sm text-white/50 hover:text-white/70 transition-colors"
                                    >
                                        Back to sign in
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <p className="mt-8 text-center font-mono text-xs text-white/20">
                    Built for GDG Hackathon 2026
                </p>
            </div >
        </div >
    )
}
