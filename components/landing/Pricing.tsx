"use client"

import { motion } from "motion/react"
import {
    useState,
    useRef,
    useEffect,
    createContext,
    useContext,
} from "react"
import confetti from "canvas-confetti"
import Link from "next/link"
import { Check, Users, Rocket, Building2, Sparkles } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"

// --- Types ---

interface PricingPlan {
    name: string
    price: string
    yearlyPrice: string
    period: string
    features: string[]
    description: string
    buttonText: string
    href: string
    isPopular?: boolean
    icon: React.ElementType
}

// --- Context ---

const PricingContext = createContext<{
    isMonthly: boolean
    setIsMonthly: (value: boolean) => void
}>({
    isMonthly: true,
    setIsMonthly: () => { },
})

// --- Plans Data ---

const PLANS: PricingPlan[] = [
    {
        name: "Starter",
        price: "0",
        yearlyPrice: "0",
        period: "month",
        features: [
            "1 virtual internship simulation",
            "Basic AI client personas",
            "Community support",
            "Code sandbox access",
            "Performance summary report",
        ],
        description: "Try it free. Perfect for students exploring virtual internships.",
        buttonText: "Start Free",
        href: "/signup",
        icon: Users,
    },
    {
        name: "Pro Intern",
        price: "19",
        yearlyPrice: "15",
        period: "month",
        features: [
            "Unlimited simulations",
            "Advanced AI stakeholders",
            "Priority code reviews",
            "Real-time mentor feedback",
            "Exportable portfolio & certificates",
            "All tracks and difficulty levels",
        ],
        description: "For serious learners who want to stand out to employers.",
        buttonText: "Get Pro Access",
        href: "/signup",
        isPopular: true,
        icon: Rocket,
    },
    {
        name: "Enterprise",
        price: "99",
        yearlyPrice: "79",
        period: "seat/mo",
        features: [
            "Everything in Pro Intern",
            "Custom role simulations",
            "Candidate assessment dashboard",
            "Team management & analytics",
            "SSO & dedicated support",
            "API access for integrations",
        ],
        description: "Simulate roles to find candidates who truly deserve the position.",
        buttonText: "Contact Sales",
        href: "#",
        icon: Building2,
    },
]

// --- Toggle ---

function PricingToggle() {
    const { isMonthly, setIsMonthly } = useContext(PricingContext)
    const monthlyRef = useRef<HTMLButtonElement>(null)
    const annualRef = useRef<HTMLButtonElement>(null)
    const [pillStyle, setPillStyle] = useState({})

    useEffect(() => {
        const btn = isMonthly ? monthlyRef : annualRef
        if (btn.current) {
            setPillStyle({
                width: btn.current.offsetWidth,
                transform: `translateX(${btn.current.offsetLeft}px)`,
            })
        }
    }, [isMonthly])

    const handleToggle = (monthly: boolean) => {
        if (isMonthly === monthly) return
        setIsMonthly(monthly)

        if (!monthly && annualRef.current) {
            const rect = annualRef.current.getBoundingClientRect()
            confetti({
                particleCount: 60,
                spread: 70,
                origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: ["#a855f7", "#7c3aed", "#c084fc", "#e9d5ff"],
                ticks: 200,
                gravity: 1.2,
                decay: 0.94,
                startVelocity: 25,
            })
        }
    }

    return (
        <div className="flex justify-center mb-16">
            {/* Toggle uses liquid-glass pattern: backdrop-blur, border-white/10, inset shadow */}
            <div
                className="relative flex items-center rounded-full border border-white/10 backdrop-blur-3xl p-1 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
                }}
            >
                {/* Glass shine overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-full" />
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full p-1"
                    style={{
                        ...pillStyle,
                        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(124, 58, 237, 0.4))",
                        boxShadow: "0 0 24px rgba(168, 85, 247, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
                <button
                    ref={monthlyRef}
                    onClick={() => handleToggle(true)}
                    className={cn(
                        "relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300",
                        isMonthly ? "text-white" : "text-white/40 hover:text-white/70"
                    )}
                >
                    Monthly
                </button>
                <button
                    ref={annualRef}
                    onClick={() => handleToggle(false)}
                    className={cn(
                        "relative z-10 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-300 flex items-center gap-2",
                        !isMonthly ? "text-white" : "text-white/40 hover:text-white/70"
                    )}
                >
                    Annual
                    <span className={cn(
                        "hidden sm:inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-bold border transition-all",
                        !isMonthly
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-purple-500/20 bg-purple-500/10 text-purple-300"
                    )}>
                        -20%
                    </span>
                </button>
            </div>
        </div>
    )
}

// --- Card ---

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
    const { isMonthly } = useContext(PricingContext)
    const Icon = plan.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="min-h-[32rem] list-none"
        >
            <motion.div
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={cn(
                    "relative h-full rounded-[1.25rem] border-[0.75px] p-2 md:rounded-[1.5rem] md:p-3",
                    plan.isPopular ? "border-purple-500/30" : "border-white/10"
                )}
            >
                {/* GlowingEffect -- matches Features pattern exactly */}
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />

                {/* Inner card -- liquid-glass pattern */}
                <div
                    className={cn(
                        "relative flex h-full flex-col overflow-hidden rounded-xl border-[0.75px] p-6 md:p-8 transition-shadow duration-300 backdrop-blur-3xl",
                        plan.isPopular
                            ? "border-purple-500/20 shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]"
                            : "border-white/5 hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.15)]"
                    )}
                    style={{
                        background: plan.isPopular
                            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(124, 58, 237, 0.06) 100%)"
                            : "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                        boxShadow: plan.isPopular
                            ? "0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(168, 85, 247, 0.15) inset"
                            : "0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
                    }}
                >
                    {/* --- Glass shine overlay (::before equivalent) --- */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03] rounded-xl" />

                    {/* --- Animated Gradient Orbs (LiquidGlassBubble signature) --- */}
                    <motion.div
                        className={cn(
                            "absolute -left-32 -top-32 h-64 w-64 rounded-full blur-3xl",
                            plan.isPopular ? "bg-gradient-to-br from-blue-500/15 to-purple-500/15" : "bg-white/[0.03]"
                        )}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className={cn(
                            "absolute -right-32 -bottom-32 h-64 w-64 rounded-full blur-3xl",
                            plan.isPopular ? "bg-gradient-to-br from-purple-500/15 to-pink-500/15" : "bg-purple-900/[0.04]"
                        )}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />

                    {/* --- Liquid shimmer sweep (LiquidGlassBubble signature) --- */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    />

                    {/* --- Popular Badge --- */}
                    {plan.isPopular && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full z-20">
                            <div
                                className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 backdrop-blur-xl"
                                style={{
                                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(124, 58, 237, 0.3) 100%)",
                                    boxShadow: "0 4px 20px -4px rgba(168, 85, 247, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                                }}
                            >
                                <Sparkles className="text-white h-3.5 w-3.5" />
                                <span className="text-white text-xs font-semibold uppercase tracking-wider">Most Popular</span>
                            </div>
                        </div>
                    )}

                    {/* --- Card Content --- */}
                    <div className="relative z-10 flex flex-1 flex-col">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold tracking-[-0.04em] text-white mb-2">{plan.name}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                className="ml-4 flex h-11 w-11 items-center justify-center rounded-xl border-[0.75px] border-white/10 bg-white/5 text-white flex-shrink-0"
                            >
                                <Icon className="h-5 w-5" />
                            </motion.div>
                        </div>

                        {/* Price Block -- liquid glass inset panel */}
                        <div
                            className="mb-6 p-5 rounded-2xl border border-white/5 backdrop-blur-sm overflow-hidden relative"
                            style={{
                                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)"
                            }}
                        >
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.04] via-transparent to-transparent rounded-2xl" />
                            <div className="relative flex items-baseline gap-x-1">
                                <span className="text-5xl font-bold tracking-tighter text-white">
                                    <NumberFlow
                                        value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                                        format={{
                                            style: "currency",
                                            currency: "USD",
                                            minimumFractionDigits: 0,
                                        }}
                                        className="tabular-nums"
                                    />
                                </span>
                                <span className="text-sm font-medium text-white/30 tracking-wide">
                                    / {plan.period}
                                </span>
                            </div>
                            {/* Savings pill */}
                            {!isMonthly && Number(plan.price) > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="relative mt-2 text-xs font-medium text-purple-300/80 flex items-center gap-1.5"
                                >
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                                    Save ${(Number(plan.price) - Number(plan.yearlyPrice)) * 12}/year
                                </motion.div>
                            )}
                        </div>

                        {/* Gradient Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                        {/* Features */}
                        <ul className="space-y-3.5 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <motion.li
                                    key={feature}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08 + i * 0.04 }}
                                    className="flex items-start gap-3 text-sm text-white/60 group/item"
                                >
                                    <div className={cn(
                                        "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                                        plan.isPopular
                                            ? "border-purple-500/30 bg-purple-500/10 text-purple-400 group-hover/item:bg-purple-500/20"
                                            : "border-white/10 bg-white/5 text-white/50 group-hover/item:bg-white/10 group-hover/item:text-white"
                                    )}>
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <span className="group-hover/item:text-white/90 transition-colors">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>

                        {/* CTA Button -- matches GradientButton identity */}
                        <Link
                            href={plan.href}
                            className={cn(
                                "relative w-full overflow-hidden rounded-full h-12 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                                plan.isPopular
                                    ? "bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] hover:shadow-[0_0_30px_-5px_rgba(78,30,64,0.7)]"
                                    : "bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white/90 hover:text-white"
                            )}
                        >
                            {/* Shimmer sweep on popular button */}
                            {plan.isPopular && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                                />
                            )}
                            <span className="relative z-10">{plan.buttonText}</span>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

// --- Main Section ---

export function Pricing() {
    const [isMonthly, setIsMonthly] = useState(true)

    return (
        <PricingContext.Provider value={{ isMonthly, setIsMonthly }}>
            <div className="relative w-full">
                {/* Background effects -- matches Features section exactly */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.12),transparent_50%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,7,100,0.08),transparent_40%)] pointer-events-none" />

                <div className="relative z-10 container mx-auto px-6">
                    {/* Header -- matches landing page heading style */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-20 text-center max-w-3xl mx-auto"
                    >
                        <p className="text-sm font-medium text-purple-400/90 uppercase tracking-widest mb-4">
                            Pricing
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Plans that scale{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                with your ambition
                            </span>
                        </h2>
                        <p className="text-white/50 text-lg leading-relaxed">
                            From students shipping their first project to enterprises hiring the next generation of battle-tested engineers.
                        </p>
                    </motion.div>

                    {/* Toggle */}
                    <PricingToggle />

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-4 lg:gap-4 max-w-7xl mx-auto">
                        {PLANS.map((plan, index) => (
                            <PricingCard key={plan.name} plan={plan} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </PricingContext.Provider>
    )
}
