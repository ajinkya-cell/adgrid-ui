"use client";
import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export type ButtonVariant = "default" | "outline" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants = {
  default: "bg-white text-black hover:bg-white/90",
  outline: "border border-white/20 text-white hover:border-white/40 hover:bg-white/5",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  ghost: "text-white hover:bg-white/10",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-sm transition-colors duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
