"use client"

import { CheckCircle2, User, Calendar, Briefcase, Target, Layers, ArrowRight, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Milestone {
    title: string
    description: string
    deliverables: string[]
}

interface Persona {
    name: string
    role: string
    personality: string
    system_prompt: string
    initial_message: string
}

interface SimulationData {
    title: string
    domain: string
    difficulty: string
    estimated_duration: string
    tech_stack: string[]
    overview: string
    learning_objectives: string[]
    functional_requirements: string[]
    non_functional_requirements: string[]
    milestones: Milestone[]
    personas: Persona[]
}

export function SimulationView({ data }: { data: SimulationData }) {
    if (!data) return null

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 capitalize">
                            {data.domain}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            {data.difficulty}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
                        {data.title}
                    </h1>
                    <p className="text-lg text-white/60 max-w-3xl leading-relaxed">
                        {data.overview}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-white/80">{data.estimated_duration}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-white/10" />
                    <div className="flex items-center gap-2 text-white/80">
                        <Briefcase className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium">{data.tech_stack.length} Technologies</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content (Left 2 columns) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Milestones */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-purple-400" />
                                <CardTitle className="text-xl">Project Milestones</CardTitle>
                            </div>
                            <CardDescription className="text-white/40">Step-by-step roadmap to complete your internship simulation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {data.milestones.map((milestone, idx) => (
                                <div key={idx} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-32px] before:w-[2px] before:bg-white/10 last:before:hidden">
                                    <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center z-10">
                                        <span className="text-[10px] font-bold text-purple-400">{idx + 1}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-white">{milestone.title}</h4>
                                        <p className="text-sm text-white/50 leading-relaxed">{milestone.description}</p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {milestone.deliverables.map((del, dIdx) => (
                                                <div key={dIdx} className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {del}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Requirements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="h-4 w-4 text-purple-400" />
                                    Functional
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-white/60">
                                    {data.functional_requirements.map((req, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-purple-500/50">•</span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    Learning Objectives
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-white/60">
                                    {data.learning_objectives.map((obj, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-emerald-500/30">•</span>
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar (Right column) */}
                <div className="space-y-6">
                    {/* Tech Stack */}
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Technologies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {data.tech_stack.map((tech, i) => (
                                    <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/5 text-xs text-white/70">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personas */}
                    <div className="space-y-4 text-white">
                        <h3 className="text-lg font-semibold flex items-center gap-2 ml-1">
                            <MessageSquare className="h-5 w-5 text-purple-400" />
                            Chat Personas
                        </h3>
                        {data.personas.map((persona, i) => (
                            <Card key={i} className="border-white/10 bg-gradient-to-br from-white/10 to-transparent hover:from-white/15 transition-all group cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                                        <AvatarFallback className="bg-purple-900/40 text-purple-200">
                                            <User className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white group-hover:text-purple-300 transition-colors">{persona.name}</h4>
                                        <p className="text-xs text-white/40 truncate">{persona.role}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-white/20 group-hover:text-white transition-colors">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        <p className="text-[10px] text-white/30 text-center px-4">
                            Click on a persona to start a simulated chat. Each character is specialized and will test your progress.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
