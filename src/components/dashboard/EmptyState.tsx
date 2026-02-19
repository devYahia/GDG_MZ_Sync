
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    actionOnClick?: () => void;
    className?: string; // Additional classes for the container
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    actionOnClick,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center glass-card rounded-xl min-h-[300px]", className)}>
            <div className="bg-primary/20 p-4 rounded-full mb-4 ring-1 ring-primary/30 text-primary">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {actionLabel && (
                actionHref ? (
                    <Link href={actionHref}>
                        <Button>{actionLabel}</Button>
                    </Link>
                ) : (
                    <Button onClick={actionOnClick}>{actionLabel}</Button>
                )
            )}
        </div>
    );
}
