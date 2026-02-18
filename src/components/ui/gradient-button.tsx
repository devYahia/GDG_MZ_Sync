import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends Omit<React.ComponentProps<typeof Button>, "variant"> {
    variant?: "default" | "variant"
}

export function GradientButton({ className, variant = "default", ...props }: GradientButtonProps) {
    return (
        <Button
            className={cn(
                "relative overflow-hidden rounded-full font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                variant === "default" &&
                "bg-gradient-to-r from-[#4e1e40] to-black border border-white/10 shadow-[0_0_20px_-5px_rgba(78,30,64,0.5)] hover:shadow-[0_0_30px_-5px_rgba(78,30,64,0.7)] text-white hover:text-white",
                variant === "variant" &&
                "bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white/90 hover:text-white",
                "h-12 px-8",
                className
            )}
            {...props}
        />
    )
}
