import type { ButtonHTMLAttributes, ReactNode } from "react";
import { memo } from "react";
import { UI_CONFIG } from "@/lib/config";

/**
 * Props for Button component.
 *
 * Extends standard HTML button attributes with variant support.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content (text, icons, or other elements) */
  children: ReactNode;
  /** Visual style variant (default: "primary") */
  variant?: "primary" | "secondary";
}

/**
 * A reusable button component with primary and secondary variants.
 *
 * This is a UI primitive component that provides consistent styling and behavior
 * across the application. It extends standard HTML button attributes and supports
 * two visual variants with configurable styling from UI_CONFIG.
 *
 * **Features:**
 * - Two visual variants (primary, secondary) with configurable styles
 * - Full HTML button attribute support via TypeScript extension
 * - Memoized for performance optimization
 * - Disabled state support with native HTML behavior
 * - Custom className support for additional styling
 *
 * @example
 * ```tsx
 * // Primary button (default)
 * <Button onClick={handleSubmit}>Submit</Button>
 *
 * // Secondary button
 * <Button variant="secondary" onClick={handleCancel}>
 *   Cancel
 * </Button>
 *
 * // Disabled button
 * <Button disabled onClick={handleAction}>
 *   Processing...
 * </Button>
 *
 * // With custom className
 * <Button className="w-full" onClick={handleClick}>
 *   Full Width Button
 * </Button>
 *
 * // Submit type
 * <Button type="submit" variant="primary">
 *   Save Changes
 * </Button>
 * ```
 */
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
