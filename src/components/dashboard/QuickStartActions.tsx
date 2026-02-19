
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Book, Rocket, Server, Layout, Database, Smartphone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickStartActionsProps {
    user: {
        field: string | null;
        experienceLevel: string | null;
    };
}

const ACTION_MAP: Record<string, { title: string; description: string; href: string; icon: any }[]> = {
    frontend: [
        { title: "Build a Portfolio Site", description: "Create a modern personal portfolio with Next.js and Tailwind.", href: "/simulations/portfolio-builder", icon: Layout },
        { title: "React Component Library", description: "Design an atomic design system component library.", href: "/simulations/component-library", icon: Code },
        { title: "Accessibility Audit", description: "Practice accessible frontend development patterns.", href: "/simulations/a11y-audit", icon: Book },
    ],
    backend: [
        { title: "API Design & Docs", description: "Design a RESTful API specification with Swagger/OpenAPI.", href: "/simulations/api-design", icon: Server },
        { title: "Database Schema Optimization", description: "Normalize a complex database schema for performance.", href: "/simulations/db-schema", icon: Database },
        { title: "Authentication System", description: "Implement secure JWT authentication flow.", href: "/simulations/auth-flow", icon: Code },
    ],
    mobile: [
        { title: "Cross-Platform App", description: "Build a React Native task management application.", href: "/simulations/task-app", icon: Smartphone },
        { title: "Offline-First Sync", description: "Implement local database sync for mobile apps.", href: "/simulations/offline-sync", icon: Database },
        { title: "Mobile UI Animations", description: "Create fluid simulations with Reanimated.", href: "/simulations/mobile-animations", icon: Layout },
    ],
    // Fallback for others
    default: [
        { title: "Start Your First Simulation", description: "Choose from our curated library of real-world tasks.", href: "/simulations", icon: Rocket },
        { title: "Practice Interview", description: "Test your skills with an AI interviewer.", href: "/interviews", icon: Code },
        { title: "Review Open Source Code", description: "Analyze production code and find bugs.", href: "/code-review", icon: Book },
    ],
};

export function QuickStartActions({ user }: QuickStartActionsProps) {
    const field = user.field || "default";
    const actions = ACTION_MAP[field] || ACTION_MAP.default;

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {actions.map((action, i) => (
                <Card key={i} className="glass-card border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <CardHeader>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <action.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle>{action.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{action.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href={action.href} className="w-full">
                            <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10">
                                Start Now
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
