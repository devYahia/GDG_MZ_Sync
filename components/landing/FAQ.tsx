"use client"

import { motion } from "motion/react"
import Link from "next/link"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    HelpCircle,
    Zap,
    Shield,
    CreditCard,
    Users,
    GraduationCap,
    Building2,
    RefreshCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

type FAQItem = {
    id: string
    icon: React.ElementType
    question: string
    answer: string
}

const faqItems: FAQItem[] = [
    {
        id: "item-1",
        icon: Zap,
        question: "What exactly is a virtual internship simulation?",
        answer:
            "It is a high-fidelity, AI-driven environment that replicates a real tech internship. You receive tasks from AI stakeholders, ship code in a production sandbox, attend standups, and get evaluated on communication, delivery, and code quality -- just like a real job, without the hiring barrier.",
    },
    {
        id: "item-2",
        icon: GraduationCap,
        question: "Who is Interna designed for?",
        answer:
            "Interna is built for computer science students, fresh graduates, and career switchers who want real-world experience before landing their first role. If you have learned to code but never worked on a real team with stakeholders, deadlines, and production systems -- this is for you.",
    },
    {
        id: "item-3",
        icon: Building2,
        question: "How does the Enterprise plan work for hiring?",
        answer:
            "Companies can create custom role simulations that mirror their actual tech stack and workflows. Candidates go through the simulation, and you get a detailed assessment dashboard showing how they communicate, handle pressure, write code, and collaborate -- far more valuable than a whiteboard interview.",
    },
    {
        id: "item-4",
        icon: CreditCard,
        question: "Can I try Interna before paying?",
        answer:
            "Absolutely. The Starter plan is completely free and gives you one full simulation to experience the platform. No credit card required. If you want unlimited simulations, advanced AI personas, and exportable certificates, you can upgrade to Pro Intern at any time.",
    },
    {
        id: "item-5",
        icon: RefreshCcw,
        question: "What is your refund policy?",
        answer:
            "We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied, contact our support team within 14 days of purchase and we will process a full refund -- no questions asked.",
    },
    {
        id: "item-6",
        icon: Shield,
        question: "Is my code and data safe on the platform?",
        answer:
            "Yes. All code runs in isolated sandboxes and is never shared. Your personal data is encrypted at rest and in transit. We use Supabase with Row Level Security, so your data is strictly yours. We do not sell or share user data with third parties.",
    },
    {
        id: "item-7",
        icon: Users,
        question: "Can I use Interna certificates on my resume?",
        answer:
            "Yes. Pro Intern users receive verified completion certificates for each simulation they finish. These certificates include your performance metrics and can be shared on LinkedIn, added to your resume, or sent directly to potential employers.",
    },
]

export function FAQ() {
    return (
        <div className="relative w-full">
            {/* Background effects -- consistent with other sections */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(88,28,135,0.1),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,7,100,0.06),transparent_40%)] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="flex flex-col gap-12 md:flex-row md:gap-16 max-w-6xl mx-auto">
                    {/* Left Column -- Sticky Header */}
                    <div className="md:w-1/3">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="sticky top-24"
                        >
                            <p className="text-sm font-medium text-purple-400/90 uppercase tracking-widest mb-4">
                                FAQ
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                                Got questions?{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                                    We got answers.
                                </span>
                            </h2>
                            <p className="text-white/50 text-base leading-relaxed mb-6">
                                Everything you need to know about Interna. Can&apos;t find what you&apos;re looking for?
                            </p>
                            <Link
                                href="#"
                                className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors group"
                            >
                                <HelpCircle className="h-4 w-4" />
                                Contact support
                                <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Column -- Accordion */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="md:w-2/3"
                    >
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {faqItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <AccordionItem
                                        value={item.id}
                                        className={cn(
                                            "rounded-xl border-[0.75px] border-white/10 px-5 backdrop-blur-xl overflow-hidden transition-shadow duration-300",
                                            "hover:shadow-[0_0_30px_-12px_rgba(168,85,247,0.15)]",
                                            "data-[state=open]:border-purple-500/20 data-[state=open]:shadow-[0_0_30px_-8px_rgba(168,85,247,0.15)]"
                                        )}
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
                                            boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
                                        }}
                                    >
                                        <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline text-white/90 hover:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border-[0.75px] border-white/10 bg-white/5 text-white/70 flex-shrink-0">
                                                    <item.icon className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm md:text-base font-medium text-left">{item.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-5">
                                            <div className="pl-11">
                                                <p className="text-sm md:text-base text-white/50 leading-relaxed">{item.answer}</p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
