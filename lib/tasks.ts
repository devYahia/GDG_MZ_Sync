import {
    Code,
    Server,
    Layers,
    Smartphone,
    BarChart3,
    Palette,
    type LucideIcon,
} from "lucide-react"

export type TaskDifficulty = "easy" | "medium" | "hard"
export type TaskField =
    | "frontend"
    | "backend"
    | "fullstack"
    | "mobile"
    | "data"
    | "design"

export interface SimulationTask {
    id: string
    title: string
    description: string
    clientPersona: string
    clientMood: string
    field: TaskField
    difficulty: TaskDifficulty
    duration: string
    tools: string[]
}

export const FIELD_CONFIG: Record<
    TaskField,
    { label: string; icon: LucideIcon; color: string; bg: string }
> = {
    frontend: {
        label: "Frontend",
        icon: Code,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
    },
    backend: {
        label: "Backend",
        icon: Server,
        color: "text-green-400",
        bg: "bg-green-400/10",
    },
    fullstack: {
        label: "Full Stack",
        icon: Layers,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
    },
    mobile: {
        label: "Mobile",
        icon: Smartphone,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
    },
    data: {
        label: "Data / AI",
        icon: BarChart3,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
    },
    design: {
        label: "Design",
        icon: Palette,
        color: "text-pink-400",
        bg: "bg-pink-400/10",
    },
}

export const DIFFICULTY_CONFIG: Record<
    TaskDifficulty,
    { label: string; color: string; bg: string; dots: number }
> = {
    easy: {
        label: "Easy",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        dots: 1,
    },
    medium: {
        label: "Medium",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        dots: 2,
    },
    hard: {
        label: "Hard",
        color: "text-red-400",
        bg: "bg-red-400/10",
        dots: 3,
    },
}

export const TASKS: SimulationTask[] = [
    {
        id: "landing-page",
        title: "Build a Landing Page",
        description:
            "A startup CEO needs a landing page for their new product. They're impatient, have strong opinions, and keep changing requirements mid-conversation.",
        clientPersona: "Impatient Startup CEO",
        clientMood: "Demanding",
        field: "frontend",
        difficulty: "easy",
        duration: "30 min",
        tools: ["React", "CSS", "Figma"],
    },
    {
        id: "rest-api",
        title: "REST API for E-Commerce",
        description:
            "A product manager needs a REST API with authentication, product CRUD, and order management. They obsess over edge cases and error handling.",
        clientPersona: "Detail-Obsessed PM",
        clientMood: "Meticulous",
        field: "backend",
        difficulty: "medium",
        duration: "45 min",
        tools: ["Node.js", "PostgreSQL", "REST"],
    },
    {
        id: "mobile-redesign",
        title: "Mobile App Redesign",
        description:
            "A creative director wants a fresh UI for their mobile app. They can't decide between 3 different design directions and keep going back and forth.",
        clientPersona: "Indecisive Creative Director",
        clientMood: "Uncertain",
        field: "design",
        difficulty: "medium",
        duration: "40 min",
        tools: ["Figma", "UI/UX", "Prototyping"],
    },
    {
        id: "dashboard-analytics",
        title: "Dashboard Analytics",
        description:
            "A CTO needs a real-time analytics dashboard. They want everything data-driven with charts, KPIs, and filtering. Performance is non-negotiable.",
        clientPersona: "Data-Driven CTO",
        clientMood: "Intense",
        field: "fullstack",
        difficulty: "hard",
        duration: "60 min",
        tools: ["React", "D3.js", "WebSocket"],
    },
    {
        id: "database-schema",
        title: "Database Schema Design",
        description:
            "A perfectionist tech lead needs a normalized database schema for a social media platform. Every index, constraint, and relationship must be justified.",
        clientPersona: "Perfectionist Tech Lead",
        clientMood: "Critical",
        field: "backend",
        difficulty: "hard",
        duration: "50 min",
        tools: ["PostgreSQL", "ERD", "SQL"],
    },
    {
        id: "portfolio-site",
        title: "Portfolio Website",
        description:
            "A freelancer wants a stunning portfolio site but has a tiny budget. They expect premium quality with minimal investment and lots of revisions.",
        clientPersona: "Budget-Conscious Freelancer",
        clientMood: "Frugal",
        field: "frontend",
        difficulty: "easy",
        duration: "25 min",
        tools: ["HTML", "CSS", "JavaScript"],
    },
]
