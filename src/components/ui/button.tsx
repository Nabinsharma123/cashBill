import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground shadow-[0_1px_1px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-primary/95 active:translate-y-[0.5px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground shadow-[0_1px_1px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-destructive/95 active:translate-y-[0.5px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
        outline:
          "border border-input bg-gradient-to-b from-white to-[#f3f4f6] text-foreground shadow-[0_1px_1px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] hover:border-foreground/30 hover:from-white hover:to-[#eaecf0] active:translate-y-[0.5px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-[0_1px_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-secondary/80 active:translate-y-[0.5px]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-1.5",
        sm: "h-8 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
