"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
    X,
    Coins,
    CreditCard,
    Check,
    Shield,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { addCredits } from "@/app/actions/credits"

interface CreditsPurchaseModalProps {
    isOpen: boolean
    onClose: () => void
    currentCredits: number
    onCreditsUpdated?: (newCredits: number) => void
}

const CREDIT_PACKS = [
    { amount: 50, price: 4.99, popular: false, label: "Starter" },
    { amount: 150, price: 11.99, popular: true, label: "Popular" },
    { amount: 500, price: 34.99, popular: false, label: "Pro" },
    { amount: 1000, price: 59.99, popular: false, label: "Mega" },
]

const PRICE_PER_CREDIT = 0.08

type Step = "select" | "payment" | "success"

export function CreditsPurchaseModal({
    isOpen,
    onClose,
    currentCredits,
    onCreditsUpdated,
}: CreditsPurchaseModalProps) {
    const [step, setStep] = useState<Step>("select")
    const [selectedPack, setSelectedPack] = useState<typeof CREDIT_PACKS[0] | null>(null)
    const [cardNumber, setCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const resetState = () => {
        setStep("select")
        setSelectedPack(null)
        setCardNumber("")
        setCardName("")
        setCardExpiry("")
        setCardCvv("")
        setError(null)
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    const handleSelectPack = (pack: typeof CREDIT_PACKS[0]) => {
        setSelectedPack(pack)
        setStep("payment")
        setError(null)
    }

    const handlePayment = () => {
        if (!selectedPack) return

        if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
            setError("Please enter a valid 16-digit card number.")
            return
        }
        if (!cardName || cardName.trim().length < 3) {
            setError("Please enter the cardholder name.")
            return
        }
        if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            setError("Please enter a valid expiry date (MM/YY).")
            return
        }
        if (!cardCvv || cardCvv.length < 3) {
            setError("Please enter a valid CVV.")
            return
        }

        setError(null)

        startTransition(async () => {
            const result = await addCredits(selectedPack.amount)
            if (result.error) {
                setError(result.error)
                return
            }
            if (result.credits !== undefined) {
                onCreditsUpdated?.(result.credits)
            }
            setStep("success")
        })
    }

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 16)
        return digits.replace(/(.{4})/g, "$1 ").trim()
    }

    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 4)
        if (digits.length >= 3) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`
        }
        return digits
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="relative z-10 flex h-full items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-3xl pointer-events-auto shadow-2xl"
                        >
                            {/* Glass shine overlay */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/[0.03] via-transparent to-purple-500/[0.02] rounded-2xl" />

                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="relative z-10 p-6 md:p-8">
                                <AnimatePresence mode="wait">
                                    {step === "select" && (
                                        <motion.div
                                            key="select"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <SelectStep
                                                currentCredits={currentCredits}
                                                onSelect={handleSelectPack}
                                            />
                                        </motion.div>
                                    )}

                                    {step === "payment" && selectedPack && (
                                        <motion.div
                                            key="payment"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <PaymentStep
                                                pack={selectedPack}
                                                cardNumber={cardNumber}
                                                cardName={cardName}
                                                cardExpiry={cardExpiry}
                                                cardCvv={cardCvv}
                                                onCardNumberChange={(v) => setCardNumber(formatCardNumber(v))}
                                                onCardNameChange={setCardName}
                                                onCardExpiryChange={(v) => setCardExpiry(formatExpiry(v))}
                                                onCardCvvChange={(v) => setCardCvv(v.replace(/\D/g, "").slice(0, 4))}
                                                onBack={() => setStep("select")}
                                                onPay={handlePayment}
                                                isPending={isPending}
                                                error={error}
                                            />
                                        </motion.div>
                                    )}

                                    {step === "success" && selectedPack && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <SuccessStep
                                                pack={selectedPack}
                                                onDone={handleClose}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}

// --- Step 1: Select Credits Pack ---

function SelectStep({
    currentCredits,
    onSelect,
}: {
    currentCredits: number
    onSelect: (pack: typeof CREDIT_PACKS[0]) => void
}) {
    const [customAmount, setCustomAmount] = useState("")
    const [customError, setCustomError] = useState("")

    const handleCustomSubmit = () => {
        const num = parseInt(customAmount, 10)
        if (!num || num < 10) {
            setCustomError("Minimum 10 credits")
            return
        }
        if (num > 10000) {
            setCustomError("Maximum 10,000 credits")
            return
        }
        setCustomError("")
        const price = Math.round(num * PRICE_PER_CREDIT * 100) / 100
        onSelect({ amount: num, price, popular: false, label: "Custom" })
    }

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/30">
                        <Coins className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Add Credits</h2>
                        <p className="text-xs text-muted-foreground">
                            Current balance: <span className="font-semibold text-purple-400 dark:text-purple-300">{currentCredits.toLocaleString()}</span> credits
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {CREDIT_PACKS.map((pack) => (
                    <button
                        key={pack.amount}
                        onClick={() => onSelect(pack)}
                        className={cn(
                            "group relative rounded-xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                            pack.popular
                                ? "border-purple-500/30 bg-purple-500/[0.08] hover:border-purple-500/50 hover:shadow-[0_0_24px_-8px_rgba(168,85,247,0.3)]"
                                : "border-border bg-muted/30 hover:border-purple-500/20 hover:bg-muted/50"
                        )}
                    >
                        {pack.popular && (
                            <span className="absolute -top-2.5 left-3 rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">
                                Best Value
                            </span>
                        )}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-foreground">{pack.amount}</span>
                            <Coins className={cn("h-5 w-5", pack.popular ? "text-purple-400" : "text-muted-foreground/40")} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{pack.label} Pack</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-foreground">${pack.price}</span>
                            <span className="text-[10px] text-muted-foreground">
                                (${(pack.price / pack.amount).toFixed(3)}/credit)
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Custom amount */}
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2.5">Or enter a custom amount</p>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={customAmount}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "").slice(0, 5)
                                setCustomAmount(v)
                                setCustomError("")
                            }}
                            placeholder="e.g. 250"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                        {customAmount && parseInt(customAmount, 10) >= 10 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                                ${(Math.round(parseInt(customAmount, 10) * PRICE_PER_CREDIT * 100) / 100).toFixed(2)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleCustomSubmit}
                        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors flex-shrink-0"
                    >
                        Add
                    </button>
                </div>
                {customError && (
                    <p className="mt-1.5 text-[11px] text-red-500">{customError}</p>
                )}
                <p className="mt-1.5 text-[10px] text-muted-foreground/50">Min 10 -- Max 10,000 -- ${PRICE_PER_CREDIT}/credit</p>
            </div>

            <p className="mt-4 text-center text-[10px] text-muted-foreground/40 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Secure payment processing
            </p>
        </div>
    )
}

// --- Step 2: Payment (Mock Visa) ---

function PaymentStep({
    pack,
    cardNumber,
    cardName,
    cardExpiry,
    cardCvv,
    onCardNumberChange,
    onCardNameChange,
    onCardExpiryChange,
    onCardCvvChange,
    onBack,
    onPay,
    isPending,
    error,
}: {
    pack: typeof CREDIT_PACKS[0]
    cardNumber: string
    cardName: string
    cardExpiry: string
    cardCvv: string
    onCardNumberChange: (v: string) => void
    onCardNameChange: (v: string) => void
    onCardExpiryChange: (v: string) => void
    onCardCvvChange: (v: string) => void
    onBack: () => void
    onPay: () => void
    isPending: boolean
    error: string | null
}) {
    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
            </button>

            {/* Order summary */}
            <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-600/20">
                            <Coins className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{pack.amount} Credits</p>
                            <p className="text-[10px] text-muted-foreground">{pack.label} Pack</p>
                        </div>
                    </div>
                    <span className="text-xl font-bold text-foreground">${pack.price}</span>
                </div>
            </div>

            {/* Card form */}
            <div className="space-y-3.5">
                <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Card Number
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => onCardNumberChange(e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Cardholder Name
                    </label>
                    <input
                        type="text"
                        value={cardName}
                        onChange={(e) => onCardNameChange(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => onCardExpiryChange(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            CVV
                        </label>
                        <input
                            type="text"
                            value={cardCvv}
                            onChange={(e) => onCardCvvChange(e.target.value)}
                            placeholder="123"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
                    {error}
                </div>
            )}

            <button
                onClick={onPay}
                disabled={isPending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-violet-500 hover:shadow-[0_0_24px_-6px_rgba(168,85,247,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="h-4 w-4" />
                        Pay ${pack.price}
                    </>
                )}
            </button>

            <p className="mt-3 text-center text-[10px] text-muted-foreground/50 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Mock payment -- no real charges
            </p>
        </div>
    )
}

// --- Step 3: Success ---

function SuccessStep({
    pack,
    onDone,
}: {
    pack: typeof CREDIT_PACKS[0]
    onDone: () => void
}) {
    return (
        <div className="py-4 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_-5px_rgba(52,211,153,0.5)]"
            >
                <Check className="h-8 w-8 text-white" />
            </motion.div>

            <h3 className="text-xl font-bold text-foreground mb-2">Payment Successful</h3>
            <p className="text-sm text-muted-foreground mb-1">
                <span className="font-semibold text-emerald-600 dark:text-emerald-300">{pack.amount} credits</span> have been added to your account.
            </p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2"
            >
                <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Ready to simulate</span>
            </motion.div>

            <div className="mt-6">
                <button
                    onClick={onDone}
                    className="inline-flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all"
                >
                    Done
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}
