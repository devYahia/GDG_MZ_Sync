"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import {
    Terminal,
    Loader2,
    Mail,
    Lock,
    User,
    ArrowRight,
    ArrowLeft,
    Check,
    Code,
    Server,
    Layers,
    Smartphone,
    BarChart3,
    Palette,
    GraduationCap,
    Briefcase,
    Rocket,
    MapPin,
    Shield,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signup, verifyEmailOtp, resendEmailOtp, completeOnboarding } from "../actions"

const FIELDS = [
    { value: "frontend", label: "Frontend", icon: Code, color: "text-blue-400" },
    { value: "backend", label: "Backend", icon: Server, color: "text-green-400" },
    { value: "fullstack", label: "Full Stack", icon: Layers, color: "text-purple-400" },
    { value: "mobile", label: "Mobile", icon: Smartphone, color: "text-orange-400" },
    { value: "data", label: "Data / AI", icon: BarChart3, color: "text-cyan-400" },
    { value: "design", label: "Design", icon: Palette, color: "text-pink-400" },
] as const

const LEVELS = [
    {
        value: "student",
        label: "Student",
        desc: "Currently studying CS or related field",
        icon: GraduationCap,
    },
    {
        value: "fresh_grad",
        label: "Fresh Graduate",
        desc: "Graduated within the last year",
        icon: Briefcase,
    },
    {
        value: "junior",
        label: "Junior Developer",
        desc: "Less than 2 years of experience",
        icon: Rocket,
    },
] as const

const INTERESTS = [
    "React", "Next.js", "Vue", "Angular", "Node.js", "Python",
    "Django", "FastAPI", "Flutter", "React Native", "Swift", "Kotlin",
    "PostgreSQL", "MongoDB", "Docker", "AWS", "Figma", "UI/UX",
    "Machine Learning", "Data Analysis", "GraphQL", "REST APIs",
    "TypeScript", "Go", "Rust", "System Design",
]

const REGIONS = [
    "North America",
    "South America",
    "Europe",
    "Africa",
    "Asia",
    "Oceania",
    "Middle East",
]

type Step = 1 | 1.5 | 2 | 3 | 4

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1)
    const [isPending, startTransition] = useTransition()

    // Step 1 data
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [region, setRegion] = useState("")

    // Step 1.5 data (OTP verification)
    const [otpCode, setOtpCode] = useState("")
    const [resendCountdown, setResendCountdown] = useState(0)

    // Step 2-4 data
    const [field, setField] = useState("")
    const [experienceLevel, setExperienceLevel] = useState("")
    const [interests, setInterests] = useState<string[]>([])

    function handleStep1() {
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

            if (result?.success) {
                toast.success(result.success)
                setStep(1.5)
                setResendCountdown(60)
            }
        })
    }

    function handleStep1_5() {
        if (otpCode.length !== 6) {
            toast.error("Please enter the 6-digit code")
            return
        }

        startTransition(async () => {
            const result = await verifyEmailOtp({
                email,
                token: otpCode,
                fullName,
                region,
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

    async function handleResendCode() {
        if (resendCountdown > 0) return

        const result = await resendEmailOtp(email)
        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success(result.success)
            setResendCountdown(60)
        }
    }

    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setInterval(() => {
                setResendCountdown((prev) => Math.max(0, prev - 1))
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [resendCountdown])


    function handleStep2() {
        if (!field) {
            toast.error("Please select your field")
            return
        }
        setStep(3)
    }

    function handleStep3() {
        if (!experienceLevel) {
            toast.error("Please select your experience level")
            return
        }
        setStep(4)
    }

    function handleStep4() {
        if (interests.length === 0) {
            toast.error("Select at least one interest")
            return
        }

        startTransition(async () => {
            const result = await completeOnboarding({
                field,
                experienceLevel,
                interests,
            })

            if (result?.error) {
                toast.error(result.error)
            }
            // redirect happens in the action on success
        })
    }

    function toggleInterest(interest: string) {
        setInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        )
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
                    {[1, 1.5, 2, 3, 4].map((s) => (
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
                    Step {step === 1.5 ? 2 : step > 1.5 ? step + 1 : step} of 5
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
                                            placeholder="Min. 6 characters"
                                            disabled={isPending}
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        />
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
                                    onClick={handleStep1}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending code...
                                        </>
                                    ) : (
                                        <>
                                            Continue
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
                        </>
                    )}

                    {/* Step 1.5: Email Verification */}
                    {step === 1.5 && (
                        <>
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    Verify your email
                                </h1>
                                <p className="text-white/50 text-sm mt-2">
                                    We sent a 6-digit code to {email}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otpCode" className="text-white/70">Verification Code</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="otpCode"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Enter 6-digit code"
                                            disabled={isPending}
                                            className="pl-10 text-center text-2xl tracking-widest bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 focus:ring-purple-500/20"
                                            maxLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 text-center">
                                        {resendCountdown > 0 ? (
                                            <>Resend code in {resendCountdown}s</>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendCode}
                                                className="text-purple-400 hover:underline hover:text-purple-300"
                                            >
                                                Resend code
                                            </button>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
                                        onClick={() => setStep(1)}
                                        disabled={isPending}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white"
                                        onClick={handleStep1_5}
                                        disabled={isPending || otpCode.length !== 6}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                Verify
                                                <Check className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Step 2: Field */}
                    {
                        step === 2 && (
                            <>
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                        What&apos;s your field?
                                    </h1>
                                    <p className="text-white/50 text-sm mt-2">
                                        We&apos;ll match you with relevant simulations
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {FIELDS.map((f) => (
                                            <button
                                                key={f.value}
                                                type="button"
                                                onClick={() => setField(f.value)}
                                                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${field === f.value
                                                    ? "border-purple-500 bg-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <f.icon className={`h-6 w-6 ${field === f.value ? "text-purple-400" : f.color}`} />
                                                <span className={`text-sm font-medium ${field === f.value ? "text-white" : "text-white/70"}`}>
                                                    {f.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
                                            onClick={() => setStep(1)}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white"
                                            onClick={handleStep2}
                                            disabled={!field}
                                        >
                                            Continue
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    }

                    {/* Step 3: Experience */}
                    {
                        step === 3 && (
                            <>
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                        Experience level
                                    </h1>
                                    <p className="text-white/50 text-sm mt-2">
                                        This helps us calibrate task difficulty
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {LEVELS.map((l) => (
                                            <button
                                                key={l.value}
                                                type="button"
                                                onClick={() =>
                                                    setExperienceLevel(l.value)
                                                }
                                                className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all ${experienceLevel === l.value
                                                    ? "border-purple-500 bg-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${experienceLevel === l.value
                                                        ? "bg-purple-500/20"
                                                        : "bg-white/5"
                                                        }`}
                                                >
                                                    <l.icon
                                                        className={`h-5 w-5 ${experienceLevel === l.value
                                                            ? "text-purple-400"
                                                            : "text-white/50"
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${experienceLevel === l.value ? "text-white" : "text-white/90"}`}>
                                                        {l.label}
                                                    </p>
                                                    <p className="text-xs text-white/50">
                                                        {l.desc}
                                                    </p>
                                                </div>
                                                {experienceLevel === l.value && (
                                                    <Check className="ml-auto h-5 w-5 text-purple-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
                                            onClick={() => setStep(2)}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white"
                                            onClick={handleStep3}
                                            disabled={!experienceLevel}
                                        >
                                            Continue
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    }

                    {/* Step 4: Interests */}
                    {
                        step === 4 && (
                            <>
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                        Pick your interests
                                    </h1>
                                    <p className="text-white/50 text-sm mt-2">
                                        Select technologies you want to work with
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {INTERESTS.map((interest) => (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() =>
                                                    toggleInterest(interest)
                                                }
                                                disabled={isPending}
                                                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${interests.includes(interest)
                                                    ? "border-purple-500 bg-purple-500/20 text-purple-200 shadow-[0_0_10px_-4px_rgba(168,85,247,0.5)]"
                                                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                                                    }`}
                                            >
                                                {interests.includes(interest) && (
                                                    <Check className="mr-1 inline-block h-3 w-3 text-purple-400" />
                                                )}
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-xs text-white/40">
                                        {interests.length} selected
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
                                            onClick={() => setStep(3)}
                                            disabled={isPending}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white"
                                            onClick={handleStep4}
                                            disabled={
                                                isPending ||
                                                interests.length === 0
                                            }
                                        >
                                            {isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Finishing...
                                                </>
                                            ) : (
                                                <>
                                                    Complete Setup
                                                    <Check className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div >

                <p className="mt-8 text-center font-mono text-xs text-white/20">
                    Built for GDG Hackathon 2026
                </p>
            </div >
        </div >
    )
}
