"use client";

import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "../lib/utils";
import { Spinner } from "./Spinner";

// The everyday button. Primary rises out of the surface as the lightest object on screen;
// secondary is a raised key of the surface itself; ghost has no surface until hovered; danger is
// secondary with a warning edge. Pressing sinks it a pixel and shrinks it 2%, nothing bigger.
// Loading swaps the label for a spinner but keeps the width, so the layout never jumps.
// Pass `href` and it renders a real link with the same look.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  /** Default "primary". */
  variant?: ButtonVariant;
  /** Height: 32, 40 or 48px. Default "md". */
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Keeps the width, swaps the label for a spinner, blocks clicks and sets aria-busy. */
  loading?: boolean;
  /** Square, for a single icon as children. Needs an aria-label. */
  iconOnly?: boolean;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { href?: undefined };
export type ButtonLinkProps = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & { href: string; disabled?: boolean };

const VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(
    "border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] text-neutral-950",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6),0_4px_10px_-2px_rgba(0,0,0,0.5)]",
    "hover:brightness-[1.04]",
    "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.22),0_1px_1px_rgba(0,0,0,0.5)]"
  ),
  secondary: cn(
    "border border-white/[0.08] border-t-white/[0.14] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)] text-neutral-200",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
    "hover:bg-[linear-gradient(180deg,#252527_0%,#1c1c1e_100%)] hover:text-white",
    "active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)]"
  ),
  ghost: cn(
    "border border-transparent bg-transparent text-neutral-300",
    "hover:border-white/[0.06] hover:bg-[#0c0c0d] hover:text-neutral-100",
    "active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]"
  ),
  danger: cn(
    "border border-white/[0.08] border-t-[rgb(229_115_115/0.4)] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)] text-[rgb(229_115_115)]",
    "shadow-[inset_0_1px_0_rgba(229,115,115,0.12),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
    "hover:bg-[linear-gradient(180deg,#252527_0%,#1c1c1e_100%)] hover:text-[rgb(240_140_140)]",
    "active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)]"
  ),
};

const SIZES: Record<ButtonSize, { box: string; square: string; icon: string; spinner: "sm" | "md" }> = {
  sm: { box: "h-8 gap-1.5 rounded-lg px-3 text-[13px]", square: "size-8 rounded-lg", icon: "[&_svg]:size-3.5", spinner: "sm" },
  md: { box: "h-10 gap-2 rounded-xl px-4 text-sm", square: "size-10 rounded-xl", icon: "[&_svg]:size-4", spinner: "md" },
  lg: { box: "h-12 gap-2.5 rounded-xl px-5 text-[15px]", square: "size-12 rounded-xl", icon: "[&_svg]:size-[18px]", spinner: "md" },
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | ButtonLinkProps>(function Button(
  props,
  ref
) {
  const {
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading = false,
    iconOnly = false,
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;
  const s = SIZES[size];
  const disabled = Boolean(rest.disabled) || loading;

  const classes = cn(
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center font-medium tracking-tight whitespace-nowrap select-none",
    "transition-[background,box-shadow,color,border-color,translate,scale,filter] duration-150",
    "active:translate-y-px active:scale-[0.98] motion-reduce:active:translate-y-0 motion-reduce:active:scale-100",
    "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
    iconOnly ? s.square : s.box,
    s.icon,
    VARIANTS[variant],
    fullWidth && "w-full",
    disabled && "pointer-events-none",
    disabled && !loading && "opacity-40",
    className
  );

  const content = (
    <>
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}>
        {leadingIcon && <span aria-hidden="true" className="inline-flex shrink-0">{leadingIcon}</span>}
        {children}
        {trailingIcon && <span aria-hidden="true" className="inline-flex shrink-0">{trailingIcon}</span>}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner size={s.spinner} label={null} className="text-current" />
        </span>
      )}
    </>
  );

  if (rest.href !== undefined) {
    const { disabled: _disabled, ...anchor } = rest as Omit<ButtonLinkProps, keyof ButtonOwnProps>;
    return (
      <a
        {...anchor}
        ref={ref as Ref<HTMLAnchorElement>}
        aria-disabled={disabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={disabled ? -1 : anchor.tabIndex}
        data-variant={variant}
        className={classes}
      >
        {content}
      </a>
    );
  }

  const { type = "button", ...button } = rest as Omit<ButtonProps, keyof ButtonOwnProps>;
  return (
    <button
      {...button}
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      className={classes}
    >
      {content}
    </button>
  );
});
