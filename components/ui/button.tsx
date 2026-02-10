import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = ({ variant = "default", size = "default", className = "" }: { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null, size?: "default" | "sm" | "lg" | "icon" | null, className?: string } = {}) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    let variantStyles = ""
    switch (variant) {
        case "default":
            variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90"
            break
        case "destructive":
            variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            break
        case "outline":
            variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            break
        case "secondary":
            variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            break
        case "ghost":
            variantStyles = "hover:bg-accent hover:text-accent-foreground"
            break
        case "link":
            variantStyles = "text-primary underline-offset-4 hover:underline"
            break
        default:
            variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90"
    }

    let sizeStyles = ""
    switch (size) {
        case "default":
            sizeStyles = "h-10 px-4 py-2"
            break
        case "sm":
            sizeStyles = "h-9 rounded-md px-3"
            break
        case "lg":
            sizeStyles = "h-11 rounded-md px-8"
            break
        case "icon":
            sizeStyles = "h-10 w-10"
            break
        default:
            sizeStyles = "h-10 px-4 py-2"
    }

    return cn(baseStyles, variantStyles, sizeStyles, className)
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null
    size?: "default" | "sm" | "lg" | "icon" | null
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = "button"
        return (
            <Comp
                className={buttonVariants({ variant, size, className })}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
