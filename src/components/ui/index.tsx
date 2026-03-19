import React, { memo } from "react";
import { UI_CONFIG } from "@/lib/config";

/**
 * Button component - UI primitive for buttons
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
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
