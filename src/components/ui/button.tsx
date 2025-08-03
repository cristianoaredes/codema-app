import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-smooth focus-ring button-press disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover-lift success-ping",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover-lift",
        outline:
          "border border-input bg-background hover:bg-muted hover:text-foreground shadow-sm hover-lift",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-md hover-lift",
        ghost: "hover:bg-muted hover:text-foreground hover-scale",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl hover-scale shadow-lg",
        municipal: "bg-gradient-to-r from-primary via-primary to-secondary text-white hover-glow border border-primary/20",
      },
      size: {
        default: "h-10 sm:h-10 px-4 py-2 min-w-[44px]", // 44px minimum touch target
        sm: "h-9 sm:h-9 rounded-md px-3 min-w-[36px]",
        lg: "h-12 sm:h-11 rounded-md px-8 min-w-[48px]", // Larger on mobile
        icon: "h-11 w-11 sm:h-10 sm:w-10 min-w-[44px]", // Larger touch target on mobile
        touch: "h-12 px-6 py-3 min-w-[48px] text-base sm:h-10 sm:px-4 sm:py-2 sm:text-sm", // Mobile-optimized size
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
