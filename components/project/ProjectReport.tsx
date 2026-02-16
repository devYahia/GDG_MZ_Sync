"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import {
    CheckCircle,
    AlertCircle,
    BarChart3,
    MessageSquare,
    Zap,
    Trophy,
    Briefcase,
    Code,
    BrainCircuit,
    Target
} from "lucide-react"
import type { ChatAnalysisResponse, SkillMetric } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProjectReportProps {
    analysis: ChatAnalysisResponse
}

export function ProjectReport({ analysis }: ProjectReportProps) {
    // Derived metrics
    const softScore = useMemo(() =>
        Math.round(analysis.soft_skills.reduce((acc, s) => acc + s.score, 0) / (analysis.soft_skills.length || 1)),
        [analysis.soft_skills])

    const techScore = useMemo(() =>
        Math.round(analysis.technical_skills.reduce((acc, s) => acc + s.score, 0) / (analysis.technical_skills.length || 1)),
        [analysis.technical_skills])

    const hiringProb = analysis.overall_score

    return (
        <div className="flex h-full flex-col overflow-y-auto bg-black p-4 md:p-8 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Zap className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">AI Performance Intelligence</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Project Report</h2>
                </div>
                {/* Score Badge */}
                <div className="hidden md:flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-4 py-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-white/80">Top 5% of Interns</span>
                </div>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">

                {/* 1. Hiring Probability (Gauge) - Spans 2 cols */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 flex flex-col justify-between"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Hiring Probability</h3>
                            <p className="text-sm text-white/50">Based on current performance</p>
                        </div>
                        <Briefcase className="h-6 w-6 text-emerald-400" />
                    </div>

                    <div className="flex items-end justify-center py-6">
                        <GaugeChart score={hiringProb} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/40">
                        <div>Junior</div>
                        <div>Mid-Level</div>
                        <div>Senior</div>
                    </div>
                </motion.div>

                {/* 2. Overall Score - Spans 1 col */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col justify-center items-center"
                >
                    <div className="absolute inset-0 bg-purple-500/10 blur-3xl" />
                    <div className="relative z-10 text-center">
                        <div className="text-6xl font-bold text-white mb-2 tracking-tighter">
                            {analysis.overall_score}
                        </div>
                        <div className="text-sm font-medium text-purple-300">Overall Score</div>
                    </div>
                </motion.div>

                {/* 3. Focus Area (Radar/Balance) - Spans 1 col */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Skill Balance</h3>
                    </div>
                    <div className="flex-1 flex items-end gap-4 justify-center pb-2">
                        {/* Tech Bar */}
                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="relative w-full bg-white/10 rounded-t-lg h-32 overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${techScore}%` }}
                                    className="absolute bottom-0 w-full bg-blue-500"
                                />
                            </div>
                            <span className="text-xs text-white/60 font-medium">Tech</span>
                        </div>
                        {/* Soft Bar */}
                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="relative w-full bg-white/10 rounded-t-lg h-32 overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${softScore}%` }}
                                    className="absolute bottom-0 w-full bg-pink-500"
                                />
                            </div>
                            <span className="text-xs text-white/60 font-medium">Soft</span>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Detailed Feedback - Spans 4 cols (Full Width) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-4 grid md:grid-cols-2 gap-6"
                >
                    <SkillList
                        title="Technical Mastery"
                        icon={Code}
                        skills={analysis.technical_skills}
                        color="blue"
                        delay={0.5}
                    />
                    <SkillList
                        title="Soft Skills & Communication"
                        icon={BrainCircuit}
                        skills={analysis.soft_skills}
                        color="pink"
                        delay={0.6}
                    />
                </motion.div>

                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="md:col-span-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
                >
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        Executive Summary
                    </h3>
                    <p className="text-lg text-white/80 leading-relaxed">
                        {analysis.summary}
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

// Sub-components

function GaugeChart({ score }: { score: number }) {
    const radius = 80
    const circumference = Math.PI * radius
    const progress = (score / 100) * circumference

    return (
        <div className="relative flex flex-col items-center">
            <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
                {/* Background Arc */}
                <path
                    d="M 20 120 A 80 80 0 0 1 180 120"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="20"
                    strokeLinecap="round"
                />
                {/* Foreground Arc */}
                <motion.path
                    d="M 20 120 A 80 80 0 0 1 180 120"
                    fill="none"
                    stroke={score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute bottom-0 text-center">
                <span className="text-4xl font-bold text-white">{score}%</span>
            </div>
        </div>
    )
}

function SkillList({ title, icon: Icon, skills, color, delay }: any) {
    const isBlue = color === "blue"

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isBlue ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400")}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>

            <div className="grid gap-3">
                {skills.map((skill: SkillMetric, i: number) => (
                    <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + (i * 0.1) }}
                        className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] hover:border-white/10"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-white/90">{skill.name}</span>
                            <span className={cn("text-sm font-bold", isBlue ? "text-blue-400" : "text-pink-400")}>
                                {skill.score}/100
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.score}%` }}
                                transition={{ duration: 1, delay: delay + (i * 0.1) + 0.2 }}
                                className={cn("h-full rounded-full", isBlue ? "bg-blue-500" : "bg-pink-500")}
                            />
                        </div>
                        <p className="text-sm text-white/50 leading-snug group-hover:text-white/70 transition-colors">
                            {skill.feedback}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
