"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GradientButton } from "@/components/ui/gradient-button"
import { submitContactForm } from "@/app/actions/contact"
import { toast } from "sonner"
import {
    Send,
    X,
    Loader2,
    MessageSquare,
    ArrowRight,
} from "lucide-react"

// --- Social Links Data ---

const SOCIALS = [
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/interna-virtual-178b593b0",
        icon: (props: { className?: string }) => (
            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        name: "X",
        href: "https://x.com/VirtualInterna",
        icon: (props: { className?: string }) => (
            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        name: "Instagram",
        href: "https://www.instagram.com/interna_virtual",
        icon: (props: { className?: string }) => (
            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
        ),
    },
    {
        name: "TikTok",
        href: "https://www.tiktok.com/@interna_virtual",
        icon: (props: { className?: string }) => (
            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
        ),
    },
    {
        name: "Facebook",
        href: "https://www.facebook.com/profile.php?id=61587789617722",
        icon: (props: { className?: string }) => (
            <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
]

// --- Contact Form Modal ---

function ContactFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        subject: "",
        message: "",
    })
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFieldErrors({})

        startTransition(async () => {
            const result = await submitContactForm(formData)

            if (result.fieldErrors) {
                setFieldErrors(result.fieldErrors)
                return
            }
            if (result.error) {
                toast.error(result.error)
                return
            }
            if (result.success) {
                toast.success(result.success)
                setFormData({ full_name: "", email: "", subject: "", message: "" })
                onClose()
            }
        })
    }

    const inputClasses = cn(
        "w-full rounded-xl border-[0.75px] border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30",
        "backdrop-blur-sm transition-all duration-300",
        "focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.07] focus:shadow-[0_0_20px_-8px_rgba(168,85,247,0.2)]"
    )

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 p-1 backdrop-blur-3xl"
                            style={{
                                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                                boxShadow: "0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
                            }}
                        >
                            {/* Glass shine */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02] rounded-3xl" />

                            {/* Animated orbs */}
                            <motion.div
                                className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/15 blur-3xl"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-3xl"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />

                            {/* Shimmer */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                            />

                            <div className="relative z-10 p-6 md:p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[0.75px] border-white/10 bg-white/5">
                                            <MessageSquare className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Get in touch</h3>
                                            <p className="text-xs text-white/40">We will respond within 24 hours</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Full name"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className={cn(inputClasses, fieldErrors.full_name && "border-red-500/50")}
                                                required
                                            />
                                            {fieldErrors.full_name && (
                                                <p className="mt-1 text-xs text-red-400">{fieldErrors.full_name[0]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={cn(inputClasses, fieldErrors.email && "border-red-500/50")}
                                                required
                                            />
                                            {fieldErrors.email && (
                                                <p className="mt-1 text-xs text-red-400">{fieldErrors.email[0]}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className={cn(inputClasses, fieldErrors.subject && "border-red-500/50")}
                                            required
                                        />
                                        {fieldErrors.subject && (
                                            <p className="mt-1 text-xs text-red-400">{fieldErrors.subject[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <textarea
                                            placeholder="Your message..."
                                            rows={4}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className={cn(inputClasses, "resize-none", fieldErrors.message && "border-red-500/50")}
                                            required
                                        />
                                        {fieldErrors.message && (
                                            <p className="mt-1 text-xs text-red-400">{fieldErrors.message[0]}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={cn(
                                            "relative w-full overflow-hidden rounded-xl h-12 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                                            "bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 text-white",
                                            "shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] hover:shadow-[0_0_30px_-5px_rgba(78,30,64,0.7)]",
                                            "hover:scale-[1.01] active:scale-[0.99]",
                                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        )}
                                    >
                                        {/* Shimmer on button */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                                            animate={{ x: ["-100%", "200%"] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                                        />
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 relative z-10" />
                                                <span className="relative z-10">Send Message</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// --- Main CTA Section ---

export function ContactCTA() {
    const [showContact, setShowContact] = useState(false)

    return (
        <>
            <div className="relative w-full">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-black to-black pointer-events-none" />

                <div className="relative z-10 container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Heading */}
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            Let&apos;s{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                connect
                            </span>
                        </h2>
                        <p className="text-white/50 max-w-xl mx-auto mb-12 text-lg leading-relaxed">
                            Follow our journey, join the community, or reach out directly. We are building the future of tech education -- together.
                        </p>

                        {/* Social Links */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                            {SOCIALS.map((social, index) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-2xl border-[0.75px] border-white/10 px-5 py-3.5 backdrop-blur-xl transition-all duration-300",
                                        "hover:border-purple-500/30 hover:shadow-[0_0_30px_-8px_rgba(168,85,247,0.2)]"
                                    )}
                                    style={{
                                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
                                        boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
                                    }}
                                >
                                    <social.icon className="h-4 w-4 text-white/60 group-hover:text-purple-400 transition-colors" />
                                    <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                                        {social.name}
                                    </span>
                                </motion.a>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                    <GradientButton className="w-full sm:w-auto h-14 px-10 text-lg rounded-xl group">
                                        Start your internship
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </GradientButton>
                                </motion.span>
                            </Link>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowContact(true)}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl h-14 px-8 text-lg font-medium transition-all duration-300",
                                    "border border-white/10 bg-white/5 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <MessageSquare className="h-5 w-5" />
                                Contact us
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Contact Form Modal */}
            <ContactFormModal isOpen={showContact} onClose={() => setShowContact(false)} />
        </>
    )
}
