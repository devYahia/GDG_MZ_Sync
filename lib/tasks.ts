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

/** Level combines customer-dealing difficulty and project technical difficulty */
export interface TaskLevel {
    levelNumber: number
    customerDifficulty: TaskDifficulty
    projectDifficulty: TaskDifficulty
    label: string
}

export const LEVEL_CONFIG: TaskLevel[] = [
    { levelNumber: 1, customerDifficulty: "easy", projectDifficulty: "easy", label: "Level 1 — Gentle start" },
    { levelNumber: 2, customerDifficulty: "medium", projectDifficulty: "easy", label: "Level 2 — Tricky client" },
    { levelNumber: 3, customerDifficulty: "easy", projectDifficulty: "medium", label: "Level 3 — Heavier task" },
    { levelNumber: 4, customerDifficulty: "medium", projectDifficulty: "medium", label: "Level 4 — Balanced" },
    { levelNumber: 5, customerDifficulty: "hard", projectDifficulty: "medium", label: "Level 5 — Demanding client" },
    { levelNumber: 6, customerDifficulty: "medium", projectDifficulty: "hard", label: "Level 6 — Complex project" },
    { levelNumber: 7, customerDifficulty: "hard", projectDifficulty: "hard", label: "Level 7 — Full challenge" },
    { levelNumber: 8, customerDifficulty: "hard", projectDifficulty: "hard", label: "Level 8 — Expert pressure" },
]

export interface SimulationTask {
    id: string
    title: string
    description: string
    clientPersona: string
    clientMood: string
    field: TaskField
    difficulty: TaskDifficulty
    /** How difficult the client is to deal with (communication, changes, expectations) */
    customerDifficulty: TaskDifficulty
    level: number
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
        customerDifficulty: "hard",
        level: 2,
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
        customerDifficulty: "medium",
        level: 4,
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
        customerDifficulty: "hard",
        level: 5,
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
        customerDifficulty: "hard",
        level: 7,
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
        customerDifficulty: "hard",
        level: 7,
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
        customerDifficulty: "medium",
        level: 1,
        duration: "25 min",
        tools: ["HTML", "CSS", "JavaScript"],
    },
    {
        id: "auth-flow",
        title: "Auth Flow & OAuth",
        description:
            "A security-conscious client wants login, signup, and OAuth integration. They keep asking for more providers and stricter validation.",
        clientPersona: "Security-Focused Founder",
        clientMood: "Cautious",
        field: "fullstack",
        difficulty: "medium",
        customerDifficulty: "medium",
        level: 4,
        duration: "45 min",
        tools: ["Next.js", "Supabase", "OAuth"],
    },
    {
        id: "data-pipeline",
        title: "ETL Data Pipeline",
        description:
            "A data team lead needs a small ETL pipeline with validation and error reporting. They speak in jargon and change specs often.",
        clientPersona: "Jargon-Heavy Data Lead",
        clientMood: "Vague",
        field: "data",
        difficulty: "hard",
        customerDifficulty: "hard",
        level: 6,
        duration: "55 min",
        tools: ["Python", "Pandas", "SQL"],
    },
    {
        id: "legacy-migration",
        title: "Legacy System Migration",
        description:
            "A stressed CTO needs a migration plan from a legacy monolith to microservices. Tight deadlines, unclear priorities, and multiple stakeholders with conflicting demands.",
        clientPersona: "Overwhelmed CTO",
        clientMood: "Under pressure",
        field: "fullstack",
        difficulty: "hard",
        customerDifficulty: "hard",
        level: 8,
        duration: "60 min",
        tools: ["Architecture", "APIs", "Documentation"],
    },
    {
        id: "mobile-auth-ui",
        title: "Mobile Login Screens",
        description:
            "Product owner wants beautiful login/signup screens for their app. They have strong opinions on colors and copy.",
        clientPersona: "Opinionated Product Owner",
        clientMood: "Picky",
        field: "mobile",
        difficulty: "easy",
        customerDifficulty: "medium",
        level: 2,
        duration: "35 min",
        tools: ["React Native", "Figma"],
    },
]

export function getTaskById(id: string): SimulationTask | undefined {
    return TASKS.find((t) => t.id === id)
}
