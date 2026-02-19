
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GlassSkeletonProps extends React.ComponentProps<typeof Skeleton> { }

export function GlassSkeleton({ className, ...props }: GlassSkeletonProps) {
    return (
        <Skeleton
            className={cn(
                "glass-shimmer bg-white/5 border border-white/5 rounded-lg animate-pulse", // Using animate-pulse for base + glass-shimmer for overlay
                className
            )}
            {...props}
        />
    );
}
