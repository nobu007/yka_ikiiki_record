import type { ButtonHTMLAttributes, ReactNode } from "react";
import { memo } from "react";
import { UI_CONFIG } from "@/lib/config";

/**
 * Button component - UI primitive for buttons
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export const Button = memo<ButtonProps>(
  ({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    type = "button",
    className = "",
    ...rest
  }) => {
    const baseClasses = UI_CONFIG.buttonStyles[variant];
    const combinedClasses = `${baseClasses} ${className}`.trim();

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        className={combinedClasses}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
