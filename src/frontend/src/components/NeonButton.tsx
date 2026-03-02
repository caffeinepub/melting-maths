import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type NeonVariant = "cyan" | "purple" | "blue" | "ghost";
type NeonSize = "sm" | "md" | "lg";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NeonVariant;
  size?: NeonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<NeonVariant, string> = {
  cyan: "btn-neon-cyan",
  purple: "btn-neon-purple",
  blue: "btn-neon-blue",
  ghost:
    "bg-transparent border border-white/10 text-foreground/70 hover:border-white/30 hover:text-foreground transition-all",
};

const sizeClasses: Record<NeonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-xl min-h-[36px]",
  md: "px-6 py-3 text-base rounded-2xl min-h-[44px]",
  lg: "px-8 py-4 text-lg rounded-2xl min-h-[52px]",
};

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    { variant = "cyan", size = "md", fullWidth, className, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative font-display font-semibold tracking-wide cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95 transition-transform",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
NeonButton.displayName = "NeonButton";
