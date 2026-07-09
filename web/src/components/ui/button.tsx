import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "onDark";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-charcoal",
  secondary:
    "bg-transparent text-ink border border-hairline-strong hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-surface",
  onDark: "bg-on-primary text-primary hover:bg-hairline",
};

function buttonClasses(variant: ButtonVariant, className: string) {
  return `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  icon,
  className = "",
  children,
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {icon}
      {children}
    </Link>
  );
}
